const KEY_STORAGE = 'bostonai.byok.v1'

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'groq'
  | 'gemini'
  | 'ollama'
  | 'custom'

export interface VaultState {
  provider: ProviderId
  /** Only present in memory after load — never log this. */
  apiKey: string
  model: string
  baseUrl: string
  allowNetworkFetch: boolean
}

const DEFAULTS: Omit<VaultState, 'apiKey'> = {
  provider: 'openrouter',
  model: 'anthropic/claude-sonnet-4',
  baseUrl: '',
  allowNetworkFetch: false,
}

/** Patterns that look like secrets — scrub from UI / tool transcripts. */
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
    out = out.replace(re, '[REDACTED]')
  }
  return out
}

export function loadVault(): VaultState {
  try {
    const raw = sessionStorage.getItem(KEY_STORAGE)
    if (!raw) return { ...DEFAULTS, apiKey: '' }
    const parsed = JSON.parse(raw) as Partial<VaultState>
    return {
      ...DEFAULTS,
      provider: parsed.provider ?? DEFAULTS.provider,
      model: parsed.model ?? DEFAULTS.model,
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : '',
      allowNetworkFetch: Boolean(parsed.allowNetworkFetch),
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
    }
  } catch {
    return { ...DEFAULTS, apiKey: '' }
  }
}

export function saveVault(state: VaultState): void {
  // sessionStorage = tab-scoped; clears when the tab closes.
  sessionStorage.setItem(
    KEY_STORAGE,
    JSON.stringify({
      provider: state.provider,
      model: state.model,
      baseUrl: state.baseUrl,
      allowNetworkFetch: state.allowNetworkFetch,
      apiKey: state.apiKey,
    }),
  )
}

export function clearVault(): void {
  sessionStorage.removeItem(KEY_STORAGE)
}

export function providerEndpoint(vault: VaultState): { url: string; headers: Record<string, string> } {
  const key = vault.apiKey.trim()
  if (!key) throw new Error('Add an API key before running the agent.')

  switch (vault.provider) {
    case 'openai':
      return {
        url: (vault.baseUrl || 'https://api.openai.com/v1') + '/chat/completions',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'openrouter':
      return {
        url: (vault.baseUrl || 'https://openrouter.ai/api/v1') + '/chat/completions',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://bostonai.io',
          'X-Title': 'BostonAI',
        },
      }
    case 'groq':
      return {
        url: (vault.baseUrl || 'https://api.groq.com/openai/v1') + '/chat/completions',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'ollama':
      return {
        url: (vault.baseUrl || 'http://127.0.0.1:11434/v1') + '/chat/completions',
        headers: {
          Authorization: `Bearer ${key || 'ollama'}`,
          'Content-Type': 'application/json',
        },
      }
    case 'custom':
      return {
        url: (vault.baseUrl || '').replace(/\/$/, '') + '/chat/completions',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    case 'anthropic':
      return {
        url: (vault.baseUrl || 'https://api.anthropic.com/v1') + '/messages',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    case 'gemini':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(vault.model)}:generateContent?key=${encodeURIComponent(key)}`,
        headers: { 'Content-Type': 'application/json' },
      }
    default:
      throw new Error('Unsupported provider')
  }
}
