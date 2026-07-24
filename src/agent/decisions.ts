import { z } from 'zod'

export const TOOL_NAMES = [
  'list_files',
  'read_file',
  'write_file',
  'mkdir',
  'preview_html',
  'boston_context',
  'fetch_url',
] as const

export type ToolName = (typeof TOOL_NAMES)[number]

export const decisionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('tool'),
    tool: z.enum(TOOL_NAMES),
    reason: z.string().min(1).max(2000),
    args: z.record(z.string(), z.unknown()).default({}),
  }),
  z.object({
    type: z.literal('message'),
    message: z.string().min(1).max(20_000),
  }),
])

export type Decision = z.infer<typeof decisionSchema>

export function parseDecision(raw: string): Decision {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const direct = parseCandidate(cleaned)
  if (direct) return direct

  let last: Decision | null = null
  for (const candidate of extractJsonObjects(cleaned)) {
    const parsed = parseCandidate(candidate)
    if (parsed) last = parsed
  }
  if (last) return last

  return {
    type: 'message',
    message: cleaned || 'Model returned an invalid structured response.',
  }
}

function parseCandidate(candidate: string): Decision | null {
  if (!candidate) return null
  try {
    return decisionSchema.parse(JSON.parse(candidate) as unknown)
  } catch {
    return null
  }
}

function extractJsonObjects(input: string): string[] {
  const candidates: string[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') {
      if (depth === 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start >= 0) {
        candidates.push(input.slice(start, i + 1))
        start = -1
      }
    }
  }
  return candidates
}

export function detectLeakedToolCall(message: string): boolean {
  return (
    /"type"\s*:\s*"tool"/.test(message) ||
    /"tool"\s*:\s*"write_file"/.test(message) ||
    /```json[\s\S]*"type"\s*:\s*"tool"/.test(message)
  )
}

export function detectCorruptWrite(content: string): string | null {
  if (!content || content.trim().length < 20) return 'File is nearly empty'
  if (/TODO:\s*finish|ABORT WRITE|CONTENT TRUNCATED|<\.?tool/i.test(content)) {
    return 'Write looks abandoned or truncated'
  }
  if ((content.match(/\uFFFD/g) ?? []).length > 3) return 'Replacement characters suggest corruption'
  // Mid-stream JSON tool call leaked into file body
  if (/"type"\s*:\s*"tool"/.test(content) && content.includes('write_file')) {
    return 'Tool JSON leaked into file contents'
  }
  return null
}
