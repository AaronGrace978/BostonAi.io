import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { runGoal, type StreamEvent } from './agent/runtime'
import {
  clearVault,
  loadVault,
  providerNeedsKey,
  saveVault,
  type ProviderId,
  type VaultState,
} from './lib/secrets'
import { VirtualFS } from './lib/vfs'

interface FeedItem extends StreamEvent {
  id: string
}

interface ProviderDef {
  id: ProviderId
  label: string
  meta: string
  modelHint: string
  models?: string[]
  soon?: boolean
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'ollama-cloud',
    label: 'Ollama Cloud',
    meta: 'Frontier cloud · ollama.com',
    modelHint: 'qwen3.5',
    models: [
      'qwen3.5',
      'glm-5.2',
      'kimi-k2.7-code',
      'gemma4',
      'deepseek-v4-flash',
      'deepseek-v4-pro',
      'minimax-m2.7',
      'kimi-k2.6',
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    meta: 'GPT line · API',
    modelHint: 'gpt-4.1',
    models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'o3', 'o4-mini'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    meta: 'Claude line · API',
    modelHint: 'claude-sonnet-4-20250514',
    models: [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-haiku-latest',
    ],
  },
  {
    id: 'prime',
    label: 'Prime V1',
    meta: 'Coming soon · BostonAI',
    modelHint: 'prime-v1',
    models: ['prime-v1'],
    soon: true,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    meta: 'Multi-provider relay',
    modelHint: 'anthropic/claude-sonnet-4',
    models: [
      'anthropic/claude-sonnet-4',
      'openai/gpt-4.1',
      'google/gemini-2.5-pro',
      'moonshotai/kimi-k2.5',
    ],
  },
  {
    id: 'ollama',
    label: 'Ollama Local',
    meta: '127.0.0.1 · deck-ready',
    modelHint: 'llama3.2',
  },
  {
    id: 'groq',
    label: 'Groq',
    meta: 'Speed lane',
    modelHint: 'llama-3.3-70b-versatile',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    meta: 'Google AI',
    modelHint: 'gemini-2.5-flash',
  },
  {
    id: 'custom',
    label: 'Custom',
    meta: 'OpenAI-compatible',
    modelHint: 'your-model',
  },
]

const DISTRICTS = ['SEAPORT', 'BACK BAY', 'KENDALL', 'COMBAT ZONE', 'NORTH END', 'HUB'] as const

function HarborParticles() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.00025,
      vy: 0.00015 + Math.random() * 0.00055,
    }))

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        if (d.y > 1.05) d.y = -0.05
        if (d.x < -0.05) d.x = 1.05
        if (d.x > 1.05) d.x = -0.05
        const x = d.x * window.innerWidth
        const y = d.y * window.innerHeight
        const r = 0.6 + d.z * 1.8
        ctx.beginPath()
        ctx.fillStyle = d.z > 0.6 ? 'rgba(240,224,32,0.55)' : 'rgba(77,238,234,0.35)'
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      // soft connecting neon strands near center
      ctx.strokeStyle = 'rgba(126,200,227,0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < dots.length; i += 7) {
        const a = dots[i]
        const b = dots[(i + 11) % dots.length]
        ctx.beginPath()
        ctx.moveTo(a.x * window.innerWidth, a.y * window.innerHeight)
        ctx.lineTo(b.x * window.innerWidth, b.y * window.innerHeight)
        ctx.stroke()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="fx-canvas" aria-hidden />
}

