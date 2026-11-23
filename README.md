# BostonAI.io

The company site for **BostonAI**, home of two products:

- **[WorkBot](https://bostonai.io/workbot/)**: the autonomous browser agent (coming soon)
- **[DinoClaw + DinoBuddy](https://bostonai.io/dinoclaw/)**: the desktop AI agent for everyone (coming soon)

Both ship on Windows, macOS, Linux, Steam Deck, iOS and Android.

## Pages

| Route | Source |
| --- | --- |
| `/` | `index.html` → `src/site/pages.tsx` `HomePage` |
| `/workbot/` | `workbot/index.html` → `WorkBotPage` |
| `/dinoclaw/` | `dinoclaw/index.html` → `DinoClawPage` |
| `/frustum/` | `frustum/index.html` → `FrustumPage` (white paper PDF in `public/papers/`) |
| `/blog/` | `blog/index.html` → `BlogPage` (posts in `src/site/blog.ts`, one post per `#slug`) |
| `/#console` | Builder console (`src/Workbench.tsx`), unlinked |

Product copy, stats and competitor comparisons live in `src/site/data.ts`. Images live in `public/img/`; favicons, app icons and the web manifest live in `public/icons/` and `public/`.
To show the Harvard demo photo, add `public/img/harvard-demo.webp`.

## Develop

```bash
npm install
npm run dev
npm run build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy-pages.yml`.

## Security

See [SECURITY.md](./SECURITY.md).
