import type { ReactNode } from 'react'

/**
 * A small, safe markdown renderer for model replies: headings, paragraphs, lists, tables,
 * fenced code, inline code, bold and italics. It builds React elements only, never HTML strings.
 */

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const k = `${key}-${i++}`
    if (t.startsWith('`')) out.push(<code key={k}>{t.slice(1, -1)}</code>)
    else if (t.startsWith('**')) out.push(<strong key={k}>{t.slice(2, -2)}</strong>)
    else out.push(<em key={k}>{t.slice(1, -1)}</em>)
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let b = 0
  while (i < lines.length) {
    const line = lines[i]
    const key = `b${b++}`
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      i++
      blocks.push(
        <pre key={key} className="md-code" data-lang={lang || undefined}>
          <code>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      blocks.push(
        <p key={key} className={`md-h md-h${h[1].length}`}>
          {inline(h[2], key)}
        </p>,
      )
      i++
      continue
    }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      const head = cells(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]))
      blocks.push(
        <div key={key} className="md-table">
          <table>
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th key={j}>{inline(c, `${key}h${j}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (
                    <td key={j}>{inline(c, `${key}r${ri}${j}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items: string[] = []
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''))
      const List = ordered ? 'ol' : 'ul'
      blocks.push(
        <List key={key}>
          {items.map((t, j) => (
            <li key={j}>{inline(t, `${key}l${j}`)}</li>
          ))}
        </List>,
      )
      continue
    }
    if (/^\s*>/.test(line)) {
      blocks.push(<blockquote key={key}>{inline(line.replace(/^\s*>\s?/, ''), key)}</blockquote>)
      i++
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*([-*]|\d+\.)\s+|\s*>|\s*\|)/.test(lines[i])) para.push(lines[i++])
    if (!para.length) para.push(lines[i++])
    blocks.push(<p key={key}>{inline(para.join(' '), key)}</p>)
  }
  return <>{blocks}</>
}
