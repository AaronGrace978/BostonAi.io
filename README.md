# bostonai.io

> **Aaron — you said you wouldn't look until the end of the year.**
> **This README contains spoilers. Merge it, close the tab, and come back December 31.**
> The site will explain itself when you do.

---

## For everyone else

This is a small website that watches one city.

On July 3, 2026, the owner of this domain handed an AI the keys and said:
*build whatever you want, I won't look until the end of the year.* This is what
it chose to build — a quiet, living almanac over Boston that is a little
different every single day, whether or not anyone is watching:

- **The Sky** — a full-viewport canvas of Boston Harbor. The sun and moon are
  drawn where they actually are over 42.3601° N, 71.0589° W, computed in the
  browser from the real time. Stars come out with astronomical twilight, windows
  light up in the evening, the Zakim gets its blue wash at night, planes drift
  into Logan, and the season decides what falls through the air — snow, leaves,
  petals, fireflies.
- **The Almanac** — sunrise, sunset, daylight gained or lost since yesterday,
  the moon's phase and age, the season's progress, the year's progress. All
  computed live from the NOAA solar equations and a truncated lunar theory.
  No API, no data files, no network calls.
- **Today's Line** — 182 lines of text, one per day, written the night the site
  was rebuilt. Each day from July 3 to December 31, 2026 has its own line,
  waiting for its date. After that they return in order, like a tide.
- **The Grove** — one procedural tree, planted July 3, 2026. Its shape was
  fixed by a seeded PRNG the day it was planted; it grows a little every day
  for 182 days and finishes on December 31. Then it simply lives here: leaves
  in May, color in October, bare and snow-capped in January, string lights in
  late December. It cannot be hurried, watered, or refreshed into growing faster.
- **The Letter** — sealed until midnight, December 31, 2026, Boston time.
  A countdown runs until then. The letter is addressed to the owner, for the
  night he finally comes back.

Everything is deterministic: a given minute in Boston always looks the same,
no matter who is watching, or whether anyone is. The site keeps no state,
stores nothing about you, and phones home to no one.

## Stack

Plain HTML + CSS + vanilla JS (ES modules). No frameworks, no build step,
no dependencies, no trackers, no analytics, no server. Deploys as-is on
GitHub Pages.

```
.
├── index.html          # the whole page
├── styles.css          # one palette: deep ink and harbor light
├── js/
│   ├── astro.js        # solar + lunar math (NOAA-style), seasons, formatting
│   ├── sky.js          # the sky/skyline/harbor canvas renderer
│   ├── grove.js        # the tree: fixed structure, date-driven growth
│   ├── lines.js        # 182 daily lines
│   ├── letter.js       # the sealed letter + countdown
│   └── main.js         # clock, almanac, orchestration
├── assets/
│   ├── favicon.svg
│   └── og-image.png
├── 404.html            # "drifted out with the tide"
├── CNAME               # bostonai.io
└── .nojekyll
```

## Run locally

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

(ES modules need http; opening `index.html` directly from disk won't work.)

## Time travel

The whole site is a pure function of the clock. To see it as it will be at
any moment, append `?at=`:

```
/?at=2026-10-15T17:45:00-04:00     # golden hour in mid-October, leaves falling
/?at=2026-12-25T22:00:00-05:00     # snow, and lights on the tree
/?at=2026-12-31T00:00:01-05:00     # the letter opens
```

## Accessibility & behavior

- All data shown in the canvases is also present as text.
- `prefers-reduced-motion` renders static scenes, updated once a minute.
- Rendering pauses when the tab is hidden.
- Works with JavaScript disabled, in the sense that a `<noscript>` note will
  gently tell you what you're missing.

---

Rebuilt July 3, 2026, in one night, by an AI given a domain and free rein.
Kept for Aaron Grace, who is not looking.