export default function App() {
  const [vault, setVault] = useState<VaultState>(() => loadVault())
  const [goal, setGoal] = useState(
    'Build a Boston Harbor tide dashboard as a single index.html — live Boston clock, neon Seaport card UI, fog-over-water vibe.',
  )
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const [district] = useState(
    () => DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
  )
  const vfsRef = useRef(new VirtualFS())
  const abortRef = useRef<AbortController | null>(null)
  const feedEndRef = useRef<HTMLDivElement | null>(null)

  const activeProvider = useMemo(
    () => PROVIDERS.find(p => p.id === vault.provider) ?? PROVIDERS[0],
    [vault.provider],
  )

  const tree = useMemo(() => {
    void feed.length
    return vfsRef.current.tree('/')
  }, [feed])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feed])

  const updateVault = useCallback((patch: Partial<VaultState>) => {
    setVault(prev => {
      const next = { ...prev, ...patch }
      saveVault(next)
      return next
    })
  }, [])

  const pushEvent = useCallback((event: StreamEvent) => {
    setFeed(prev => [...prev, { ...event, id: crypto.randomUUID() }])
    if (event.kind === 'preview' && event.previewHtml) {
      setPreviewHtml(event.previewHtml)
      setPreviewPath(event.previewPath ?? null)
    }
  }, [])

  const selectProvider = (id: ProviderId) => {
    const def = PROVIDERS.find(p => p.id === id)
    updateVault({
      provider: id,
      model: def?.modelHint ?? vault.model,
      baseUrl:
        id === 'ollama-cloud'
          ? ''
          : id === 'ollama'
            ? vault.baseUrl || 'http://127.0.0.1:11434/v1'
            : vault.baseUrl,
    })
    if (def?.soon) {
      pushEvent({
        kind: 'status',
        text: 'Prime V1 is on the pad — BostonAI\'s own model. Coming soon. Rack another provider to run tonight.',
      })
    }
  }

  const onRun = async () => {
    if (running) return
    if (vault.provider === 'prime') {
      pushEvent({
        kind: 'error',
        text: 'Prime V1 is coming soon. Flip to Ollama Cloud, OpenAI, or Anthropic to run now.',
      })
      return
    }
    if (providerNeedsKey(vault.provider) && !vault.apiKey.trim()) {
      pushEvent({ kind: 'error', text: 'Jack in a BYOK key — sessionStorage only, never hits BostonAI servers.' })
      return
    }
    setRunning(true)
    setFeed([])
    const ac = new AbortController()
    abortRef.current = ac
    try {
      await runGoal({
        goal: goal.trim(),
        vault,
        vfs: vfsRef.current,
        signal: ac.signal,
        onEvent: pushEvent,
      })
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }

  const onStop = () => abortRef.current?.abort()

  const onResetWorkspace = () => {
    vfsRef.current.reset()
    setPreviewHtml(null)
    setPreviewPath(null)
    setFeed([])
    pushEvent({ kind: 'status', text: 'Virtual workspace wiped. Fresh asphalt.' })
  }

  return (
    <div className="stage">
      <HarborParticles />
      <div className="fx-grid" aria-hidden />
      <div className="fx-scan" aria-hidden />
      <div className="fx-vignette" aria-hidden />

      <header className="chrome">
        <div className="chrome__brand">
          <div className="chrome__sigil" aria-hidden>
            B
          </div>
          <div className="chrome__titles">
            <div className="chrome__name">BostonAI</div>
            <div className="chrome__tag">
              Night Harbor · <em>BYOK</em> · honest builds · evidence-gated
            </div>
          </div>
        </div>
        <div className="chrome__meta">
          <span className="district district--hot">DISTRICT · {district}</span>
          <span className="district">42.36°N 71.06°W</span>
          <nav className="chrome__links">
            <a href="/almanac/" target="_blank" rel="noreferrer">
              Almanac
            </a>
            <a href="https://github.com/AaronGrace978/BostonAi.io" target="_blank" rel="noreferrer">
              Source
            </a>
            <a href="/SECURITY.md" target="_blank" rel="noreferrer">
              Security
            </a>
          </nav>
        </div>
      </header>

      <div className="deck">
        <section className="bay">
          <div className="bay__head">
            <span className="bay__label">Netrunner vault</span>
            <span className="bay__sub">keys never leave this tab</span>
          </div>
          <div className="bay__body">
            <p className="lore">
              <b>Night Harbor lore:</b> Seaport chrome, Back Bay glass, Kendall wetware, fog off the
              Charles. Not Night City — Boston. Build like the T still runs at 2am.
            </p>

            <div className="rack" role="listbox" aria-label="Providers">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={vault.provider === p.id}
                  className={`chip${vault.provider === p.id ? ' is-active' : ''}${p.soon ? ' is-soon' : ''}`}
                  onClick={() => selectProvider(p.id)}
                >
                  <span className="chip__name">{p.label}</span>
                  <span className="chip__meta">{p.meta}</span>
                </button>
              ))}
            </div>

            <div className="field">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                value={vault.model}
                onChange={e => updateVault({ model: e.target.value })}
                autoComplete="off"
                disabled={vault.provider === 'prime'}
              />
            </div>

            {activeProvider.models && activeProvider.models.length > 0 && (
              <div className="model-picks" aria-label="Quick models">
                {activeProvider.models.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`model-pick${vault.model === m ? ' is-on' : ''}`}
                    disabled={vault.provider === 'prime'}
                    onClick={() => updateVault({ model: m })}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {(vault.provider === 'custom' || vault.provider === 'ollama') && (
              <div className="field">
                <label htmlFor="baseUrl">Base URL</label>
                <input
                  id="baseUrl"
                  placeholder={
                    vault.provider === 'ollama' ? 'http://127.0.0.1:11434/v1' : 'https://…/v1'
                  }
                  value={vault.baseUrl}
                  onChange={e => updateVault({ baseUrl: e.target.value })}
                  autoComplete="off"
                />
              </div>
            )}

            {vault.provider !== 'prime' && vault.provider !== 'ollama' && (
              <div className="field">
                <label htmlFor="apiKey">API key</label>
                <input
                  id="apiKey"
                  type="password"
                  value={vault.apiKey}
                  onChange={e => updateVault({ apiKey: e.target.value })}
                  placeholder="jack in · sk-…"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}

            {vault.provider === 'prime' && (
              <p className="hint">
                <strong>Prime V1</strong> is BostonAI&apos;s own model — rack reserved, engines warm.
                Not live yet.
              </p>
            )}

            <label className="check">
              <input
                type="checkbox"
                checked={vault.allowNetworkFetch}
                onChange={e => updateVault({ allowNetworkFetch: e.target.checked })}
              />
              Allow agent <code>fetch_url</code> (HTTPS · private IPs blocked)
            </label>

            <div className="row">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  clearVault()
                  setVault(loadVault())
                }}
              >
                Clear key
              </button>
              <button type="button" className="btn btn--ghost" onClick={onResetWorkspace}>
                Reset deck
              </button>
            </div>

            <div className="tree-wrap">
              <div className="bay__label" style={{ marginBottom: 8 }}>
                Virtual files
              </div>
              <pre className="tree">{tree}</pre>
            </div>
          </div>
        </section>

        <section className="bay">
          <div className="bay__head">
            <span className="bay__label">Agent · evidence ReAct</span>
            <span className="bay__sub">{activeProvider.label}</span>
          </div>
          <div className="bay__body">
            <div className="feed">
              {feed.length === 0 && (
                <p className="hint">
                  One JSON decision per step. Completion gates kill false &quot;already built&quot;
                  claims. Preview stays sandboxed — preview JS cannot read your key.
                </p>
              )}
              {feed.map(item => (
                <article key={item.id} className={`event event--${item.kind}`}>
                  <div className="event__kind">{item.kind}</div>
                  <div className="event__text">{item.text}</div>
                </article>
              ))}
              <div ref={feedEndRef} />
            </div>
          </div>
          <div className="composer">
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="What should Night Harbor build?"
              disabled={running}
            />
            <div className="row">
              <button type="button" className="btn btn--primary" disabled={running} onClick={onRun}>
                {running ? 'Running…' : 'Run goal'}
              </button>
              <button type="button" className="btn" disabled={!running} onClick={onStop}>
                Stop
              </button>
            </div>
          </div>
        </section>

        <section className="bay">
          <div className="bay__head">
            <span className="bay__label">
              Preview {previewPath ? `· ${previewPath}` : '· sandboxed iframe'}
            </span>
            <span className="bay__sub">no allow-same-origin</span>
          </div>
          <div className="bay__body">
            {previewHtml ? (
              <iframe
                className="preview-frame"
                title="Sandboxed preview"
                sandbox="allow-scripts"
                srcDoc={previewHtml}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="empty-preview">
                <div>
                  <strong>Waiting on preview_html</strong>
                  Harbor fog until the agent mounts a page. Sandbox keeps your vault sealed.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
