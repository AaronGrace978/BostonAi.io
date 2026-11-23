import type { Phase, StreamEvent } from './signal'

/**
 * Browser-side streaming for The Entity on bostonai.io.
 *
 * Keys are passed in per request and never written anywhere: no localStorage, no sessionStorage,
 * no cookies, no URLs. Most providers are called directly from the browser; Ollama Cloud does not
 * allow browser calls, so it goes through BostonAI's relay, which forwards the request and stores
 * nothing.
 */

export type ProviderId = 'simulator' | 'ollama-cloud' | 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq'

export interface ProviderDef {
  id: ProviderId
  label: string
  needsKey: boolean
  keyHint: string
  keyUrl?: string
  models: string[]
  viaRelay?: boolean
}

const RELAY = 'https://bostonai-relay.aarongrace978.workers.dev'

export const PROVIDERS: ProviderDef[] = [
  { id: 'simulator', label: 'Simulator (no key)', needsKey: false, keyHint: '', models: ['entity-sim-1'] },
  {
    id: 'ollama-cloud',
    label: 'Ollama Cloud',
    needsKey: true,
    keyHint: 'Ollama API key',
    keyUrl: 'https://ollama.com/settings/keys',
    models: ['kimi-k3.1-pro', 'kimi-k3', 'glm-5.3', 'deepseek-v4.1-flash', 'gpt-oss:120b', 'mistral-large-4'],
    viaRelay: true,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    needsKey: true,
    keyHint: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-6-luna', 'gpt-6-astra', 'gpt-6.1-sol'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    needsKey: true,
    keyHint: 'sk-ant-…',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    models: ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    needsKey: true,
    keyHint: 'AIza…',
    keyUrl: 'https://aistudio.google.com/apikey',
    models: ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.5-flash-lite'],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    needsKey: true,
    keyHint: 'sk-or-…',
    keyUrl: 'https://openrouter.ai/keys',
    models: ['moonshotai/kimi-k3.1-pro', 'anthropic/claude-sonnet-5.5', 'openai/gpt-6-astra', 'x-ai/grok-4.7'],
  },
  {
    id: 'groq',
    label: 'Groq',
    needsKey: true,
    keyHint: 'gsk_…',
    keyUrl: 'https://console.groq.com/keys',
    models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'],
  },
]

export const SYSTEM_PROMPT =
  'You are THE ENTITY: a sharp, concise, slightly uncanny AI living inside a terminal on bostonai.io, built by Aaron Grace at BostonAI. Answer precisely. Use markdown and fenced code blocks when useful.'

export interface Turn {
  role: 'user' | 'assistant'
  content: string
}

type Emit = (e: StreamEvent) => void

/** Never let a key leak into the UI through an error message. */
function scrub(text: string, key: string) {
  let t = text
  if (key && key.length > 4) t = t.split(key).join('[key hidden]')
  return t.replace(/\b(sk-[\w-]{6,}|sk-ant-[\w-]{6,}|gsk_[\w-]{6,}|AIza[\w-]{10,})/g, '[key hidden]')
}

function endpoint(p: ProviderId, key: string) {
  const json = { 'Content-Type': 'application/json' }
  switch (p) {
    case 'ollama-cloud':
      return { url: `${RELAY}/ollama-cloud/v1/chat/completions`, headers: { ...json, Authorization: `Bearer ${key}` } }
    case 'openai':
      return { url: 'https://api.openai.com/v1/chat/completions', headers: { ...json, Authorization: `Bearer ${key}` } }
    case 'gemini':
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        headers: { ...json, Authorization: `Bearer ${key}` },
      }
    case 'openrouter':
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: { ...json, Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://bostonai.io', 'X-Title': 'The Entity' },
      }
    case 'groq':
      return { url: 'https://api.groq.com/openai/v1/chat/completions', headers: { ...json, Authorization: `Bearer ${key}` } }
    case 'anthropic':
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          ...json,
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      }
    default:
      throw new Error('Unknown provider')
  }
}

/** Reads a server-sent-event stream and hands each `data:` payload to `onData`. */
async function readSse(res: Response, onData: (data: string, event: string) => void) {
  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let event = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).replace(/\r$/, '')
      buf = buf.slice(nl + 1)
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) onData(line.slice(5).trim(), event)
      else if (line === '') event = ''
    }
  }
}

