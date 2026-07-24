/**
 * Lightweight gate regression tests (no LLM).
 * Run: npm run test:playbook
 */
import assert from 'node:assert/strict'
import {
  emptyEvidence,
  falseCompleteNudge,
  recordWrite,
  buildPlaybookNudge,
} from '../src/agent/playbook.ts'
import { detectLeakedToolCall, parseDecision } from '../src/agent/decisions.ts'
import { VirtualFS } from '../src/lib/vfs.ts'
import { redactSecrets } from '../src/lib/secrets.ts'

const goal = 'Build a new HTML game about the T'

{
  const evidence = emptyEvidence()
  const nudge = falseCompleteNudge(goal, evidence, 'Already built — opening the old project.')
  assert.ok(nudge && /honest builds/i.test(nudge), 'rejects false already-built')
}

{
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/t/index.html', 'x'.repeat(1200))
  const nudge = falseCompleteNudge(goal, evidence, 'Done!')
  assert.ok(nudge && /preview/i.test(nudge), 'requires preview after write')
}

{
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/t/index.html', 'x'.repeat(1200))
  evidence.previews = 1
  assert.equal(falseCompleteNudge(goal, evidence, 'Shipped the harbor game.'), null)
}

{
  const vfs = new VirtualFS()
  const evidence = emptyEvidence()
  const nudge = buildPlaybookNudge(goal, evidence, vfs)
  assert.ok(nudge && /mkdir/i.test(nudge))
}

{
  assert.ok(detectLeakedToolCall('{"type":"tool","tool":"write_file"}'))
  const d = parseDecision('```json\n{"type":"message","message":"hi"}\n```')
  assert.equal(d.type, 'message')
}

{
  assert.match(redactSecrets('key sk-abc1234567890xyz'), /REDACTED/)
}

{
  const vfs = new VirtualFS()
  assert.throws(() => vfs.writeFile('../etc/passwd', 'no'), /traversal|Absolute|Illegal/i)
}

console.log('test-playbook: ok')
