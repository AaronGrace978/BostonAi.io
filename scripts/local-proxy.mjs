#!/usr/bin/env node
/**
 * BostonAI local proxy — kills browser CORS so cloud providers work from the site.
 * Your keys still go only to the provider you chose. Nothing is stored here.
 *
 *   npm run proxy
 *   # then open https://bostonai.io (or localhost) and click "Use local proxy"
 */
import http from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.BOSTONAI_PROXY_PORT || 8787)

const ROUTES = {
  '/ollama-cloud': 'https://ollama.com',
  '/openai': 'https://api.openai.com',
  '/anthropic': 'https://api.anthropic.com',
  '/groq': 'https://api.groq.com',
  '/openrouter': 'https://openrouter.ai',
  '/gemini': 'https://generativelanguage.googleapis.com',
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, HTTP-Referer, X-Title',
  'Access-Control-Max-Age': '86400',
}

function pickTarget(pathname) {
  for (const [prefix, origin] of Object.entries(ROUTES)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      const rest = pathname.slice(prefix.length) || '/'
      return { origin, path: rest.startsWith('/') ? rest : `/${rest}` }
    }
  }
  return null
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

  if (url.pathname === '/' || url.pathname === '/health') {
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'bostonai-local-proxy', port: PORT, routes: Object.keys(ROUTES) }))
    return
  }

  const target = pickTarget(url.pathname)
  if (!target) {
    res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Unknown route. Try /ollama-cloud/v1/chat/completions' }))
    return
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks)

  const headers = { ...req.headers }
  delete headers.host
  delete headers.origin
  delete headers.referer
  headers.host = new URL(target.origin).host

  try {
    const upstream = await fetch(`${target.origin}${target.path}${url.search}`, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
    })
    const buf = Buffer.from(await upstream.arrayBuffer())
    const outHeaders = { ...CORS, 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
    res.writeHead(upstream.status, outHeaders)
    res.end(buf)
  } catch (err) {
    res.writeHead(502, { ...CORS, 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Upstream failed' }))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log('')
  console.log('  BostonAI local proxy')
  console.log(`  http://127.0.0.1:${PORT}`)
  console.log('  Keep this window open. In BostonAI, turn on “Local proxy”.')
  console.log('')
})
