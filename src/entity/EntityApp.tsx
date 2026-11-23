import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import AsciiEntity from './AsciiEntity'
import Markdown from './Markdown'
import { PROVIDERS, streamChat, type ProviderId, type Turn } from './providers'
import { signal, type StreamEvent } from './signal'

type Msg = { id: number; role: 'user' | 'assistant'; content: string; reasoning: string; meta?: string; error?: string; model?: string }

const PHASE_LABEL: Record<string, string> = {
  idle: 'DORMANT',
  waiting: 'LISTENING',
  reasoning: 'REASONING',
  generating: 'TRANSMITTING',
}

function Telemetry() {
  const tps = useRef<HTMLSpanElement>(null)
  const conf = useRef<HTMLSpanElement>(null)
  const err = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const state = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const o = signal.out
      if (tps.current) tps.current.textContent = o.tokensPerSecond.toFixed(1)
      if (conf.current) conf.current.textContent = o.confidence.toFixed(3)
      if (err.current) err.current.textContent = o.error.toFixed(3)
      if (bar.current) bar.current.style.width = `${Math.round(o.confidence * 100)}%`
      if (state.current) {
        const label = o.error > 0.3 ? 'FAULT' : PHASE_LABEL[signal.phase]
        if (state.current.textContent !== label) state.current.textContent = label
        state.current.dataset.state = label
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <>
      <div className="ent-core">
        <span className="ent-micro">ENTITY // CORE</span>
        <span ref={state} className="ent-state" data-state="DORMANT">
          DORMANT
        </span>
      </div>
      <div className="ent-tele">
        <div className="ent-tele__row">
          <span>u_tokens_per_second</span>
          <span ref={tps}>0.0</span>
        </div>
        <div className="ent-tele__row">
          <span>u_model_confidence</span>
          <span ref={conf}>1.000</span>
        </div>
        <div className="ent-tele__bar">
          <div ref={bar} />
        </div>
        <div className="ent-tele__row">
          <span>u_error_state</span>
          <span ref={err}>0.000</span>
        </div>
        <div className="ent-tele__foot">THREE // perlin mesh → glyph ramp</div>
      </div>
    </>
  )
}

const CUSTOM = '__custom__'

