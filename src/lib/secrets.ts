const KEY_STORAGE = 'bostonai.vault.v2'
const PROXY_STORAGE = 'bostonai.proxy.v1'

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'ollama-cloud'
  | 'ollama'
  | 'groq'
  | 'gemini'
  | 'kimi'
  | 'prime'
  | 'custom'

export interface VaultState {
  provider: ProviderId
  apiKey: string
  model: string
  baseUrl: string
  allowNetworkFetch: boolean
  /** Route cloud calls through the user's local BostonAI proxy (CORS). */
  useLocalProxy: boolean
}

const DEFAULTS: Omit<VaultState, 'apiKey'> = {
  provider: 'ollama-cloud',
  model: 'kimi-k3',
  baseUrl: '',
  allowNetworkFetch: false,
  useLocalProxy: false,
}

const SECRET_PATTERNS: RegExp[] = [
  /\bsk-[a-zA-Z0-9_-]{8,}\b/g,
  /\bsk-ant-[a-zA-Z0-9_-]{8,}\b/g,
  /\bBearer\s+[a-zA-Z0-9._\-+/]{8,}=*/gi,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bxai-[a-zA-Z0-9_-]{8,}\b/g,
  /\bgsk_[a-zA-Z0-9_-]{8,}\b/g,
]

export function redactSecrets(text: string): string {
  let out = text
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, '[hidden]')
  }
  return out
}

export function loadVault(): VaultState {
  try {
    const raw = sessionStorage.getItem(KEY_STORAGE)
    const proxyFlag = sessionStorage.getItem(PROXY_STORAGE) === '1'
    if (!raw) return { ...DEFAULTS, apiKey: '', useLocalProxy: proxyFlag }
    const parsed = JSON.parse(raw) as Partial<VaultState>
    return {
      ...DEFAULTS,
      provider: parsed.provider ?? DEFAULTS.provider,
      model: parsed.model ?? DEFAULTS.model,
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : '',
      allowNetworkFetch: Boolean(parsed.allowNetworkFetch),
      useLocalProxy: typeof parsed.useLocalProxy === 'boolean' ? parsed.useLocalProxy : proxyFlag,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
    }
  } catch {
    return { ...DEFAULTS, apiKey: '' }
  }
}

export function saveVault(state: VaultState): void {
  sessionStorage.setItem(
    KEY_STORAGE,
    JSON.stringify({
      provider: state.provider,
      model: state.model,
      baseUrl: state.baseUrl,
      allowNetworkFetch: state.allowNetworkFetch,
      useLocalProxy: state.useLocalProxy,
      apiKey: state.apiKey,
    }),
  )
  sessionStorage.setItem(PROXY_STORAGE, state.useLocalProxy ? '1' : '0')
}

export function clearVault(): void {
  sessionStorage.removeItem(KEY_STORAGE)
}

export function providerNeedsKey(provider: ProviderId): boolean {
  return provider !== 'ollama' && provider !== 'prime'
}

export const LOCAL_PROXY_ORIGIN = 'http://127.0.0.1:8787'

function localProxyPrefix(provider: ProviderId): string | null {
  switch (provider) {
    case 'ollama-cloud':
      return `${LOCAL_PROXY_ORIGIN}/ollama-cloud`
    case 'openai':
      return `${LOCAL_PROXY_ORIGIN}/openai`
    case 'anthropic':
      return `${LOCAL_PROXY_ORIGIN}/anthropic`
    case 'kimi':
      return `${LOCAL_PROXY_ORIGIN}/kimi`
    case 'groq':
      return `${LOCAL_PROXY_ORIGIN}/groq`
    case 'openrouter':
      return `${LOCAL_PROXY_ORIGIN}/openrouter`
    case 'gemini':
      return `${LOCAL_PROXY_ORIGIN}/gemini`
    default:
      return null
  }
}

function viteDevProxyPrefix(provider: ProviderId): string | null {
  if (!import.meta.env.DEV) return null
  switch (provider) {
    case 'ollama-cloud':
      return '/proxy/ollama-cloud'
    case 'openai':
      return '/proxy/openai'
    case 'anthropic':
      return '/proxy/anthropic'
    case 'kimi':
      return '/proxy/kimi'
    case 'groq':
      return '/proxy/groq'
    case 'openrouter':
      return '/proxy/openrouter'
    default:
      return null
  }
}

function resolveBase(vault: VaultState, direct: string): string {
  if (vault.useLocalProxy) {
    const local = localProxyPrefix(vault.provider)
    if (local) return local
  }
  const vite = viteDevProxyPrefix(vault.provider)
  if (vite) return vite
  return vault.baseUrl || direct
}

export async function pingLocalProxy(): Promise<boolean> {
  try {
    const res = await fetch(`${LOCAL_PROXY_ORIGIN}/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

export function providerEndpoint(vault: VaultState): { url: string; headers: Record<string, string> } {
  if (vault.provider === 'prime') {
    throw new Error('Prime V1 is almost here — pick another model for now.')
  }

  const key = vault.apiKey.trim()
  if (providerNeedsKey(vault.provider) && !key) {
    throw new Error('Add your API key first. It stays in this tab only.')
  }

  switch (vault.provider) {
    case 'openai':
      return {
        url: `${resolveBase(vault, 'https://api.openai.com')}/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'openrouter':
      return {
        url: `${resolveBase(vault, 'https://openrouter.ai')}/api/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bostonai.io',
          'X-Title': 'BostonAI',
        },
      }
    case 'groq':
      return {
        url: `${resolveBase(vault, 'https://api.groq.com')}/openai/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'ollama-cloud':
      return {
        url: `${resolveBase(vault, 'https://ollama.com')}/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'kimi':
      return {
        url: `${resolveBase(vault, 'https://api.moonshot.ai')}/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'ollama':
      return {
        url: `${vault.baseUrl || 'http://127.0.0.1:11434/v1'}/chat/completions`,
        headers: {
          Authorization: `Bearer ${key || 'ollama'}`,
          'Content-Type': 'application/json',
        },
      }
    case 'custom':
      return {
        url: `${(vault.baseUrl || '').replace(/\/$/, '')}/chat/completions`,
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'anthropic':
      return {
        url: `${resolveBase(vault, 'https://api.anthropic.com')}/v1/messages`,
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      }
    case 'gemini': {
      const base = resolveBase(vault, 'https://generativelanguage.googleapis.com')
      return {
        url: `${base}/v1beta/models/${encodeURIComponent(vault.model)}:generateContent?key=${encodeURIComponent(key)}`,
        headers: { 'Content-Type': 'application/json' },
      }
    }
    default:
      throw new Error('That provider is not supported yet.')
  }
}
