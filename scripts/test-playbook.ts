/**
 * Lightweight gate regression tests (no LLM).
 * Run: npm run test:playbook
 */
import assert from 'node:assert/strict'
import {
  classifyGoal,
  emptyEvidence,
  falseCompleteNudge,
  recordWrite,
  recordBostonContext,
  buildPlaybookNudge,
  nextStepHint,
  playbookPhase,
  inspectHtml,
  isHtmlBuild,
  isGameGoal,
  wantsBostonFlavor,
  MIN_GAME_CHARS,
  MIN_HTML_CHARS,
} from '../src/agent/playbook.ts'
import { detectLeakedToolCall, parseDecision } from '../src/agent/decisions.ts'
import { VirtualFS } from '../src/lib/vfs.ts'
import { redactSecrets } from '../src/lib/secrets.ts'

const goal = 'Build a new HTML game about the T'
const pageGoal = 'Build a synthwave landing page for a Boston netrunner collective'
const chatGoal = 'What neighborhood is Fenway in?'

{
  assert.equal(classifyGoal(goal), 'game')
  assert.equal(classifyGoal(pageGoal), 'html')
  assert.equal(classifyGoal(chatGoal), 'chat')
  assert.equal(classifyGoal('Implement a React component for settings'), 'build')
  assert.ok(isGameGoal(goal))
  assert.ok(isHtmlBuild(goal))
  assert.ok(isHtmlBuild(pageGoal))
  assert.equal(isHtmlBuild('Implement a React component for settings'), false)
  assert.ok(wantsBostonFlavor(goal))
  assert.ok(wantsBostonFlavor(pageGoal))
}

{
  const evidence = emptyEvidence()
  const nudge = falseCompleteNudge(goal, evidence, 'Already built — opening the old project.')
  assert.ok(nudge && /honest builds/i.test(nudge), 'rejects false already-built')
}

{
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/t/index.html', 'x'.repeat(1200))
  const nudge = falseCompleteNudge(goal, evidence, 'Done!')
  assert.ok(nudge && /~1800|playable|thin|chars/i.test(nudge ?? ''), 'games need more than page minimum')
}

{
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/t/index.html', 'x'.repeat(MIN_GAME_CHARS + 50))
  const nudge = falseCompleteNudge(goal, evidence, 'Done!')
  assert.ok(nudge && /(playable|DOCTYPE|HTML|stub|preview)/i.test(nudge ?? ''), 'rejects non-HTML blob for game')
}

{
  const evidence = emptyEvidence()
  const html = `<!DOCTYPE html><html><body><h1>Hi</h1></body></html>`
  recordWrite(evidence, '/apps/page/index.html', html)
  const nudge = falseCompleteNudge(pageGoal, evidence, 'Finished the landing page.')
  assert.ok(nudge && /chars|stub|thin/i.test(nudge ?? ''), 'rejects thin landing page')
}

{
  const playable = `<!DOCTYPE html><html><body>
<canvas id="c" width="640" height="360"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.tabIndex = 0; canvas.focus();
let score = 0, x = 40, y = 40, vx = 2;
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'd') vx = 3;
  if (e.key === 'ArrowLeft' || e.key === 'a') vx = -3;
  if (e.key === ' ') y -= 20;
});
canvas.addEventListener('pointerdown', () => { y -= 20; });
function loop() {
  x += vx; if (x > 640) x = 0;
  ctx.fillStyle = '#0a0e14'; ctx.fillRect(0,0,640,360);
  ctx.fillStyle = '#f5a623'; ctx.fillRect(x,y,24,24);
  ctx.fillStyle = '#7dd3fc'; ctx.fillText('score '+score, 12, 20);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
<!-- ${'harbor-pad '.repeat(120)} -->
</body></html>`
  assert.ok(playable.length >= MIN_GAME_CHARS, 'fixture must meet game size floor')
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/t/index.html', playable)
  assert.ok(evidence.lastHtmlQuality?.hasKeyboard)
  assert.ok(evidence.lastHtmlQuality?.hasPointer)
  assert.ok(evidence.lastHtmlQuality?.hasAnimationLoop)
  const needPreview = falseCompleteNudge(goal, evidence, 'Done — playable T runner.')
  assert.ok(needPreview && /preview/i.test(needPreview), 'requires preview after solid game write')
  evidence.previews = 1
  assert.equal(falseCompleteNudge(goal, evidence, 'Shipped the harbor game.'), null)
}