export async function streamChat(opts: {
  provider: ProviderId
  model: string
  apiKey: string
  history: Turn[]
  emit: Emit
  abort: AbortSignal
}) {
  const { provider, model, apiKey, history, emit, abort } = opts
  if (provider === 'simulator') return simulate(history[history.length - 1]?.content ?? '', emit, abort)

  const started = performance.now()
  const window: number[] = []
  let tokens = 0
  let lastTelemetry = 0
  let phase: Phase = 'waiting'
  const tick = (kind: 'delta' | 'reasoning', text: string) => {
    if (!text) return
    emit({ type: kind, content: text })
    phase = kind === 'delta' ? 'generating' : 'reasoning'
    tokens += Math.max(1, Math.round(text.length / 4))
    const now = performance.now()
    window.push(now)
    while (window.length && now - window[0] > 1500) window.shift()
    if (now - lastTelemetry > 100) {
      lastTelemetry = now
      const tps = (window.length * Math.max(1, text.length / 4)) / Math.min(1.5, Math.max(0.25, (now - started) / 1000))
      emit({ type: 'telemetry', tokensPerSecond: tps, confidence: null, tokens, phase })
    }
  }

  emit({ type: 'start' })
  const { url, headers } = endpoint(provider, apiKey)
  const body =
    provider === 'anthropic'
      ? { model, max_tokens: 4096, stream: true, system: SYSTEM_PROMPT, messages: history }
      : { model, stream: true, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history] }

  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: abort, referrerPolicy: 'no-referrer' })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return emit({ type: 'cancelled' })
    const msg =
      provider === 'ollama-cloud'
        ? 'Could not reach Ollama Cloud through the BostonAI relay. Try again in a moment, or pick another provider.'
        : 'Could not reach the provider from this browser. Check your connection, or try another provider.'
    return emit({ type: 'error', message: msg })
  }
  if (!res.ok || !res.body) {
    const raw = await res.text().catch(() => '')
    let detail = raw.slice(0, 300)
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } | string }
      detail = typeof j.error === 'string' ? j.error : (j.error?.message ?? detail)
    } catch {
      /* not JSON */
    }
    const hint = res.status === 401 || res.status === 403 ? ' Check that the key is right for this provider.' : ''
    return emit({ type: 'error', message: scrub(`${res.status} ${detail}`.trim(), apiKey) + hint })
  }

  try {
    await readSse(res, (data, event) => {
      if (data === '[DONE]') return
      let j: Record<string, unknown>
      try {
        j = JSON.parse(data)
      } catch {
        return
      }
      if (provider === 'anthropic') {
        if (event === 'error' || j.type === 'error') throw new Error(String((j.error as { message?: string })?.message ?? 'stream error'))
        if (j.type === 'content_block_delta') {
          const d = j.delta as { type?: string; text?: string; thinking?: string }
          if (d.type === 'text_delta') tick('delta', d.text ?? '')
          else if (d.type === 'thinking_delta') tick('reasoning', d.thinking ?? '')
        }
        return
      }
      if (j.error) throw new Error(String((j.error as { message?: string })?.message ?? 'stream error'))
      const choice = (j.choices as Array<{ delta?: Record<string, unknown> }> | undefined)?.[0]
      const d = choice?.delta ?? {}
      const reasoning = (d.reasoning_content ?? d.reasoning ?? '') as string
      if (typeof reasoning === 'string' && reasoning) tick('reasoning', reasoning)
      if (typeof d.content === 'string') tick('delta', d.content)
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return emit({ type: 'cancelled' })
    return emit({ type: 'error', message: scrub((err as Error).message, apiKey) })
  }
  emit({ type: 'done', tokens, elapsedMs: performance.now() - started, confidence: null })
}

/* ── Offline simulator, from The-Entity's src/lib/simulator.ts ── */

const RESPONSES = [
  `Signal acquired. I am **THE ENTITY**: a lattice of probabilities wearing a face.

Every token I emit bends the geometry you are looking at:

- **Throughput** speeds up the noise in my skin.
- **Uncertainty** loosens my structure into stray glyphs.
- **Errors** tear the render and shift me red.

Paste a key for a real provider and I will speak with its voice. When you end the chat, the key is gone.`,
  `Running diagnostics on the cortex mesh...

| Subsystem | State |
| --- | --- |
| Token stream | nominal |
| Key storage | none (memory only) |
| Glitch buffer | armed |

Ask me something hard. Watch what happens to my face while I think.`,
]

const UNSURE =
  'I... am not certain. The archive returns conflicting shards. My confidence is collapsing; treat everything here as speculative.'

function sleep(ms: number, abort: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    abort.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })
}

async function simulate(prompt: string, emit: Emit, abort: AbortSignal) {
  const lower = prompt.toLowerCase()
  const fail = /\b(fail|crash|error|break)/.test(lower)
  const unsure = /\b(hallucinat|unsure|guess|doubt)\w*/.test(lower)
  const text = unsure ? UNSURE : RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
  const started = performance.now()
  let tokens = 0
  const win: number[] = []
  let last = 0
  emit({ type: 'start' })
  try {
    for (let i = 0; i < 8; i++) {
      await sleep(70, abort)
      emit({ type: 'telemetry', tokensPerSecond: 0, confidence: null, tokens: 0, phase: 'waiting' })
    }
    for (const word of 'Parsing intent. Cross-referencing memory shards. Selecting response vector.'.split(/(?<= )/)) {
      await sleep(35, abort)
      emit({ type: 'reasoning', content: word })
    }
    const chunks = text.match(/\s*\S+/g) ?? []
    let confidence = unsure ? 0.55 : 0.92
    for (let i = 0; i < chunks.length; i++) {
      await sleep(Math.sin(i / 9) > 0.2 ? 14 : 45, abort)
      if (fail && i === Math.floor(chunks.length * 0.45)) {
        emit({ type: 'error', message: 'Simulated failure: the build pipeline returned exit code 101.' })
        return
      }
      emit({ type: 'delta', content: chunks[i] })
      tokens += 1
      const now = performance.now()
      win.push(now)
      while (win.length && now - win[0] > 1500) win.shift()
      confidence = Math.min(0.99, Math.max(unsure ? 0.15 : 0.6, confidence + (Math.random() - 0.5) * 0.08 + (unsure ? -0.01 : 0.004)))
      if (now - last > 100) {
        last = now
        emit({
          type: 'telemetry',
          tokensPerSecond: win.length / Math.min(1.5, Math.max(0.25, (now - started) / 1000)),
          confidence,
          tokens,
          phase: 'generating',
        })
      }
    }
    emit({ type: 'done', tokens, elapsedMs: performance.now() - started, confidence })
  } catch (e) {
    if ((e as Error).name === 'AbortError') emit({ type: 'cancelled' })
    else throw e
  }
}
