import type { VirtualFS } from '../lib/vfs'
import { detectCorruptWrite } from './decisions'

/** Minimum size for a real HTML page/app. */
export const MIN_HTML_CHARS = 800
/** Games need more substance (loop + input + HUD). */
export const MIN_GAME_CHARS = 1800

export type GoalKind = 'chat' | 'build' | 'html' | 'game'

export interface HtmlQuality {
  hasDoctypeOrHtml: boolean
  hasBody: boolean
  hasScriptOrCanvas: boolean
  looksLikeStub: boolean
  /** Game-oriented signals — only meaningful when goal is a game. */
  hasCanvas: boolean
  hasAnimationLoop: boolean
  hasKeyboard: boolean
  hasPointer: boolean
}

export interface RunEvidence {
  writes: number
  writeChars: number
  totalWriteChars: number
  mkdirs: number
  previews: number
  bostonContextCalls: number
  writtenPaths: string[]
  htmlPaths: string[]
  lastCorrupt: string | null
  lastHtmlQuality: HtmlQuality | null
  lastHtmlPath: string | null
}

export function emptyEvidence(): RunEvidence {
  return {
    writes: 0,
    writeChars: 0,
    totalWriteChars: 0,
    mkdirs: 0,
    previews: 0,
    bostonContextCalls: 0,
    writtenPaths: [],
    htmlPaths: [],
    lastCorrupt: null,
    lastHtmlQuality: null,
    lastHtmlPath: null,
  }
}

export function isBuildGoal(goal: string): boolean {
  return classifyGoal(goal) !== 'chat'
}

export function wantsFreshBuild(goal: string): boolean {
  return /\b(new|fresh|from scratch|brand new|start over|scratch)\b/i.test(goal)
}

export function isGameGoal(goal: string): boolean {
  return classifyGoal(goal) === 'game'
}

export function isHtmlBuild(goal: string): boolean {
  const kind = classifyGoal(goal)
  return kind === 'html' || kind === 'game'
}

/** Prefer boston_context when the goal is clearly local-flavor. */
export function wantsBostonFlavor(goal: string): boolean {
  return /\b(boston|harbor|mbta|\bt\b|red line|orange line|green line|fenway|seaport|cambridge|somerville|citgo|freedom trail|kenmore|back bay|north end)\b/i.test(
    goal,
  )
}

/**
 * Classify the operator goal so gates can scale requirements.
 * Games ⊂ HTML builds ⊂ builds; chat is everything else.
 */
export function classifyGoal(goal: string): GoalKind {
  const g = goal.trim()
  if (!g) return 'chat'

  if (
    /\b(game|arcade|snake|runner|tetris|pong|shooter|platformer|endless|playable|high[\s-]?score)\b/i.test(
      g,
    )
  ) {
    return 'game'
  }

  if (
    /\b(html|css|webpage|web page|landing|website|site|canvas|page|quiz|trivia|clock|widget|ui|dashboard|form)\b/i.test(
      g,
    )
  ) {
    return 'html'
  }

  if (
    /\b(build|create|make|write|code|app|component|react|script|implement|ship|prototype)\b/i.test(g)
  ) {
    return 'build'
  }

  return 'chat'
}