{
  const vfs = new VirtualFS()
  const evidence = emptyEvidence()
  const nudge = buildPlaybookNudge(goal, evidence, vfs)
  assert.ok(nudge && /mkdir/i.test(nudge))
  assert.ok(/boston_context/i.test(nudge), 'Boston-flavored goals mention boston_context')
  assert.equal(playbookPhase(goal, evidence), 'scaffold')
}

{
  const vfs = new VirtualFS()
  const evidence = emptyEvidence()
  evidence.mkdirs = 1
  const nudge = buildPlaybookNudge(goal, evidence, vfs)
  assert.ok(nudge && /boston_context/i.test(nudge ?? ''), 'after mkdir, nudge boston_context before write')
  recordBostonContext(evidence)
  const after = buildPlaybookNudge(goal, evidence, vfs)
  assert.ok(after && /write_file/i.test(after ?? ''))
  assert.equal(nextStepHint(goal, evidence, vfs), 'NEXT: write_file the main artifact (complete HTML/app — not a stub).')
}

{
  const q = inspectHtml('<!DOCTYPE html><html><body><h1>Only title</h1></body></html>')
  assert.ok(q.looksLikeStub)
  assert.ok(q.hasDoctypeOrHtml)
  assert.equal(q.hasAnimationLoop, false)
}

{
  assert.ok(detectLeakedToolCall('{"type":"tool","tool":"write_file"}'))
  const d = parseDecision('```json\n{"type":"message","message":"hi"}\n```')
  assert.equal(d.type, 'message')
}

{
  const redacted = redactSecrets('key sk-abc1234567890xyz')
  assert.match(redacted, /\[hidden\]/)
  assert.doesNotMatch(redacted, /sk-abc/)
}

{
  const vfs = new VirtualFS()
  assert.throws(() => vfs.writeFile('../etc/passwd', 'no'), /traversal|Absolute|Illegal/i)
}

{
  const evidence = emptyEvidence()
  recordWrite(evidence, '/apps/x/index.html', 'x'.repeat(MIN_HTML_CHARS / 2))
  assert.equal(evidence.writes, 1)
  assert.equal(evidence.writeChars, MIN_HTML_CHARS / 2)
  assert.equal(evidence.totalWriteChars, MIN_HTML_CHARS / 2)
  assert.deepEqual(evidence.htmlPaths, ['/apps/x/index.html'])
  assert.equal(playbookPhase(pageGoal, evidence), 'expand')

  const ready = emptyEvidence()
  const solid = `<!DOCTYPE html><html><body>
<main><h1>Netrunner Collective</h1><p>Boston harbor ops.</p>
<form><input name="email" /><button type="submit">Join</button></form>
<section id="features"><article>Grid</article><article>Vault</article><article>Relay</article></section>
<style>body{background:#0a0e14;color:#f5a623;font-family:system-ui}main{padding:2rem}</style>
<script>document.querySelector('form').addEventListener('submit',e=>{e.preventDefault();alert('copied')})</script>
</body></html>${'<!-- pad -->'.repeat(80)}`
  recordWrite(ready, '/apps/land/index.html', solid)
  assert.ok(ready.writeChars >= MIN_HTML_CHARS)
  assert.equal(playbookPhase(pageGoal, ready), 'preview')
  ready.previews = 1
  assert.equal(playbookPhase(pageGoal, ready), 'ship')
}

{
  assert.equal(falseCompleteNudge(chatGoal, emptyEvidence(), 'Fenway is in Boston proper.'), null)
}

console.log('test-playbook: ok')
