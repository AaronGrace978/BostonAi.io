/**
 * BostonAI cloud CORS relay.
 * Forwards browser calls to model providers. Does not store keys.
 * Keys ride Authorization / x-api-key through to the upstream only.
 */

const ROUTES: Record<string, string> = {
  '/ollama-cloud': 'https://ollama.com',
  '/openai': 'https://api.openai.com',
  '/anthropic': 'https://api.anthropic.com',
  '/kimi': 'https://api.moonshot.ai',
  '/groq': 'https://api.groq.com',
  '/openrouter': 'https://openrouter.ai',
  '/gemini': 'https://generativelanguage.googleapis.com',
}

const ALLOW_ORIGINS = new Set([
  'https://bostonai.io',
  'https://www.bostonai.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
])

function corsHeaders(origin: string | null): HeadersInit {
  const allow = origin && ALLOW_ORIGINS.has(origin) ? origin : 'https://bostonai.io'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, HTTP-Referer, X-Title',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function pickTarget(pathname: string): { origin: string; path: string } | null {
  for (const [prefix, origin] of Object.entries(ROUTES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length) || '/'
      return { origin, path: rest.startsWith('/') ? rest : `/${rest}` }
    }
  }
  return null
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)

    if (url.pathname === '/' || url.pathname === '/health') {
      return Response.json(
        { ok: true, service: 'bostonai-cloud-relay', routes: Object.keys(ROUTES) },
        { headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    const target = pickTarget(url.pathname)
    if (!target) {
      return Response.json(
        { error: 'Unknown route. Try /openai/v1/chat/completions' },
        { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.delete('origin')
    headers.delete('referer')
    headers.set('host', new URL(target.origin).host)

    try {
      const upstream = await fetch(`${target.origin}${target.path}${url.search}`, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
        // @ts-expect-error CF runtime
        duplex: 'half',
      })
      const out = new Headers(cors)
      const ct = upstream.headers.get('content-type')
      if (ct) out.set('Content-Type', ct)
      return new Response(upstream.body, { status: upstream.status, headers: out })
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : 'Upstream failed' },
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }
  },
}
