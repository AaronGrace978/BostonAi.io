# BostonAI.io — Boston's AI War Room

> Empowering Intelligence, Empowering People, through **WINS**.
> Build fast. Ship quick. Win.

The official site for **BostonAI.io** — Aaron Grace's AI war room. A hackathon-dominator
landing page built as a zero-dependency static site, ready to deploy on **GitHub Pages**.

---

## Stack

- Plain **HTML + CSS + vanilla JS** — no build step, no frameworks, instant deploy.
- Google Fonts: Space Grotesk, Inter, JetBrains Mono.
- Animated grid background, pointer-tracking glow, scroll reveals, count-up stats,
  live "war-room" terminal, glitch + marquee effects.
- Fully responsive, accessible (skip link, focus styles, reduced-motion support).

## File structure

```
.
├── index.html        # all sections (hero, war room, focus, mission, CTA, footer)
├── styles.css        # dominator dark theme + animations + responsive
├── script.js         # nav, scroll reveals, counters, spotlight, typing terminal
├── assets/
│   ├── favicon.svg    # bolt monogram
│   └── og-image.svg   # social share card
├── CNAME             # custom domain → bostonai.io
├── .nojekyll         # serve files as-is (skip Jekyll)
├── robots.txt
└── sitemap.xml
```

## Run locally

Just open `index.html`, or serve it:

```bash
python -m http.server 8080
# → http://localhost:8080
```

## Deploy to GitHub Pages

1. Create a repo (e.g. `bostonai-io`) and push this folder:

   ```bash
   git init
   git add .
   git commit -m "Launch BostonAI.io war room"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)** → Save.

3. **Custom domain (`bostonai.io`)** — the `CNAME` file already targets `bostonai.io`.
   Point your DNS (moving off GoDaddy) at GitHub Pages:

   | Type  | Host  | Value |
   |-------|-------|-------|
   | A     | `@`   | `185.199.108.153` |
   | A     | `@`   | `185.199.109.153` |
   | A     | `@`   | `185.199.110.153` |
   | A     | `@`   | `185.199.111.153` |
   | CNAME | `www` | `<you>.github.io.` |

   Then in **Settings → Pages**, set the custom domain to `bostonai.io` and enable
   **Enforce HTTPS**. DNS can take up to ~24h to propagate.

   > Not ready to switch the domain yet? Delete the `CNAME` file and the site will live
   > at `https://<you>.github.io/<repo>/` instead.

## Customize

- **Copy / sections** → `index.html`
- **Colors / fonts / spacing** → CSS variables at the top of `styles.css` (`:root`)
- **Links** → update `mailto:aaron@bostonai.io`, the Cursor Boston link, and the
  footer social URLs (X / LinkedIn / GitHub) in `index.html`.

---

Made in Boston. Built for humans.
