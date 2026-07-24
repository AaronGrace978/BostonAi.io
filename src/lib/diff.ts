/** Dependency-free line diff for showing what the agent changed in a file. */

export interface DiffLine {
  op: 'add' | 'del' | 'ctx' | 'gap'
  text: string
}

const MAX_CELLS = 4_000_000
const CONTEXT = 2
const MAX_OUTPUT_LINES = 80

function splitLines(text: string): string[] {
  if (text === '') return []
  return text.split('\n')
}

/** Full LCS line diff; null when the inputs are too large to diff cheaply. */
function rawDiff(before: string[], after: string[]): DiffLine[] | null {
  if ((before.length + 1) * (after.length + 1) > MAX_CELLS) return null

  // Trim common head/tail so the DP table only covers the changed middle.
  let start = 0
  while (start < before.length && start < after.length && before[start] === after[start]) start++
  let endB = before.length
  let endA = after.length
  while (endB > start && endA > start && before[endB - 1] === after[endA - 1]) {
    endB--
    endA--
  }

  const b = before.slice(start, endB)
  const a = after.slice(start, endA)
  const rows = b.length + 1
  const cols = a.length + 1
  const table = new Uint32Array(rows * cols)
  for (let i = b.length - 1; i >= 0; i--) {
    for (let j = a.length - 1; j >= 0; j--) {
      table[i * cols + j] =
        b[i] === a[j]
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1])
    }
  }

  const out: DiffLine[] = []
  for (let k = 0; k < start; k++) out.push({ op: 'ctx', text: before[k] })
  let i = 0
  let j = 0
  while (i < b.length && j < a.length) {
    if (b[i] === a[j]) {
      out.push({ op: 'ctx', text: b[i] })
      i++
      j++
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      out.push({ op: 'del', text: b[i] })
      i++
    } else {
      out.push({ op: 'add', text: a[j] })
      j++
    }
  }
  while (i < b.length) out.push({ op: 'del', text: b[i++] })
  while (j < a.length) out.push({ op: 'add', text: a[j++] })
  for (let k = endB; k < before.length; k++) out.push({ op: 'ctx', text: before[k] })
  return out
}

/** Collapse long unchanged runs and cap total output so the feed stays readable. */
function compact(lines: DiffLine[]): DiffLine[] {
  const keep = new Array<boolean>(lines.length).fill(false)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].op === 'ctx') continue
    for (let k = Math.max(0, i - CONTEXT); k <= Math.min(lines.length - 1, i + CONTEXT); k++) {
      keep[k] = true
    }
  }

  const out: DiffLine[] = []
  let skipped = 0
  const flushGap = () => {
    if (skipped > 0) {
      out.push({ op: 'gap', text: `… ${skipped} unchanged line${skipped === 1 ? '' : 's'}` })
      skipped = 0
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (keep[i]) {
      flushGap()
      out.push(lines[i])
    } else {
      skipped++
    }
  }
  flushGap()

  if (out.length > MAX_OUTPUT_LINES) {
    const hidden = out.length - MAX_OUTPUT_LINES
    return [
      ...out.slice(0, MAX_OUTPUT_LINES),
      { op: 'gap', text: `… ${hidden} more diff line${hidden === 1 ? '' : 's'} truncated` },
    ]
  }
  return out
}

export interface FileDiff {
  lines: DiffLine[]
  added: number
  removed: number
  isNewFile: boolean
}

/** Diff a file rewrite for display. Returns null when nothing changed or inputs are too big. */
export function diffFile(before: string, after: string): FileDiff | null {
  if (before === after) return null
  const raw = rawDiff(splitLines(before), splitLines(after))
  if (!raw) return null
  const added = raw.filter(l => l.op === 'add').length
  const removed = raw.filter(l => l.op === 'del').length
  if (added === 0 && removed === 0) return null
  return {
    lines: compact(raw),
    added,
    removed,
    isNewFile: before === '',
  }
}
