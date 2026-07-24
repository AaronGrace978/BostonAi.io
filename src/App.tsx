import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { runGoal, type StreamEvent } from './agent/runtime'
import {
  clearVault,
  loadVault,
  LOCAL_PROXY_ORIGIN,
  pingLocalProxy,
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
    meta: 'Frontier cloud',
    modelHint: 'kimi-k3',
    models: [
      'kimi-k3',
      'glm-5.2',
      'qwen3.5',
      'kimi-k2.7-code',
      'gemma4',
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'minimax-m2.7',
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    meta: 'GPT-5.6 family',
    modelHint: 'gpt-5.6',
    models: ['gpt-5.6', 'gpt-5.6-pro', 'gpt-5.4', 'gpt-4.1', 'o4-mini'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    meta: 'Fable / Sonnet',
    modelHint: 'claude-fable-5',
    models: ['claude-fable-5', 'claude-sonnet-5', 'claude-opus-4-20250514', 'claude-sonnet-4-20250514'],
  },
  {
    id: 'kimi',
    label: 'Kimi',
    meta: 'Moonshot · K3',
    modelHint: 'kimi-k3',
    models: ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.6'],
  },
  {
    id: 'prime',
    label: 'Prime V1',
    meta: 'Coming soon',
    modelHint: 'prime-v1',
    models: ['prime-v1'],
    soon: true,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    meta: 'Many models',
    modelHint: 'anthropic/claude-fable-5',
    models: [
      'anthropic/claude-fable-5',
      'openai/gpt-5.6',
      'moonshotai/kimi-k3',
      'google/gemini-3.1-pro',
    ],
  },
  {
    id: 'ollama',
    label: 'Ollama Local',
    meta: 'On your machine',
    modelHint: 'llama3.2',
  },
  {
    id: 'groq',
    label: 'Groq',
    meta: 'Fast replies',
    modelHint: 'llama-3.3-70b-versatile',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    meta: 'Google',
    modelHint: 'gemini-3.1-pro',
    models: ['gemini-3.1-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  },
  {
    id: 'custom',
    label: 'Custom',
    meta: 'Your endpoint',
    modelHint: 'your-model',
  },
]

const KIND_LABEL: Record<string, string> = {
  status: 'Working',
  thought: 'Thinking',
  tool: 'Building',
  result: 'Done step',
  message: 'Answer',
  error: 'Problem',
  preview: 'Preview',
}

function LivingTitle({ text }: { text: string }) {
  const [glitchAt, setGlitchAt] = useState(-1)
  const chars = useMemo(() => text.split(''), [text])

  useEffect(() => {
    const id = window.setInterval(() => {
      setGlitchAt(Math.floor(Math.random() * chars.length))
      window.setTimeout(() => setGlitchAt(-1), 420)
    }, 2200)
    return () => window.clearInterval(id)
  }, [chars.length])

  return (
    <h1 className="glitch-title" aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className={`ch${glitchAt === i ? ' is-glitching' : ''}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </h1>
  )
}

function HarborField({ building }: { building: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    const n = building ? 110 : 75
    const dots = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * (building ? 0.00055 : 0.00022),
      vy: (building ? 0.00035 : 0.00012) + Math.random() * 0.00045,
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
        d.y += d.vy * (building ? 1.6 : 1)
        if (d.y > 1.05) d.y = -0.05
        if (d.x < -0.05 || d.x > 1.05) d.x = Math.random()
        const x = d.x * window.innerWidth
        const y = d.y * window.innerHeight
        ctx.beginPath()
        ctx.fillStyle = d.z > 0.55 ? 'rgba(240,224,32,0.55)' : 'rgba(77,238,234,0.3)'
        ctx.arc(x, y, 0.7 + d.z * (building ? 2.2 : 1.6), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = building ? 'rgba(240,224,32,0.14)' : 'rgba(77,238,234,0.06)'
      for (let i = 0; i < dots.length; i += building ? 4 : 8) {
        const a = dots[i]
        const b = dots[(i + 9) % dots.length]
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
  }, [building])

  return <canvas ref={ref} className="fx-canvas" aria-hidden />
}

function TypeStream({ text }: { text: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, 18)
    return () => window.clearInterval(id)
  }, [text])
  return <div className="type-stream">{shown}</div>
}

export default function App() {
  const [vault, setVault] = useState<VaultState>(() => loadVault())
  const [goal, setGoal] = useState(
    'Build a cyberpunk Boston Harbor game — neon yellow night, WASD + mouse, score on screen.',
  )
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const [proxyUp, setProxyUp] = useState(false)
  const [showProxyHelp, setShowProxyHelp] = useState(false)
  const [previewMax, setPreviewMax] = useState(false)
  const previewRef = useRef<HTMLIFrameElement | null>(null)
  const [livePhrase, setLivePhrase] = useState('Ready when you are')
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

  useEffect(() => {
    if (!previewMax) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewMax(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewMax])

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const ok = await pingLocalProxy()
      if (alive) setProxyUp(ok)
    }
    void tick()
    const id = window.setInterval(tick, 4000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const updateVault = useCallback((patch: Partial<VaultState>) => {
    setVault(prev => {
      const next = { ...prev, ...patch }
      saveVault(next)
      return next
    })
  }, [])

  const pushEvent = useCallback((event: StreamEvent) => {
    setFeed(prev => [...prev, { ...event, id: crypto.randomUUID() }])
    if (event.kind === 'tool') setLivePhrase(event.text.slice(0, 72) || 'Building…')
    if (event.kind === 'status') setLivePhrase(event.text)
    if (event.kind === 'preview' && event.previewHtml) {
      setPreviewHtml(event.previewHtml)
      setPreviewPath(event.previewPath ?? null)
      setLivePhrase('Preview is live — click it to play')
      window.setTimeout(() => previewRef.current?.focus(), 80)
    }
    if (event.kind === 'message') setLivePhrase('Finished')
    if (event.kind === 'error') setLivePhrase('Something blocked the run')
  }, [])

  const selectProvider = (id: ProviderId) => {
    const def = PROVIDERS.find(p => p.id === id)
    updateVault({
      provider: id,
      model: def?.modelHint ?? vault.model,
      baseUrl: id === 'ollama' ? vault.baseUrl || 'http://127.0.0.1:11434/v1' : id === 'custom' ? vault.baseUrl : '',
    })
  }

  const onRun = async () => {
    if (running) return
    if (vault.provider === 'prime') {
      pushEvent({ kind: 'error', text: 'Prime V1 is almost ready. Pick OpenAI, Anthropic, or Ollama Cloud for now.' })
      return
    }
    if (providerNeedsKey(vault.provider) && !vault.apiKey.trim()) {
      pushEvent({ kind: 'error', text: 'Add your API key first. It stays in this browser tab only.' })
      return
    }
    if (vault.useLocalProxy && !proxyUp) {
      pushEvent({
        kind: 'error',
        text: 'Local proxy is off. Open the proxy helper below, run the command, then try again.',
      })
      setShowProxyHelp(true)
      return
    }
    setRunning(true)
    setFeed([])
    setLivePhrase('Starting…')
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

  const copyProxyCmd = async () => {
    const cmd = 'npm run proxy'
    try {
      await navigator.clipboard.writeText(cmd)
      pushEvent({ kind: 'status', text: 'Copied: npm run proxy' })
    } catch {
      pushEvent({ kind: 'status', text: 'Run this in the BostonAI folder: npm run proxy' })
    }
  }

  return (
    <div className="stage">
      <HarborField building={running} />
      <div className="fx-grid" aria-hidden />
      <div className="fx-scan" aria-hidden />
      <div className="fx-vignette" aria-hidden />

      <header className="chrome">
        <div className="chrome__brand">
          <div className="chrome__sigil" aria-hidden>
            B
          </div>
          <div>
            <LivingTitle text="BostonAI.io" />
            <div className="chrome__tag">
              Aaron Grace · <strong>war room for builders</strong> · Night Harbor
            </div>
          </div>
        </div>
        <div className="chrome__meta">
          <span className={`pill${running ? ' pill--live' : ''}`}>{running ? 'Building' : 'Harbor calm'}</span>
          <span className="pill">42.36°N 71.06°W</span>
        </div>
      </header>

      <div className="deck">
        <section className={`bay${running ? ' is-building' : ''}`}>
          <div className="bay__head">
            <span className="bay__label">Setup</span>
            <span className="bay__sub">keys stay on your machine</span>
          </div>
          <div className="bay__body">
            <p className="soul">
              Built by <em>Aaron Grace</em> — ActivatePrime heart, late nights when the coffee
              went cold. Not another toy. A war room that ships.
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
              <div className="model-picks">
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
                <label htmlFor="baseUrl">Address</label>
                <input
                  id="baseUrl"
                  placeholder={vault.provider === 'ollama' ? 'http://127.0.0.1:11434/v1' : 'https://…/v1'}
                  value={vault.baseUrl}
                  onChange={e => updateVault({ baseUrl: e.target.value })}
                  autoComplete="off"
                />
              </div>
            )}

            {vault.provider !== 'prime' && vault.provider !== 'ollama' && (
              <div className="field">
                <label htmlFor="apiKey">Your API key</label>
                <input
                  id="apiKey"
                  type="password"
                  value={vault.apiKey}
                  onChange={e => updateVault({ apiKey: e.target.value })}
                  placeholder="Paste key here"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}

            <label className="check">
              <input
                type="checkbox"
                checked={vault.useLocalProxy}
                onChange={e => {
                  updateVault({ useLocalProxy: e.target.checked })
                  if (e.target.checked) setShowProxyHelp(true)
                }}
              />
              <span>
                <span className={`status-dot${proxyUp ? ' on' : ''}`} />
                Local proxy {proxyUp ? 'connected' : 'not running'}
              </span>
            </label>

            <button type="button" className="btn btn--ghost" onClick={() => setShowProxyHelp(v => !v)}>
              {showProxyHelp ? 'Hide proxy help' : 'Need the proxy? Easy setup'}
            </button>

            {showProxyHelp && (
              <div className="proxy-box">
                <h3>Make cloud models work in your browser</h3>
                <ol>
                  <li>Open a terminal in the BostonAI folder.</li>
                  <li>Run the command below and leave it open.</li>
                  <li>Turn on “Local proxy” above, then hit Build.</li>
                </ol>
                <div className="cmd-row">
                  <code className="cmd">npm run proxy</code>
                  <button type="button" className="btn" onClick={copyProxyCmd}>
                    Copy
                  </button>
                </div>
                <p className="hint" style={{ marginBottom: 0 }}>
                  Listens on {LOCAL_PROXY_ORIGIN}. Your key still goes only to the model company — never to BostonAI servers.
                </p>
              </div>
            )}

            <label className="check">
              <input
                type="checkbox"
                checked={vault.allowNetworkFetch}
                onChange={e => updateVault({ allowNetworkFetch: e.target.checked })}
              />
              Allow the agent to look up public web pages
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
              <button
                type="button"
                className="btn"
                onClick={() => {
                  vfsRef.current.reset()
                  setPreviewHtml(null)
                  setPreviewPath(null)
                  setFeed([])
                  setLivePhrase('Cleared — fresh start')
                }}
              >
                Reset
              </button>
            </div>

            <div className="tree-wrap">
              <div className="bay__label" style={{ marginBottom: 8 }}>
                Files
              </div>
              <pre className="tree">{tree}</pre>
            </div>
          </div>
        </section>

        <section className={`bay${running ? ' is-building' : ''}`}>
          <div className="bay__head">
            <span className="bay__label">Build</span>
            <span className="bay__sub">{activeProvider.label}</span>
          </div>
          <div className="bay__body">
            {running && (
              <div className="live-line">
                <div className="wave" aria-hidden>
                  <span /><span /><span /><span /><span />
                </div>
                <TypeStream text={livePhrase} />
              </div>
            )}
            <div className="feed">
              {feed.length === 0 && !running && (
                <p className="hint">
                  Tell it what to make. Watch the harbor move while it builds. Honest finish — no fake “already done.”
                </p>
              )}
              {feed.map(item => (
                <article key={item.id} className={`event event--${item.kind}`}>
                  <div className="event__kind">{KIND_LABEL[item.kind] ?? item.kind}</div>
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
              placeholder="What should we build?"
              disabled={running}
            />
            <div className="row">
              <button type="button" className="btn btn--primary" disabled={running} onClick={onRun}>
                {running ? 'Building…' : 'Build'}
              </button>
              <button
                type="button"
                className="btn"
                disabled={!running}
                onClick={() => abortRef.current?.abort()}
              >
                Stop
              </button>
            </div>
          </div>
        </section>

        <section className={`bay${running ? ' is-building' : ''}`}>
          <div className="bay__head">
            <span className="bay__label">{previewPath ? previewPath : 'Preview'}</span>
            <span className="bay__sub">click to play · keyboard + mouse</span>
          </div>
          <div className="bay__body">
            {previewHtml ? (
              <div className={`preview-shell${previewMax ? ' is-max-wrap' : ''}`}>
                <div className={`preview-stage${previewMax ? ' is-max' : ''}`}>
                  <div className="preview-toolbar">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => {
                        setPreviewMax(v => !v)
                        window.setTimeout(() => previewRef.current?.focus(), 50)
                      }}
                    >
                      {previewMax ? 'Exit full screen' : 'Maximize'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => previewRef.current?.focus()}
                    >
                      Focus game
                    </button>
                    <span className="preview-hint">Click inside to play · Esc exits full screen</span>
                  </div>
                  <iframe
                    ref={previewRef}
                    className="preview-frame"
                    title="Game preview"
                    sandbox="allow-scripts allow-pointer-lock allow-forms"
                    allow="fullscreen; gamepad; autoplay"
                    allowFullScreen
                    tabIndex={0}
                    srcDoc={previewHtml}
                    referrerPolicy="no-referrer"
                    onLoad={() => previewRef.current?.focus()}
                  />
                </div>
              </div>
            ) : (
              <div className={`empty-preview${running ? ' is-building' : ''}`}>
                <div>
                  <strong>{running ? 'Forming…' : 'Waiting'}</strong>
                  {running
                    ? 'The page is coming together. Stay with it.'
                    : 'When the build is ready, it shows up here. Games get keyboard + mouse.'}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
