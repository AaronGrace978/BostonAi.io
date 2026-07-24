import type { VirtualFS } from '../lib/vfs'
import { detectCorruptWrite } from './decisions'

export const MIN_HTML_CHARS = 800

export interface RunEvidence {
  writes: number
  writeChars: number
  mkdirs: number
  previews: number
  htmlPaths: string[]
  lastCorrupt: string | null
}

export function emptyEvidence(): RunEvidence {
  return {
    writes: 0,
    writeChars: 0,
    mkdirs: 0,
    previews: 0,
    htmlPaths: [],
    lastCorrupt: null,
  }
}

export function isBuildGoal(goal: string): boolean {
  return /\b(build|create|make|write|code|app|game|site|page|component|html|css|react|script)\b/i.test(
    goal,
  )
}

export function wantsFreshBuild(goal: string): boolean {
  return /\b(new|fresh|from scratch|brand new|start over)\b/i.test(goal)
}

export function isHtmlBuild(goal: string): boolean {
  return /\b(html|css|game|webpage|web page|landing|site|canvas)\b/i.test(goal) || isBuildGoal(goal)
}

export function recordWrite(evidence: RunEvidence, path: string, content: string): void {
  evidence.writes += 1
  evidence.writeChars = Math.max(evidence.writeChars, content.length)
  if (/\.html?$/i.test(path) || /index\.html$/i.test(path)) {
    if (!evidence.htmlPaths.includes(path)) evidence.htmlPaths.push(path)
  }
  evidence.lastCorrupt = detectCorruptWrite(content)
}

/** Honest-builds gate (Dino v0.5.71 spirit): refuse "done" without this-run authorship. */
export function falseCompleteNudge(goal: string, evidence: RunEvidence, message: string): string | null {
  const claimsDone =
    /\b(already|done|complete|finished|built|ready|launched|here it is)\b/i.test(message) ||
    message.length > 40

  if (!isBuildGoal(goal)) return null
  if (!claimsDone) return null

  if (evidence.writes === 0) {
    return [
      'COMPLETION REJECTED (honest builds): You claimed progress but wrote ZERO files in THIS run.',
      'Reopening old context or describing a build is not success.',
      'Use mkdir (if needed) → write_file with real code → preview_html.',
      'Do NOT return type=message until files exist in the VFS.',
    ].join(' ')
  }

  if (evidence.lastCorrupt) {
    return [
      `COMPLETION REJECTED: Last write looked corrupt (${evidence.lastCorrupt}).`,
      'Rewrite the file with write_file, then preview_html. Do NOT return type=message yet.',
    ].join(' ')
  }

  if (isHtmlBuild(goal) && evidence.writeChars < MIN_HTML_CHARS) {
    return [
      `COMPLETION REJECTED: Largest write was only ~${evidence.writeChars} chars (need ~${MIN_HTML_CHARS}+ for a real page/app).`,
      'Expand the SAME file with write_file. Do NOT return type=message yet.',
    ].join(' ')
  }

  if (isHtmlBuild(goal) && evidence.previews === 0) {
    return [
      'COMPLETION REJECTED: Files were written but nothing was previewed.',
      'Call preview_html on the main HTML path so the operator can see it.',
      'Do NOT return type=message yet.',
    ].join(' ')
  }

  return null
}

export function buildPlaybookNudge(goal: string, evidence: RunEvidence, vfs: VirtualFS): string | null {
  if (!isBuildGoal(goal)) return null

  if (evidence.mkdirs === 0 && evidence.writes === 0) {
    return [
      'BUILD PLAYBOOK: Start with mkdir for a project folder (e.g. /apps/my-app),',
      'then write_file for index.html (or source files), then preview_html.',
      'Return a type=tool decision now.',
    ].join(' ')
  }

  if (evidence.writes === 0) {
    return [
      'BUILD PLAYBOOK INCOMPLETE: Folder may exist but no files written.',
      'Use write_file with a complete, working artifact — not a stub title page.',
    ].join(' ')
  }

  if (evidence.lastCorrupt) {
    return `BUILD PLAYBOOK: Fix corrupt write (${evidence.lastCorrupt}) with write_file before continuing.`
  }

  if (isHtmlBuild(goal) && evidence.writeChars < MIN_HTML_CHARS) {
    return `BUILD PLAYBOOK: Artifact too thin (~${evidence.writeChars} chars). Expand with write_file.`
  }

  if (isHtmlBuild(goal) && evidence.previews === 0) {
    const path = evidence.htmlPaths[0] ?? guessHtml(vfs)
    return `BUILD PLAYBOOK: Call preview_html on "${path}" so the operator can review the result.`
  }

  return null
}

function guessHtml(vfs: VirtualFS): string {
  const html = vfs.listFiles().find(f => /\.html?$/i.test(f.path))
  return html?.path ?? '/index.html'
}

export function leakedToolNudge(): string {
  return [
    'PROTOCOL ERROR: Your previous message leaked tool JSON into a type=message reply.',
    'Reply with ONE JSON object only.',
    'If you need to act: {"type":"tool","tool":"write_file","reason":"...","args":{"path":"/apps/x/index.html","content":"..."}}',
    'If truly done after evidence: {"type":"message","message":"..."}',
  ].join(' ')
}
