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
  /** Prefer the one-click local proxy (keys never leave this machine). */
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
    const provider = parsed.provider ?? DEFAULTS.provider
    const model = parsed.model ?? DEFAULTS.model
    return {
      ...DEFAULTS,
      provider,
      model,
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
/** Production CORS relay — keys pass through to the provider only, not stored. */
// Optional chain on env: import.meta.env is undefined under plain Node (test:playbook).
export const CLOUD_RELAY_ORIGIN =
  (import.meta.env?.VITE_CLOUD_RELAY_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://bostonai-relay.aarongrace978.workers.dev'

type RouteProvider = Exclude<ProviderId, 'ollama' | 'prime' | 'custom'>

function routePrefix(provider: ProviderId): string | null {
  switch (provider as RouteProvider | ProviderId) {
    case 'ollama-cloud':
      return 'ollama-cloud'
    case 'openai':
      return 'openai'
    case 'anthropic':
      return 'anthropic'
    case 'kimi':
      return 'kimi'
    case 'groq':
      return 'groq'
    case 'openrouter':
      return 'openrouter'
    case 'gemini':
      return 'gemini'
    default:
      return null
  }
}

function localProxyPrefix(provider: ProviderId): string | null {
  const route = routePrefix(provider)
  return route ? `${LOCAL_PROXY_ORIGIN}/${route}` : null
}

function cloudRelayPrefix(provider: ProviderId): string | null {
  const route = routePrefix(provider)
  return route ? `${CLOUD_RELAY_ORIGIN}/${route}` : null
}

function viteDevProxyPrefix(provider: ProviderId): string | null {
  if (!import.meta.env.DEV) return null
  const route = routePrefix(provider)
  if (!route || route === 'gemini') return null
  return `/proxy/${route}`
}

function resolveBase(vault: VaultState, direct: string): string {
  if (vault.useLocalProxy) {
    const local = localProxyPrefix(vault.provider)
    if (local) return local
  }
  const vite = viteDevProxyPrefix(vault.provider)
  if (vite) return vite
  const cloud = cloudRelayPrefix(vault.provider)
  if (cloud) return cloud
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

export async function pingCloudRelay(): Promise<boolean> {
  try {
    const res = await fetch(`${CLOUD_RELAY_ORIGIN}/health`, { method: 'GET' })
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
