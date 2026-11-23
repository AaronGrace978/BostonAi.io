/** Drives the inline boot screen in entity/index.html and fades it out once the face is drawn. */

const MIN_VISIBLE_MS = 1300

export function bootStage(label: string, pct: number) {
  const stage = document.getElementById('ent-boot-stage')
  const bar = document.getElementById('ent-boot-bar')
  const num = document.getElementById('ent-boot-pct')
  if (stage) stage.textContent = label
  if (bar) bar.style.width = `${pct}%`
  if (num) num.textContent = `${pct}%`
}

let finished = false

/** Called after the first ASCII frame (or if WebGL is unavailable). */
export function bootDone() {
  if (finished) return
  finished = true
  bootStage('entity online', 100)
  const el = document.getElementById('ent-boot')
  if (!el) return
  const wait = Math.max(0, MIN_VISIBLE_MS - performance.now())
  window.setTimeout(() => {
    el.classList.add('is-done')
    window.setTimeout(() => el.remove(), 700)
  }, wait + 250)
}
