import type { FileDiff } from '../lib/diff'

const MARKERS = { add: '+', del: '−', ctx: ' ', gap: '' } as const

export function DiffView({ diff }: { diff: FileDiff }) {
  return (
    <div className="diff">
      <div className="diff__stats">
        {diff.isNewFile && <span className="diff__badge">new file</span>}
        <span className="diff__added">+{diff.added}</span>
        <span className="diff__removed">−{diff.removed}</span>
      </div>
      <pre className="diff__lines">
        {diff.lines.map((line, i) => (
          <span key={i} className={`diff__line diff__line--${line.op}`}>
            {MARKERS[line.op]} {line.text}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  )
}
