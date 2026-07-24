import { providerEndpoint, redactSecrets, type VaultState } from '../lib/secrets'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callModel(vault: VaultState, messages: ChatMessage[]): Promise<string> {
  if (vault.provider === 'anthropic') return callAnthropic(vault, messages)
  if (vault.provider === 'gemini') return callGemini(vault, messages)
  return callOpenAICompatible(vault, messages)
}

async function callOpenAICompatible(vault: VaultState, messages: ChatMessage[]): Promise<string> {
  const { url, headers } = providerEndpoint(vault)
  if (vault.provider === 'custom' && !vault.baseUrl) {
    throw new Error('Custom provider requires a base URL (OpenAI-compatible).')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: vault.model,
      temperature: 0.2,
      messages,
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    throw new Error(redactSecrets(`Provider error ${res.status}: ${raw.slice(0, 500)}`))
  }

  let data: unknown
  try {
    data = JSON.parse(raw) as unknown
  } catch {
    throw new Error('Provider returned non-JSON')
  }

  const content = (data as {
    choices?: Array<{ message?: { content?: string } }>
  })?.choices?.[0]?.message?.content

  if (!content || typeof content !== 'string') {
    throw new Error('Provider response missing message content')
  }
  return content
}

async function callAnthropic(vault: VaultState, messages: ChatMessage[]): Promise<string> {
  const { url, headers } = providerEndpoint(vault)
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n')
  const rest = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: vault.model || 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system,
      messages: rest,
    }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(redactSecrets(`Anthropic error ${res.status}: ${raw.slice(0, 500)}`))
  const data = JSON.parse(raw) as { content?: Array<{ type: string; text?: string }> }
  const text = data.content?.filter(c => c.type === 'text').map(c => c.text ?? '').join('\n')
  if (!text) throw new Error('Anthropic response missing text')
  return text
}

async function callGemini(vault: VaultState, messages: ChatMessage[]): Promise<string> {
  const { url, headers } = providerEndpoint(vault)
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n')
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature: 0.2 },
    }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(redactSecrets(`Gemini error ${res.status}: ${raw.slice(0, 500)}`))
  const data = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('\n')
  if (!text) throw new Error('Gemini response missing text')
  return text
}
