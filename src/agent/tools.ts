import { z } from 'zod'
import { bostonContext } from './boston'
import type { ToolName } from './decisions'
import type { RunEvidence } from './playbook'
import { recordWrite } from './playbook'
import { redactSecrets } from '../lib/secrets'
import { PathError, VirtualFS, normalizeVfsPath } from '../lib/vfs'

export interface ToolResult {
  ok: boolean
  summary: string
  previewHtml?: string
  previewPath?: string
}

const writeSchema = z.object({
  path: z.string().min(1).max(512),
  content: z.string().max(1_500_000),
})
const pathSchema = z.object({ path: z.string().min(1).max(512).optional() })
const previewSchema = z.object({ path: z.string().min(1).max(512) })
const bostonSchema = z.object({ query: z.string().min(1).max(500) })
const fetchSchema = z.object({ url: z.string().url().max(2000) })

function blockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === '0.0.0.0' || h === '::1') return true
  // Basic private / link-local / metadata ranges (hostname may be IP literal)
  if (/^(10\.|127\.|169\.254\.|192\.168\.|0\.|100\.64\.)/.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true
  if (h === 'metadata.google.internal') return true
  return false
}

export async function executeTool(input: {
  tool: ToolName
  args: Record<string, unknown>
  vfs: VirtualFS
  evidence: RunEvidence
  allowNetworkFetch: boolean
}): Promise<ToolResult> {
  const { tool, args, vfs, evidence, allowNetworkFetch } = input

  try {
    switch (tool) {
      case 'list_files': {
        const { path } = pathSchema.parse(args)
        const p = path ? normalizeVfsPath(path) : '/'
        return { ok: true, summary: redactSecrets(vfs.tree(p)) }
      }
      case 'read_file': {
        const { path } = previewSchema.parse(args)
        const content = vfs.readFile(path)
        return { ok: true, summary: redactSecrets(content.slice(0, 40_000)) }
      }
      case 'mkdir': {
        const { path } = previewSchema.parse(args)
        vfs.mkdir(path)
        evidence.mkdirs += 1
        return { ok: true, summary: `Created directory ${normalizeVfsPath(path)}` }
      }
      case 'write_file': {
        const { path, content } = writeSchema.parse(args)
        if (/(api[_-]?key|secret|password|token)/i.test(path) && /sk-/.test(content)) {
          return { ok: false, summary: 'Refused: looks like a secrets file with an API key.' }
        }
        if (/\b(sk-[a-zA-Z0-9_-]{12,}|AIza[0-9A-Za-z_-]{20,})\b/.test(content)) {
          return { ok: false, summary: 'Refused: content appears to contain an API key. Do not store keys in the VFS.' }
        }
        vfs.writeFile(path, content)
        recordWrite(evidence, normalizeVfsPath(path), content)
        return {
          ok: true,
          summary: `Wrote ${normalizeVfsPath(path)} (${content.length} chars)`,
        }
      }
      case 'preview_html': {
        const { path } = previewSchema.parse(args)
        const content = vfs.readFile(path)
        if (!/<html|<!doctype html/i.test(content) && !/\.html?$/i.test(path)) {
          return { ok: false, summary: 'File does not look like HTML. Write an .html document first.' }
        }
        evidence.previews += 1
        return {
          ok: true,
          summary: `Preview ready: ${normalizeVfsPath(path)}`,
          previewHtml: content,
          previewPath: normalizeVfsPath(path),
        }
      }
      case 'boston_context': {
        const { query } = bostonSchema.parse(args)
        return { ok: true, summary: bostonContext(query) }
      }
      case 'fetch_url': {
        if (!allowNetworkFetch) {
          return {
            ok: false,
            summary: 'fetch_url disabled. Operator must enable “Allow network fetch” in settings.',
          }
        }
        const { url } = fetchSchema.parse(args)
        const u = new URL(url)
        if (u.protocol !== 'https:') {
          return { ok: false, summary: 'Only https:// URLs are allowed.' }
        }
        if (blockedHost(u.hostname)) {
          return { ok: false, summary: 'Blocked host (private/metadata/localhost).' }
        }
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 12_000)
        try {
          const res = await fetch(u.toString(), {
            method: 'GET',
            signal: controller.signal,
            redirect: 'error',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
          })
          const text = await res.text()
          const clipped = text.slice(0, 12_000)
          return {
            ok: res.ok,
            summary: redactSecrets(`HTTP ${res.status}\n${clipped}`),
          }
        } finally {
          clearTimeout(timer)
        }
      }
      default:
        return { ok: false, summary: `Unknown tool: ${tool}` }
    }
  } catch (err) {
    const msg = err instanceof PathError || err instanceof z.ZodError
      ? err.message
      : err instanceof Error
        ? err.message
        : 'Tool failed'
    return { ok: false, summary: redactSecrets(msg) }
  }
}
