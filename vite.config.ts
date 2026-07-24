import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.moonshot.ai https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://api.together.xyz https://api.fireworks.ai https://api.deepseek.com https://ollama.com ws: wss: http://127.0.0.1:* http://localhost:*",
    "frame-src 'self' blob: null",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
}

export default defineConfig({
  plugins: [react()],
  server: {
    headers: securityHeaders,
    proxy: {
      // Browser CORS bypass for local `npm run dev` only — keys still go to the real provider.
      '/proxy/ollama-cloud': {
        target: 'https://ollama.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/ollama-cloud/, ''),
      },
      '/proxy/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/openai/, ''),
      },
      '/proxy/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/anthropic/, ''),
      },
      '/proxy/kimi': {
        target: 'https://api.moonshot.ai',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/kimi/, ''),
      },
      '/proxy/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/groq/, ''),
      },
      '/proxy/openrouter': {
        target: 'https://openrouter.ai',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy\/openrouter/, ''),
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
})