export function inspectHtml(content: string): HtmlQuality {
  const c = content
  const lower = c.toLowerCase()
  const hasDoctypeOrHtml = /<!doctype\s+html|<html[\s>]/i.test(c)
  const hasBody = /<body[\s>]/i.test(c)
  const hasCanvas = /<canvas[\s>]|getcontext\s*\(\s*['"]2d['"]/i.test(c)
  const hasScriptOrCanvas =
    hasCanvas || /<script[\s>]|addEventListener|onclick\s*=/i.test(c)
  const hasAnimationLoop =
    /requestAnimationFrame|setInterval\s*\(/i.test(c)
  const hasKeyboard =
    /keydown|keyup|keypress|keyboard|wasd|arrowleft|arrowright|arrowup|arrowdown|\.key\b/i.test(c)
  const hasPointer =
    /pointerdown|pointerup|mousedown|mouseup|click|touchstart|mousemove/i.test(c)

  // Stub heuristic: tiny interactive surface — mostly chrome, almost no logic.
  const scriptBodies = [...c.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => m[1] ?? '')
    .join('\n')
  const inlineLogicChars = scriptBodies.replace(/\s+/g, '').length
  const looksLikeStub =
    c.trim().length < MIN_HTML_CHARS ||
    (hasDoctypeOrHtml &&
      !hasCanvas &&
      inlineLogicChars < 200 &&
      !/<form[\s>]|<input[\s>]|<button[\s>]/i.test(c) &&
      (lower.match(/<h1[\s>]/g) ?? []).length <= 1 &&
      !hasAnimationLoop)

  return {
    hasDoctypeOrHtml,
    hasBody,
    hasScriptOrCanvas,
    looksLikeStub,
    hasCanvas,
    hasAnimationLoop,
    hasKeyboard,
    hasPointer,
  }
}

export function recordWrite(evidence: RunEvidence, path: string, content: string): void {
  evidence.writes += 1
  evidence.writeChars = Math.max(evidence.writeChars, content.length)
  evidence.totalWriteChars += content.length
  if (!evidence.writtenPaths.includes(path)) evidence.writtenPaths.push(path)

  const isHtmlPath = /\.html?$/i.test(path) || /index\.html$/i.test(path)
  const looksHtml = /<!doctype\s+html|<html[\s>]/i.test(content)
  if (isHtmlPath || looksHtml) {
    if (!evidence.htmlPaths.includes(path)) evidence.htmlPaths.push(path)
    evidence.lastHtmlPath = path
    evidence.lastHtmlQuality = inspectHtml(content)
  }

  evidence.lastCorrupt = detectCorruptWrite(content)
}

export function recordBostonContext(evidence: RunEvidence): void {
  evidence.bostonContextCalls += 1
}

function minCharsFor(goal: string): number {
  return isGameGoal(goal) ? MIN_GAME_CHARS : MIN_HTML_CHARS
}

function claimsCompletion(message: string): boolean {
  return (
    /\b(already|done|complete|finished|built|ready|launched|here it is|shipped|preview is up|you can play|all set)\b/i.test(
      message,
    ) || message.length > 40
  )
}

function missingGameControls(q: HtmlQuality | null): string | null {
  if (!q) return 'No HTML artifact inspected yet'
  const missing: string[] = []
  if (!q.hasAnimationLoop) missing.push('requestAnimationFrame (or setInterval) game loop')
  if (!q.hasKeyboard) missing.push('keyboard input (WASD / arrows / space)')
  if (!q.hasPointer) missing.push('pointer/mouse/touch input')
  if (!q.hasCanvas && !q.hasScriptOrCanvas) missing.push('canvas or interactive script surface')
  if (missing.length === 0) return null
  return missing.join('; ')
}

function qualityNudge(goal: string, evidence: RunEvidence, mode: 'reject' | 'playbook'): string | null {
  if (!isHtmlBuild(goal)) return null
  const q = evidence.lastHtmlQuality
  const path = evidence.lastHtmlPath ?? evidence.htmlPaths[0] ?? 'the HTML file'
  const prefix = mode === 'reject' ? 'COMPLETION REJECTED' : 'BUILD PLAYBOOK'

  if (!q) {
    if (evidence.htmlPaths.length === 0 && evidence.writes > 0) {
      return [
        `${prefix}: Wrote files but none look like HTML.`,
        `Write a real ${path.endsWith('.html') ? path : 'index.html'} with <!DOCTYPE html>, then preview_html.`,
        mode === 'reject' ? 'Do NOT return type=message yet.' : 'Return a type=tool decision now.',
      ].join(' ')
    }
    return null
  }

  if (!q.hasDoctypeOrHtml || !q.hasBody) {
    return [
      `${prefix}: "${path}" is missing a proper HTML document shell (<!DOCTYPE html> + <html>/<body>).`,
      'Rewrite with write_file as a complete document.',
      mode === 'reject' ? 'Do NOT return type=message yet.' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (isGameGoal(goal)) {
    const gap = missingGameControls(q)
    if (gap) {
      return [
        `${prefix}: Game is not playable yet — missing: ${gap}.`,
        'Expand the SAME file: focus the canvas/body for keys, handle pointer events, use requestAnimationFrame.',
        mode === 'reject' ? 'Do NOT return type=message yet.' : 'Return a type=tool decision now.',
      ].join(' ')
    }
  }

  if (q.looksLikeStub && evidence.writeChars < minCharsFor(goal) * 1.5) {
    return [
      `${prefix}: Artifact looks like a stub title page, not a working build.`,
      'Expand with real UI/logic via write_file — not a single headline.',
      mode === 'reject' ? 'Do NOT return type=message yet.' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  return null
}

/** Honest-builds gate (Dino v0.5.71 spirit): refuse "done" without this-run authorship. */
export function falseCompleteNudge(goal: string, evidence: RunEvidence, message: string): string | null {
  if (!isBuildGoal(goal)) return null
  if (!claimsCompletion(message)) return null

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

  const need = minCharsFor(goal)
  if (isHtmlBuild(goal) && evidence.writeChars < need) {
    return [
      `COMPLETION REJECTED: Largest write was only ~${evidence.writeChars} chars (need ~${need}+ for a real ${
        isGameGoal(goal) ? 'game' : 'page/app'
      }).`,
      'Expand the SAME file with write_file. Do NOT return type=message yet.',
    ].join(' ')
  }

  const quality = qualityNudge(goal, evidence, 'reject')
  if (quality) return quality

  if (isHtmlBuild(goal) && evidence.previews === 0) {
    return [
      'COMPLETION REJECTED: Files were written but nothing was previewed.',
      'Call preview_html on the main HTML path so the operator can see it.',
      'Do NOT return type=message yet.',
    ].join(' ')
  }

  return null
}

/**
 * Progressive playbook: mkdir → write (substantial, quality) → preview.
 * Also soft-nudges Boston flavor when the goal is clearly local.
 */
export function buildPlaybookNudge(goal: string, evidence: RunEvidence, vfs: VirtualFS): string | null {
  if (!isBuildGoal(goal)) return null

  if (evidence.mkdirs === 0 && evidence.writes === 0) {
    const flavor = wantsBostonFlavor(goal)
      ? ' Optional first: boston_context for local color, then mkdir.'
      : ''
    return [
      'BUILD PLAYBOOK: Start with mkdir for a project folder (e.g. /apps/my-app),',
      'then write_file for index.html (or source files), then preview_html.',
      flavor,
      'Return a type=tool decision now.',
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (
    wantsBostonFlavor(goal) &&
    evidence.bostonContextCalls === 0 &&
    evidence.writes === 0 &&
    evidence.mkdirs > 0
  ) {
    return [
      'BUILD PLAYBOOK: Goal is Boston-flavored.',
      'Call boston_context once for local detail (MBTA / harbor / neighborhoods), then write_file.',
      'Return a type=tool decision now.',
    ].join(' ')
  }

  if (evidence.writes === 0) {
    return [
      'BUILD PLAYBOOK INCOMPLETE: Folder may exist but no files written.',
      'Use write_file with a complete, working artifact — not a stub title page.',
      wantsFreshBuild(goal)
        ? 'FRESH BUILD: use a new path under /apps/, do not overwrite an unrelated prior project.'
        : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  if (evidence.lastCorrupt) {
    return `BUILD PLAYBOOK: Fix corrupt write (${evidence.lastCorrupt}) with write_file before continuing.`
  }

  const need = minCharsFor(goal)
  if (isHtmlBuild(goal) && evidence.writeChars < need) {
    return [
      `BUILD PLAYBOOK: Artifact too thin (~${evidence.writeChars} chars; need ~${need}+).`,
      isGameGoal(goal)
        ? 'Expand with write_file: game loop, HUD/score, keyboard + pointer controls.'
        : 'Expand with write_file until the page is a complete working artifact.',
    ].join(' ')
  }

  const quality = qualityNudge(goal, evidence, 'playbook')
  if (quality) return quality

  if (isHtmlBuild(goal) && evidence.previews === 0) {
    const path = evidence.htmlPaths[0] ?? evidence.lastHtmlPath ?? guessHtml(vfs)
    return `BUILD PLAYBOOK: Call preview_html on "${path}" so the operator can review the result.`
  }

  return null
}

/**
 * Soft mid-run hint after a successful tool — keeps the loop on the critical path
 * without hard-rejecting (used when the model would otherwise stall).
 */
export function nextStepHint(goal: string, evidence: RunEvidence, vfs: VirtualFS): string | null {
  if (!isBuildGoal(goal)) return null

  if (evidence.writes === 0) {
    if (evidence.mkdirs === 0) {
      return wantsBostonFlavor(goal)
        ? 'NEXT: mkdir a project folder (optional: boston_context first for local color), then write_file.'
        : 'NEXT: mkdir a project folder, then write_file the main artifact.'
    }
    if (wantsBostonFlavor(goal) && evidence.bostonContextCalls === 0) {
      return 'NEXT: call boston_context once for local detail, then write_file the main artifact.'
    }
    return 'NEXT: write_file the main artifact (complete HTML/app — not a stub).'
  }

  if (evidence.lastCorrupt) {
    return `NEXT: rewrite the corrupt file (${evidence.lastCorrupt}) with write_file.`
  }

  const need = minCharsFor(goal)
  if (isHtmlBuild(goal) && evidence.writeChars < need) {
    return `NEXT: expand the artifact with write_file (still under ~${need} chars).`
  }

  if (isGameGoal(goal)) {
    const gap = missingGameControls(evidence.lastHtmlQuality)
    if (gap) return `NEXT: make it playable — add ${gap}.`
  }

  if (isHtmlBuild(goal) && evidence.previews === 0) {
    const path = evidence.htmlPaths[0] ?? evidence.lastHtmlPath ?? guessHtml(vfs)
    return `NEXT: preview_html on "${path}".`
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

/** One-line phase label for status UI / telemetry. */
export function playbookPhase(goal: string, evidence: RunEvidence): string {
  if (!isBuildGoal(goal)) return 'chat'
  if (evidence.writes === 0) return evidence.mkdirs === 0 ? 'scaffold' : 'author'
  if (evidence.lastCorrupt) return 'repair'
  if (isHtmlBuild(goal) && evidence.writeChars < minCharsFor(goal)) return 'expand'
  if (isGameGoal(goal) && missingGameControls(evidence.lastHtmlQuality)) return 'playable'
  if (isHtmlBuild(goal) && evidence.previews === 0) return 'preview'
  return 'ship'
}
