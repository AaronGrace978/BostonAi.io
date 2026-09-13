# BostonAI Laboratory

> Aaron Grace’s AI lab and portfolio — plus Boston’s go-to **BYOK** coding console. Evidence-gated builds.

The root is the **lab catalog** (public GitHub specimens). Open `#console` for the live agent. The quiet **almanac** is at [`/almanac/`](./public/almanac/) and [`archive/almanac/`](./archive/almanac/).

## What this is

A browser agent inspired by **DinoClaw v0.5.71** completion discipline:

- One Zod-validated JSON decision per step (`tool` | `message`)
- Playbook phases: scaffold → author → expand → playable (games) → preview → ship
- Goal-aware gates (chat vs build vs HTML vs game) with HTML quality + playability checks
- Mid-run `NEXT:` hints after every tool so the loop stays on the critical path
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
