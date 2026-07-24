# BostonAI.io — coding agent

> Boston's go-to agentic coding workspace. **Bring your own API key.** Evidence-gated builds.

The quiet **almanac** that lived at the root through July 2026 is preserved at [`/almanac/`](./public/almanac/) and [`archive/almanac/`](./archive/almanac/).

## What this is

A browser agent inspired by **DinoClaw v0.5.71** completion discipline:

- One Zod-validated JSON decision per step (`tool` | `message`)
- Playbook nudges (mkdir → write → preview)
- **Honest builds** — rejects “already built” with no this-run writes
- Virtual filesystem + sandboxed HTML preview (no OS shell)
- Workspace persists in IndexedDB across visits; export any build as a `.zip`
- Red/green line diffs in the feed for every file the agent writes
- Quest board of one-click starter goals for first-time visitors

## Security

Read **[SECURITY.md](./SECURITY.md)**. Keys stay in `sessionStorage`. Preview iframe is sandboxed without `allow-same-origin`. Path traversal blocked. Optional `fetch_url` is HTTPS-only with private-IP blocking.

## Stack

- React 19 + Vite 8 + TypeScript
- Zod decision validation
- Multi-provider BYOK (OpenRouter, OpenAI, Anthropic, Groq, Gemini, Ollama, custom)

## Develop

```bash
npm install
npm run dev
npm run test:playbook
npm run build
```

## Almanac

Static archive: open `/almanac/` after `npm run dev` or on the deployed site.