/** A real dropdown of the provider's models, with a "Custom model ID" escape hatch. */
function ModelSelect({
  models,
  value,
  onChange,
  compact,
  disabled,
}: {
  models: string[]
  value: string
  onChange: (m: string) => void
  compact?: boolean
  disabled?: boolean
}) {
  const [custom, setCustom] = useState(!models.includes(value))
  useEffect(() => {
    if (models.includes(value)) setCustom(false)
  }, [models, value])
  return (
    <span className={`ent-model${compact ? ' ent-model--compact' : ''}`}>
      <select
        aria-label="Model"
        value={custom ? CUSTOM : value}
        disabled={disabled}
        onChange={e => {
          if (e.target.value === CUSTOM) {
            setCustom(true)
            onChange('')
          } else {
            setCustom(false)
            onChange(e.target.value)
          }
        }}
      >
        {models.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
        <option value={CUSTOM}>Custom model ID…</option>
      </select>
      {custom && (
        <input
          aria-label="Custom model ID"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. qwen3-coder:480b"
          spellCheck={false}
          disabled={disabled}
          autoFocus
        />
      )}
    </span>
  )
}

export default function EntityApp() {
  const [provider, setProvider] = useState<ProviderId>('ollama-cloud')
  const def = PROVIDERS.find(p => p.id === provider)!
  const [model, setModel] = useState(def.models[0])
  const [keyDraft, setKeyDraft] = useState('')
  const keyRef = useRef('')
  const [live, setLive] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    document.title = 'The Entity | BostonAI'
  }, [])

  // Wipe the key from memory if the tab is closed or hidden for good.
  useEffect(() => {
    const wipe = () => {
      abortRef.current?.abort()
      keyRef.current = ''
    }
    window.addEventListener('pagehide', wipe)
    return () => window.removeEventListener('pagehide', wipe)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [msgs])

  const pickProvider = (id: ProviderId) => {
    setProvider(id)
    setModel(PROVIDERS.find(p => p.id === id)!.models[0])
  }

  const start = (e: FormEvent) => {
    e.preventDefault()
    if ((def.needsKey && !keyDraft.trim()) || !model.trim()) return
    keyRef.current = keyDraft.trim()
    setKeyDraft('')
    setLive(true)
    signal.celebrate()
    setMsgs([
      {
        id: idRef.current++,
        role: 'assistant',
        reasoning: '',
        content: `Link established: **${def.label}** · \`${model}\`. I am listening.`,
        meta: 'system',
      },
    ])
  }

  const endChat = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    keyRef.current = ''
    setKeyDraft('')
    setMsgs([])
    setInput('')
    setBusy(false)
    setLive(false)
    signal.ingest({ type: 'cancelled' })
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const user: Msg = { id: idRef.current++, role: 'user', content: text, reasoning: '' }
    const reply: Msg = { id: idRef.current++, role: 'assistant', content: '', reasoning: '', model }
    const history: Turn[] = [...msgs.filter(m => !m.meta && !m.error), user].map(m => ({ role: m.role, content: m.content }))
    setMsgs(prev => [...prev, user, reply])
    setBusy(true)
    const ac = new AbortController()
    abortRef.current = ac
    const patch = (fn: (m: Msg) => Msg) => setMsgs(prev => prev.map(m => (m.id === reply.id ? fn(m) : m)))
    const emit = (e: StreamEvent) => {
      signal.ingest(e)
      if (e.type === 'delta') patch(m => ({ ...m, content: m.content + e.content }))
      else if (e.type === 'reasoning') patch(m => ({ ...m, reasoning: m.reasoning + e.content }))
      else if (e.type === 'error') patch(m => ({ ...m, error: e.message }))
      else if (e.type === 'done')
        patch(m => ({
          ...m,
          meta: `${e.tokens} tok · ${(e.elapsedMs / 1000).toFixed(1)}s · ${(e.tokens / Math.max(0.001, e.elapsedMs / 1000)).toFixed(1)} tok/s`,
        }))
      else if (e.type === 'cancelled') patch(m => ({ ...m, meta: m.meta ?? 'interrupted' }))
    }
    try {
      await streamChat({ provider, model, apiKey: keyRef.current, history, emit, abort: ac.signal })
    } catch (err) {
      emit({ type: 'error', message: (err as Error).message })
    } finally {
      setBusy(false)
      if (abortRef.current === ac) abortRef.current = null
    }
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div className="ent">
      <header className="ent-bar">
        <a className="ent-logo" href="/">
          <span className="ent-diamond">◆</span> THE ENTITY
          <small>multi-model neural interface</small>
        </a>
        {live && (
          <div className="ent-link">
            <span className="ent-micro">LINK</span> <span className="ent-dot" /> {def.label}
            <span className="ent-micro"> MODEL</span>
            <ModelSelect models={def.models} value={model} onChange={setModel} compact disabled={busy} />
            <span className="ent-keychip" title="Your key is held in this tab's memory only">
              KEY · MEMORY ONLY
            </span>
          </div>
        )}
        <nav className="ent-actions">
          {live && (
            <button type="button" className="ent-btn ent-btn--end" onClick={endChat}>
              END CHAT · WIPE KEY
            </button>
          )}
          <a className="ent-btn" href="/">
            ← BOSTONAI.IO
          </a>
        </nav>
      </header>

      <main className="ent-main">
        <section className="ent-stage">
          <Telemetry />
          <div className="ent-stage__mode">
            <span className="ent-micro">{def.label.toUpperCase()}</span>
            <span>{live ? model : 'awaiting link'}</span>
          </div>
          <AsciiEntity />
          <div className="ent-stim">
            <span className="ent-micro">STIMULUS</span>
            <button type="button" onClick={() => (signal.stimulus.surge = 1)}>
              SURGE
            </button>
            <button type="button" onClick={() => (signal.stimulus.doubt = 1)}>
              DOUBT
            </button>
            <button type="button" className="is-red" onClick={() => signal.fail()}>
              GLITCH
            </button>
            <button type="button" onClick={() => signal.celebrate()}>
              STABILIZE
            </button>
          </div>
        </section>

        <section className="ent-panel">
          {!live ? (
            <form className="ent-gate" onSubmit={start} autoComplete="off">
              <p className="ent-micro">TRANSMISSION SETUP</p>
              <h1>Talk to The Entity.</h1>
              <p className="ent-gate__lede">
                Bring your own API key and talk to the Entity, the face made of light from Aaron Grace&rsquo;s{' '}
                <em>The Entity</em> desktop app. Watch it contort as the model thinks.
              </p>
              <label className="ent-field">
                <span>LINK</span>
                <select value={provider} onChange={e => pickProvider(e.target.value as ProviderId)}>
                  {PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ent-field">
                <span>MODEL</span>
                <ModelSelect models={def.models} value={model} onChange={setModel} />
              </label>
              {def.needsKey && (
                <label className="ent-field">
                  <span>API KEY</span>
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={e => setKeyDraft(e.target.value)}
                    placeholder={def.keyHint}
                    autoComplete="off"
                    spellCheck={false}
                    data-1p-ignore
                    data-lpignore="true"
                    name="entity-session-key"
                  />
                </label>
              )}
              {def.keyUrl && (
                <a className="ent-getkey" href={def.keyUrl} target="_blank" rel="noreferrer">
                  Get your {def.label} key ↗
                </a>
              )}
              <button className="ent-go" type="submit" disabled={(def.needsKey && !keyDraft.trim()) || !model.trim()}>
                {def.needsKey ? 'OPEN THE LINK' : 'WAKE THE ENTITY'}
              </button>
              <div className="ent-privacy">
                <b>Your key never gets saved.</b> It lives only in this tab&rsquo;s memory: not in storage, cookies or the
                URL. Press <b>End chat</b> or close the tab and it is wiped.{' '}
                {def.needsKey &&
                  (def.viaRelay
                    ? `${def.label} blocks direct browser calls, so requests pass through BostonAI's relay, which forwards them and stores nothing.`
                    : `Requests go straight from your browser to ${def.label}.`)}
              </div>
            </form>
          ) : (
            <>
              <div className="ent-log__head">
                <div>
                  <span className="ent-micro">TRANSMISSION LOG</span>
                  <small>{msgs.length} packets</small>
                </div>
                <button type="button" className="ent-btn" onClick={() => setMsgs(m => m.slice(0, 1))} disabled={busy}>
                  PURGE
                </button>
              </div>
              <div className="ent-log" ref={logRef}>
                {msgs.map(m => (
                  <article key={m.id} className={`ent-msg ent-msg--${m.role}${m.error ? ' is-error' : ''}`}>
                    <header>
                      <span>{m.role === 'user' ? '▸ YOU' : '◆ ENTITY'}</span>
                      {m.role === 'assistant' && <small>{m.model ?? model}</small>}
                    </header>
                    {m.reasoning && (
                      <details className="ent-reason">
                        <summary>reasoning trace · {m.reasoning.length} chars</summary>
                        <p>{m.reasoning}</p>
                      </details>
                    )}
                    {m.content ? (
                      m.role === 'assistant' ? (
                        <div className="ent-md">
                          <Markdown text={m.content} />
                        </div>
                      ) : (
                        <p className="ent-user">{m.content}</p>
                      )
                    ) : (
                      !m.error && <p className="ent-wait">▍</p>
                    )}
                    {m.error && <p className="ent-err">⚠ {m.error}</p>}
                    {m.meta && m.meta !== 'system' && <footer>{m.meta}</footer>}
                  </article>
                ))}
              </div>
              <form
                className="ent-input"
                onSubmit={e => {
                  e.preventDefault()
                  void send()
                }}
              >
                <span className="ent-prompt">&gt;_</span>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="transmit to the entity…  (Enter to send · Shift+Enter newline)"
                  rows={2}
                  autoFocus
                />
                {busy ? (
                  <button type="button" className="ent-send" onClick={() => abortRef.current?.abort()}>
                    STOP
                  </button>
                ) : (
                  <button type="submit" className="ent-send" disabled={!input.trim()}>
                    SEND
                  </button>
                )}
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
