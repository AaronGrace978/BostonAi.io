import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { runGoal, type StreamEvent } from './agent/runtime'
import { DiffView } from './components/DiffView'
import { QuestBoard } from './components/QuestBoard'
import { clearWorkspaceSnapshot, loadWorkspaceSnapshot, saveWorkspaceSnapshot } from './lib/persist'
import {
  clearVault,
  CLOUD_RELAY_ORIGIN,
  loadVault,
  LOCAL_PROXY_ORIGIN,
  pingCloudRelay,
  pingLocalProxy,
  providerNeedsKey,
  saveVault,
  type ProviderId,
  type VaultState,
} from './lib/secrets'
import { VirtualFS } from './lib/vfs'
import { downloadWorkspaceZip } from './lib/zip'

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
    meta: 'Kimi K3 · ollama.com',
    modelHint: 'kimi-k3',
    models: [
      'kimi-k3',
      'glm-5.2',
      'qwen3.5',
      'gemma4',
      'deepseek-v4-pro',
      'deepseek-v4-flash',
      'minimax-m2.7',
      'glm-5.1',
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
    meta: 'Moonshot API · K3',
    modelHint: 'kimi-k3',
    models: ['kimi-k3', 'kimi-k2.7-code', 'kimi-k2.6'],
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
    meta: 'Many models',
    modelHint: 'moonshotai/kimi-k3',
    models: [
      'moonshotai/kimi-k3',
      'anthropic/claude-fable-5',
      'openai/gpt-5.6',
      'google/gemini-3.1-pro',
    ],
  },
  {
    id: 'ollama',
    label: 'Ollama Local',
    meta: '127.0.0.1 · deck-ready',
    modelHint: 'kimi-k3:cloud',
    models: ['kimi-k3:cloud', 'llama3.2', 'llama3.1', 'qwen2.5-coder'],
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
    modelHint: 'gemini-3.1-pro',
    models: ['gemini-3.1-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'],
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
    'Build a cyberpunk Boston Harbor game — neon yellow night, WASD + mouse, score on screen.',
  )
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const [proxyUp, setProxyUp] = useState(false)
  const [cloudUp, setCloudUp] = useState(false)
  const [showProxyHelp, setShowProxyHelp] = useState(false)
  const [previewMax, setPreviewMax] = useState(false)
  const previewRef = useRef<HTMLIFrameElement | null>(null)
  const [district] = useState(() => DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)])
  const vfsRef = useRef(new VirtualFS())
  const abortRef = useRef<AbortController | null>(null)
  const feedEndRef = useRef<HTMLDivElement | null>(null)
  const hydratedRef = useRef(false)
  const restoreStartedRef = useRef(false)

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
      const [localOk, cloudOk] = await Promise.all([pingLocalProxy(), pingCloudRelay()])
      if (alive) {
        setProxyUp(localOk)
        setCloudUp(cloudOk)
      }
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
    if (event.kind === 'preview' && event.previewHtml) {
      setPreviewHtml(event.previewHtml)
      setPreviewPath(event.previewPath ?? null)
      window.setTimeout(() => previewRef.current?.focus(), 80)
    }
  }, [])

  // Restore the last workspace from IndexedDB, once, before any autosave may run.
  useEffect(() => {
    if (restoreStartedRef.current) return
    restoreStartedRef.current = true
    let alive = true
    void loadWorkspaceSnapshot().then(snapshot => {
      if (alive && snapshot) {
        const files = vfsRef.current.restore(snapshot)
        if (files > 0) {
          pushEvent({
            kind: 'status',
            text: `Workspace restored — ${files} file${files === 1 ? '' : 's'} from your last session. “Reset deck” wipes it.`,
          })
        }
      }
      hydratedRef.current = true
    })
    return () => {
      alive = false
    }
  }, [pushEvent])

  // Autosave the workspace after activity settles. Skips until restore finished
  // so an empty boot never clobbers a saved session.
  useEffect(() => {
    if (!hydratedRef.current || feed.length === 0) return
    const id = window.setTimeout(() => {
      void saveWorkspaceSnapshot(vfsRef.current.snapshot())
    }, 600)
    return () => window.clearTimeout(id)
  }, [feed])

  const selectProvider = (id: ProviderId) => {
    const def = PROVIDERS.find(p => p.id === id)
    updateVault({
      provider: id,
      model: def?.modelHint ?? vault.model,
      baseUrl: id === 'ollama' ? vault.baseUrl || 'http://127.0.0.1:11434/v1' : id === 'custom' ? vault.baseUrl : '',
    })
    if (def?.soon) {
      pushEvent({
        kind: 'status',
        text: "Prime V1 is on the pad — BostonAI's own model. Coming soon. Rack another provider to run tonight.",
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
    try {
      await navigator.clipboard.writeText('npm run proxy')
      pushEvent({ kind: 'status', text: 'Copied: npm run proxy' })
    } catch {
      pushEvent({ kind: 'status', text: 'Run this in the BostonAI folder: npm run proxy' })
    }
  }

  const onResetWorkspace = () => {
    vfsRef.current.reset()
    void clearWorkspaceSnapshot()
    setPreviewHtml(null)
    setPreviewPath(null)
    setFeed([])
    setPreviewMax(false)
    pushEvent({ kind: 'status', text: 'Virtual workspace wiped. Fresh asphalt.' })
  }

  const onDownloadZip = () => {
    const count = downloadWorkspaceZip(vfsRef.current)
    pushEvent(
      count > 0
        ? { kind: 'status', text: `Zipped ${count} file${count === 1 ? '' : 's'} — check your downloads.` }
        : { kind: 'status', text: 'Nothing to zip yet — run a goal first.' },
    )
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
              Night Harbor · <em>Aaron Grace</em> · honest builds
            </div>
          </div>
        </div>
        <div className="chrome__meta">
          <span className="district district--hot">DISTRICT · {district}</span>
          <span className="district">42.36°N 71.06°W</span>
          <a className="district district--link" href="/almanac/" title="The quiet almanac — where this site began">
            ALMANAC · OLD HARBOR
          </a>
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
                  placeholder={vault.provider === 'ollama' ? 'http://127.0.0.1:11434/v1' : 'https://…/v1'}
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
                  placeholder="paste key · sk-…"
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

            <p className="hint" style={{ marginTop: 0 }}>
              <span className={`status-dot${cloudUp ? ' on' : ''}`} />
              Cloud relay {cloudUp ? 'ready' : 'warming'} — paste a key and run. No install needed.
            </p>

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
                Prefer local proxy {proxyUp ? '(connected)' : '(optional · keys stay on your PC)'}
              </span>
            </label>

            <button type="button" className="btn btn--ghost" onClick={() => setShowProxyHelp(v => !v)}>
              {showProxyHelp ? 'Hide local proxy help' : 'Want local proxy? One-click setup'}
            </button>

            {showProxyHelp && (
              <div className="proxy-box">
                <h3>Local proxy in 30 seconds</h3>
                <ol>
                  <li>Download the starter for your OS (needs Node.js once).</li>
                  <li>Double-click it and leave the window open.</li>
                  <li>Turn on “Prefer local proxy” above, then Run goal.</li>
                </ol>
                <div className="cmd-row">
                  <a className="btn btn--primary" href="/proxy/Start-BostonAI-Proxy.cmd" download>
                    Windows
                  </a>
                  <a className="btn" href="/proxy/start-bostonai-proxy.sh" download>
                    Mac / Linux
                  </a>
                  <a className="btn btn--ghost" href="/proxy/bostonai-proxy.mjs" download>
                    Script only
                  </a>
                </div>
                <div className="cmd-row">
                  <code className="cmd">npm run proxy</code>
                  <button type="button" className="btn" onClick={copyProxyCmd}>
                    Copy
                  </button>
                </div>
                <p className="hint" style={{ marginBottom: 0 }}>
                  Local listens on {LOCAL_PROXY_ORIGIN}. Cloud relay: {CLOUD_RELAY_ORIGIN}. Keys go to
                  the model company either way — BostonAI does not store them.
                </p>
              </div>
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
              <div className="tree-head">
                <div className="bay__label">Virtual files</div>
                <button type="button" className="btn btn--mini" onClick={onDownloadZip}>
                  Download .zip
                </button>
              </div>
              <pre className="tree">{tree}</pre>
              <p className="hint" style={{ marginTop: 8, marginBottom: 0 }}>
                Files persist in this browser between visits. Zip them to keep a build for good.
              </p>
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
                <>
                  <p className="hint">
                    Tell it what to make. Honest finish — no fake “already done.” Preview stays
                    sandboxed so preview JS cannot read your key.
                  </p>
                  <QuestBoard disabled={running} onPick={quest => setGoal(quest)} />
                </>
              )}
              {feed.map(item => (
                <article key={item.id} className={`event event--${item.kind}`}>
                  <div className="event__kind">{item.kind}</div>
                  <div className="event__text">{item.text}</div>
                  {item.diff && <DiffView diff={item.diff} />}
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

        <section className="bay">
          <div className="bay__head">
            <span className="bay__label">
              Preview {previewPath ? `· ${previewPath}` : '· sandboxed iframe'}
            </span>
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
                    <button type="button" className="btn" onClick={() => previewRef.current?.focus()}>
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
              <div className="empty-preview">
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
