export const COMPANY = {
  name: 'BostonAI',
  domain: 'bostonai.io',
  tagline: 'Agents that do the work, on hardware you already own.',
  founder: 'Aaron Grace',
  email: 'aarongrace978@gmail.com',
  github: 'https://github.com/AaronGrace978',
  community: { label: 'Cursor Boston', href: 'https://CursorBoston.com' },
}

export const mail = (subject: string, body = '') =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`

export type Platform = 'windows' | 'macos' | 'linux' | 'steamdeck' | 'ios' | 'android'

export const PLATFORM_LABEL: Record<Platform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  steamdeck: 'Steam Deck',
  ios: 'iOS',
  android: 'Android',
}

export const ALL_PLATFORMS: Platform[] = ['windows', 'macos', 'linux', 'steamdeck', 'ios', 'android']

export type Feature = { title: string; body: string }

/** A comparison cell: true = yes, false = no, string = qualified answer. */
export type Cell = boolean | string

export type CompareRow = { label: string; cells: Cell[] }

export type Comparison = {
  columns: string[]
  rows: CompareRow[]
  honest: string
  footnote: string
}

export type Product = {
  id: 'workbot' | 'dinoclaw'
  name: string
  version: string
  href: string
  repo: string
  releases: string
  icon: string
  kicker: string
  headline: string
  lede: string
  hero: string
  heroAlt: string
  stats: { v: string; k: string }[]
  features: Feature[]
  companion: { name: string; title: string; body: string; image: string; points: string[] }
  steamDeck: string
  mobile: string
  compare: Comparison
}

export const WORKBOT: Product = {
  id: 'workbot',
  name: 'WorkBot',
  version: '2.5',
  href: '/workbot/',
  repo: 'https://github.com/AaronGrace978/WorkBot',
  releases: 'https://github.com/AaronGrace978/WorkBot/releases',
  icon: '/img/workbot-icon.webp',
  kicker: 'Autonomous browser agent',
  headline: 'Describe the outcome. WorkBot clicks, reads, fills and finishes it.',
  lede:
    'WorkBot drives its own Chrome window on your machine, sees the page the way you do, reads the room when a site pushes back, and turns every successful run into a reusable playbook.',
  hero: '/img/workbot-app.webp',
  heroAlt: 'WorkBot 2.0 task screen with Robo, the 3D companion, standing by',
  stats: [
    { v: '5', k: 'model providers + any custom model ID' },
    { v: '5-pt', k: 'hit-test before every click' },
    { v: '~150ms', k: 'to continue on a static page' },
    { v: '0', k: 'keys or memories sent to us' },
  ],
  features: [
    {
      title: 'Deep spatial awareness',
      body: 'Hit-tests five points on every target, detects clipped scroll containers, modal focus traps and sticky headers before it clicks. Most "element not found" failures simply disappear.',
    },
    {
      title: 'Gold Standard playbooks',
      body: 'Each successful run becomes a structured trajectory: dead ends pruned, values turned into placeholders, workarounds saved as pitfalls. Repeat workflows gain confidence every time they verify.',
    },
    {
      title: 'Cross-tab synthesis',
      body: 'Reads several tabs in parallel without stealing focus, pins findings that survive context trimming, and builds side-by-side comparisons in the live Tabs view.',
    },
    {
      title: 'Reads the room',
      body: 'Watches for 401/403/429/5xx, error toasts, invalid fields, stalled spinners and CAPTCHA walls. Friction escalates the Neural Stack to its deep-reasoning tier on the spot.',
    },
    {
      title: 'Second nature',
      body: 'Plain commands run instantly with no model in the loop. Clean tasks are remembered and replayed in seconds, and replay stops before any final Submit or Send.',
    },
    {
      title: 'Desktop control, gated',
      body: 'Opt-in screen scanning, app launching and approved-folder file tools. Every irreversible action passes a review gate first. Payments, credentials and CAPTCHA bypasses are refused in code.',
    },
    {
      title: 'Resume & cover letter engine',
      body: 'Store your resume once, generate tailored PDF/DOCX cover letters grounded only in your real background, and attach them to any file input or drop zone.',
    },
    {
      title: 'Neural Stack routing',
      body: 'Fast tier for routine steps, Apex tier for planning and recovery, optional local vision/DOM/router models. If a provider refuses or overloads, the step retries on the next key you hold.',
    },
    {
      title: 'Voice Mode',
      body: 'Talk to WorkBot, interrupt it mid-task, and hear replies back. Auto-send keeps your hands free while Robo acts out what is happening.',
    },
  ],
  companion: {
    name: 'Robo',
    title: 'Meet Robo, the agent you can actually watch.',
    body: 'Robo is a rigged 3D character who lives beside the chat. He types while WorkBot acts, rests his chin while it thinks, shrugs when a site blocks it and celebrates when the job is done. His glow tracks the live friction level.',
    image: '/img/workbot-hero.webp',
    points: ['Sidekick or full Character mode', 'Wave, walk, dance, celebrate, think, nod', '30 fps when calm, paused when hidden'],
  },
  steamDeck:
    'Runs as an AppImage in Desktop Mode. The default 1180×720 window fits the Deck’s 1280×800 screen, Flatpak Chrome and Chromium are found automatically, and touch targets scale up.',
  mobile: 'Start tasks, follow Robo and approve steps from your phone with WorkBot for iOS and Android.',
  compare: {
    columns: ['WorkBot', 'OpenAI Dots', 'Grok Bot'],
    rows: [
      { label: 'Runs on your own machine', cells: [true, 'OpenAI cloud computer', 'SpaceXAI cloud computer'] },
      { label: 'Your logins stay in a local browser profile', cells: [true, false, 'Shared cloud browser'] },
      { label: 'Pick any model vendor', cells: ['OpenAI, Anthropic, Gemini, Ollama, OpenRouter', 'OpenAI only', 'Grok only'] },
      { label: 'Local / offline models', cells: ['Ollama specialists', false, false] },
      { label: 'Pricing', cells: ['Bring your own key, no subscription', 'ChatGPT Pro / Business Premium', 'SpaceXAI beta access'] },
      { label: 'Learns workflows', cells: ['Gold Standard playbooks + instant replay', '—', 'Teach by demonstration'] },
      { label: 'Pre-click spatial hit-testing', cells: [true, '—', '—'] },
      { label: 'Friction detection & automatic pivots', cells: [true, '—', 'Hands blocked steps back'] },
      { label: 'Hard limits enforced in code', cells: ['No payments, credentials or CAPTCHA bypass', '—', '—'] },
      { label: 'Native Steam Deck app', cells: [true, false, false] },
      { label: 'Keeps working after you close the lid', cells: ['While your machine is on', true, true] },
    ],
    honest:
      'Where they win: Dots and Grok Bot keep running in the cloud after your laptop sleeps, and Grok Bot ships first-party connectors. WorkBot wins on privacy, model choice, cost and reliability on hostile pages.',
    footnote:
      'Based on publicly documented features as of November 2026. “—” means not publicly documented. Dots is a product of OpenAI; Grok Bot is a product of SpaceXAI. Both are trademarks of their owners.',
  },
}

export const DINOCLAW: Product = {
  id: 'dinoclaw',
  name: 'DinoClaw',
  version: '0.6.84',
  href: '/dinoclaw/',
  repo: 'https://github.com/AaronGrace978/DinoClaw',
  releases: 'https://github.com/AaronGrace978/DinoClaw/releases/latest',
  icon: '/img/dinoclaw-icon.webp',
  kicker: 'Desktop AI agent + DinoBuddy',
  headline: 'The claw agent for everyone who never wanted a terminal.',
  lede:
    'DinoClaw is a full desktop AI agent that builds apps, runs missions, tidies files, plays games with you and remembers who you are. DinoBuddy, his 3D companion, keeps you company while he works.',
  hero: '/img/dinoclaw-projects.webp',
  heroAlt: 'DinoClaw Project Home with build evidence, visual checks and a procedural terrain build',
  stats: [
    { v: '55', k: 'built-in tools with risk tiers' },
    { v: '8', k: 'AI providers, local or cloud' },
    { v: '100+', k: 'skill packs, loaded on demand' },
    { v: '17', k: 'themes, each with a 3D habitat' },
  ],
  features: [
    {
      title: 'P.R.I.M.E. build harness',
      body: 'Intake → Research → Plan → Guard → Execute → Verify. Every step names its tool and expected outcome. Builds must actually run before Dino can call them done.',
    },
    {
      title: 'Project Home',
      body: 'Goal, folder, build evidence, visual checks, blockers and “where Dino left off” for every project. One click to continue exactly where the last mission stopped.',
    },
    {
      title: 'Game Buddy',
      body: 'DinoBuddy can play for you, join as player 2, or watch and commentate. A TAS-style input harness drives games through uinput on Steam Deck, SendInput on Windows and CGEvent on macOS.',
    },
    {
      title: 'Desktop Copilot',
      body: 'Opt-in OS automation: launch apps, focus windows, click, drag, type, hotkeys and screenshots on Windows and Linux / Steam Deck.',
    },
    {
      title: 'Temporal Continuity',
      body: 'A state vector that keeps drifting between sessions, plus semantic local memory, so Dino picks up where you left off instead of booting fresh.',
    },
    {
      title: 'The Dino Creed',
      body: 'Identity, relationship, directives, vows, motto and personality sliders, all editable. Conversation register adapts between real work, banter and personal moments.',
    },
    {
      title: 'Teach Dino a workflow',
      body: 'Turn any successful run into a reviewable skill. Workflow Studio adds steps, inputs, branches, previews and version history.',
    },
    {
      title: 'Connects everywhere',
      body: 'Telegram and Discord bots, a paired REST gateway, webhooks, cron-style schedules, tunnels and a Docker sandbox for risky commands.',
    },
    {
      title: 'Safety you can see',
      body: 'Open / review-risky / lockdown policies, approval modals with countdowns, a full audit log, file checkpoints with reviewed rollback, and a Stop button that actually stops.',
    },
  ],
  companion: {
    name: 'DinoBuddy',
    title: 'DinoBuddy is the face of the agent.',
    body: 'A fully rigged 3D dinosaur with moods that track how missions are going. He blinks, sleeps, wags his tail, stomps when he is happy, and talks back with lip-synced speech. Hold or right-click him for emotes, snap a photo, or open a chat sheet.',
    image: '/img/dinobuddy.webp',
    points: ['Emote wheel, photo mode and chat sheet', 'Mood follows real mission outcomes', 'Bundled Kokoro voice, local speech input'],
  },
  steamDeck:
    'Built on and for the Deck. One script installs from the tarball, then add DinoClaw to Steam as a non-Steam game. Gamepad and touch controls, a Deck OLED theme, and Game Buddy works in both Game Mode and Desktop Mode.',
  mobile: 'Dino Link on iOS and Android: approve risky actions from push notifications, check missions and chat with DinoBuddy away from your desk.',
  compare: {
    columns: ['DinoClaw', 'OpenClaw', 'NanoClaw · ZeroClaw · PicoClaw · IronClaw'],
    rows: [
      { label: 'Full desktop app, no terminal required', cells: [true, 'CLI + chat apps', 'CLI-first'] },
      { label: 'One-click installers incl. Steam Deck', cells: [true, 'Package-manager install', 'Binaries / build from source'] },
      { label: 'Builds must run before “done” (verify gate)', cells: [true, false, false] },
      { label: 'Project Home with build evidence & resume', cells: [true, false, false] },
      { label: 'Animated 3D companion with moods', cells: ['DinoBuddy', false, false] },
      { label: 'Plays games with you (Game Buddy)', cells: [true, false, false] },
      { label: 'Persistent memory & personality', cells: ['Creed + Temporal Continuity', 'SOUL.md + memory', 'Varies'] },
      { label: 'Approval modals, risk tiers, audit log', cells: [true, 'Partial', 'Strong isolation (NanoClaw, IronClaw)'] },
      { label: 'Local models via Ollama', cells: [true, true, true] },
      { label: 'Chat channels', cells: ['Telegram, Discord, webhooks', 'Widest ecosystem', 'Fewer integrations'] },
      { label: 'Gamepad-native Steam Deck UI', cells: [true, false, false] },
    ],
    honest:
      'Where they win: OpenClaw has the largest channel and skill ecosystem, and PicoClaw / ZeroClaw run on tiny boards with megabytes of RAM. DinoClaw wins for people who want a finished product: a real app, proven builds and a companion they actually like.',
    footnote:
      'Based on publicly documented features as of November 2026. OpenClaw and the listed variants are independent open-source projects and are not affiliated with BostonAI.',
  },
}

export const PRODUCTS = [WORKBOT, DINOCLAW]
