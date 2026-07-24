import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { runGoal, type StreamEvent } from './agent/runtime'
import {
  clearVault,
  loadVault,
  saveVault,
  type ProviderId,
  type VaultState,
} from './lib/secrets'
import { VirtualFS } from './lib/vfs'

interface FeedItem extends StreamEvent {
  id: string
}

const PROVIDERS: Array<{ id: ProviderId; label: string; modelHint: string }> = [
  { id: 'openrouter', label: 'OpenRouter', modelHint: 'anthropic/claude-sonnet-4' },
  { id: 'openai', label: 'OpenAI', modelHint: 'gpt-4.1' },
  { id: 'anthropic', label: 'Anthropic', modelHint: 'claude-sonnet-4-20250514' },
  { id: 'groq', label: 'Groq', modelHint: 'llama-3.3-70b-versatile' },
  { id: 'gemini', label: 'Gemini', modelHint: 'gemini-2.0-flash' },
  { id: 'ollama', label: 'Ollama (local)', modelHint: 'llama3.2' },
  { id: 'custom', label: 'Custom OpenAI-compatible', modelHint: 'your-model' },
]

export default function App() {
  const [vault, setVault] = useState<VaultState>(() => loadVault())
  const [goal, setGoal] = useState(
    'Build a small Boston Harbor tide dashboard as a single index.html with live clock for Boston time and a styled card UI.',
  )
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const vfsRef = useRef(new VirtualFS())
  const abortRef = useRef<AbortController | null>(null)
  const feedEndRef = useRef<HTMLDivElement | null>(null)

  const tree = useMemo(() => {
    // recompute when feed updates (writes happen during run)
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

  const onRun = async () => {
    if (running) return
    if (!vault.apiKey.trim() && vault.provider !== 'ollama') {
      pushEvent({ kind: 'error', text: 'Add your API key in Settings (BYOK). Keys stay in this tab only.' })
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
    pushEvent({ kind: 'status', text: 'Virtual workspace cleared.' })
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand__name">BostonAI</div>
          <div className="brand__tag">Boston&apos;s go-to coding agent · BYOK · honest builds</div>
        </div>
        <nav className="topbar__links">
          <a href="/almanac/" target="_blank" rel="noreferrer">
            Almanac archive
          </a>
          <a href="https://github.com/AaronGrace978/BostonAi.io" target="_blank" rel="noreferrer">
            Source
          </a>
          <a href="/SECURITY.md" target="_blank" rel="noreferrer">
            Security
          </a>
        </nav>
      </header>

      <div className="layout">
        <section className="panel">
          <div className="panel__head">Settings · key vault</div>
          <div className="panel__body">
            <p className="hint">
              Your key is stored in <strong>sessionStorage</strong> for this tab only — not on BostonAI
              servers. Never commit keys. See SECURITY.md.
            </p>

            <div className="field">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={vault.provider}
                onChange={e => {
                  const id = e.target.value as ProviderId
                  const hint = PROVIDERS.find(p => p.id === id)?.modelHint
                  updateVault({ provider: id, model: hint ?? vault.model })
                }}
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                value={vault.model}
                onChange={e => updateVault({ model: e.target.value })}
                autoComplete="off"
              />
            </div>

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

            <div className="field">
              <label htmlFor="apiKey">API key</label>
              <input
                id="apiKey"
                type="password"
                value={vault.apiKey}
                onChange={e => updateVault({ apiKey: e.target.value })}
                placeholder="sk-…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={vault.allowNetworkFetch}
                onChange={e => updateVault({ allowNetworkFetch: e.target.checked })}
              />
              Allow agent <code>fetch_url</code> (HTTPS only; private IPs blocked)
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
              <button type="button" className="btn" onClick={onResetWorkspace}>
                Reset workspace
              </button>
            </div>

            <div className="panel__head" style={{ marginTop: 18, marginLeft: -14, marginRight: -14 }}>
              Virtual files
            </div>
            <pre className="tree">{tree}</pre>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">Agent · evidence-gated ReAct</div>
          <div className="panel__body">
            <div className="feed">
              {feed.length === 0 && (
                <p className="hint">
                  Runs use a DinoClaw-style loop: one JSON decision per step, completion gates that
                  reject false “already built” claims, and a sandboxed HTML preview.
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
              placeholder="What should BostonAI build or answer?"
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

        <section className="panel">
          <div className="panel__head">
            Preview {previewPath ? `· ${previewPath}` : '· sandboxed'}
          </div>
          <div className="panel__body">
            {previewHtml ? (
              <iframe
                className="preview-frame"
                title="Sandboxed preview"
                sandbox="allow-scripts"
                srcDoc={previewHtml}
                referrerPolicy="no-referrer"
              />
            ) : (
              <p className="hint">
                When the agent calls <code>preview_html</code>, the page appears here inside an iframe
                with <code>sandbox=&quot;allow-scripts&quot;</code> and without{' '}
                <code>allow-same-origin</code> — preview JS cannot read your API key.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
