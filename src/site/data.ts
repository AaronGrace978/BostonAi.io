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
  pitch: { title: string; body: string }
  useCases: { title: string; body: string }[]
  reasons: { title: string; body: string }[]
  steps: string[]
  mobileShots: { src: string; caption: string; h?: number }[]
}

export const WORKBOT: Product = {
  id: 'workbot',
  name: 'WorkBot',
  version: '2.5',
  href: '/workbot/',
  repo: 'https://github.com/AaronGrace978/WorkBot',
  releases: 'https://github.com/AaronGrace978/WorkBot/releases',
  icon: '/icons/workbot.svg',
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
  mobile: 'WorkBot Mobile runs the agent on the phone itself, with its own private in-app browser, Robo in 3D, voice dictation and spoken replies.',
  compare: {
    columns: ['WorkBot', 'OpenAI Dots', 'Grok Bot', 'Meta Muse', 'Perplexity Comet', 'Chrome + Gemini', 'Claude in Chrome'],
    rows: [
      {
        label: 'Where it runs',
        cells: ['Your machine', 'OpenAI cloud computer', 'SpaceXAI cloud computer', 'Meta cloud computer', 'Comet browser', 'Chrome browser', 'Chrome extension'],
      },
      {
        label: 'Choose any model vendor',
        cells: ['OpenAI, Anthropic, Gemini, Ollama, OpenRouter + custom', 'OpenAI only', 'Grok only', 'Meta Muse only', 'Perplexity picks', 'Gemini only', 'Claude only'],
      },
      { label: 'Local / offline models', cells: ['Ollama specialists', false, false, false, false, false, false] },
      {
        label: 'Price',
        cells: ['Bring your own key, no subscription', 'ChatGPT Pro / Business Premium', 'SpaceXAI beta', '—', 'Free', 'Google AI Pro ($20/mo) and up', 'Claude Pro ($20/mo) and up'],
      },
      { label: 'Works in desktop apps, not just the browser', cells: ['Yes, with a review gate', 'Inside its cloud VM', 'Inside its cloud computer', 'Inside its cloud computer', false, false, false] },
      { label: 'Turns runs into reusable playbooks + instant replay', cells: [true, '—', 'Teach by demonstration', '—', '—', '—', '—'] },
      { label: 'Five-point hit-test before every click', cells: [true, '—', '—', '—', '—', '—', '—'] },
      { label: 'Detects site friction and pivots on its own', cells: [true, '—', 'Hands blocked steps back', '—', '—', '—', '—'] },
      { label: 'Hard limits in code: no payments, credentials or CAPTCHA bypass', cells: [true, '—', '—', 'Sentinel guard agent', '—', '—', '—'] },
      { label: 'Resume & cover-letter engine built in', cells: [true, '—', '—', '—', '—', '—', '—'] },
      { label: 'Animated companion you can watch work', cells: ['Robo', '—', '—', '—', '—', '—', '—'] },
      { label: 'Native Steam Deck app', cells: [true, false, false, false, '—', '—', '—'] },
      { label: 'Keeps working after you close the lid', cells: ['While your machine is on', true, true, true, false, false, false] },
    ],
    honest:
      'Where they win: the cloud agents (Dots, Grok Bot, Muse) keep running while your laptop sleeps, and Comet is free. WorkBot is the only one that lets you pick any model, run local models, keep every key, login and document on your own machine, and work outside the browser.',
    footnote:
      'Based on publicly documented features and pricing as of November 2026; prices change, check each vendor. “—” means not publicly documented. All product names are trademarks of their respective owners, none of whom are affiliated with BostonAI.',
  },
  pitch: {
    title: 'Stop babysitting tabs. Hand WorkBot the boring part.',
    body: 'Forms, applications, research, data entry, comparisons: the work that eats your afternoon is exactly the work WorkBot was built to finish. You describe the outcome, Robo does the clicking, and you approve before anything gets submitted.',
  },
  useCases: [
    { title: 'Job seekers', body: 'Tailored cover letters from your real resume, attached and filled into every application form, reviewed before you hit submit.' },
    { title: 'Operations & admin', body: 'Fill the same portal forms, vendor sites and CRMs every week. Second-nature replay finishes repeat jobs in seconds.' },
    { title: 'Research & sales', body: 'Open ten tabs, extract the facts, and get a side-by-side comparison or lead list without copying a single cell.' },
    { title: 'Founders & freelancers', body: 'One assistant for the web chores across every tool you use, on the model you already pay for.' },
  ],
  reasons: [
    { title: 'Your keys. Your logins. Your machine.', body: 'Cloud agents need your passwords on their servers. WorkBot keeps sessions in a local Chrome profile and keys on your disk.' },
    { title: 'No new subscription', body: 'Bring the API key you already have, or run local models through Ollama. You pay your model provider, not us.' },
    { title: 'It finishes on hostile pages', body: 'Hit-testing, friction detection and Gold Standard playbooks are why WorkBot completes tasks other agents abandon.' },
  ],
  steps: ['Download WorkBot for desktop or Steam Deck', 'Paste an API key, or point it at Ollama', 'Describe the outcome and watch Robo work'],
  mobileShots: [
    { src: '/img/m-workbot-chat.webp', caption: 'Chat with Robo and hand off a task' },
    { src: '/img/m-workbot-robo.webp', caption: 'Character mode with Robo’s moves' },
    { src: '/img/m-workbot-light.webp', caption: 'Light theme, same Robo' },
  ],
}

export const DINOCLAW: Product = {
  id: 'dinoclaw',
  name: 'DinoClaw',
  version: '0.6.84',
  href: '/dinoclaw/',
  repo: 'https://github.com/AaronGrace978/DinoClaw',
  releases: 'https://github.com/AaronGrace978/DinoClaw/releases/latest',
  icon: '/icons/dinoclaw.svg',
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
  mobile: 'The DinoBuddy app puts your 3D buddy, chat and model picker in your pocket. Its Nest tab pairs your phone with DinoClaw at home, so you can send missions and review actions from anywhere.',
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
  pitch: {
    title: 'The AI agent your whole family can actually use.',
    body: 'DinoClaw is double-click, run, done. It builds the app you described and proves it works, cleans up your files, runs your errands on a schedule and plays co-op with you on the couch. DinoBuddy makes it the AI people want to open every day.',
  },
  useCases: [
    { title: 'Makers & students', body: 'Describe a game, a web app or a script. Dino builds it, runs it, fixes what fails and opens it for you.' },
    { title: 'Small businesses', body: 'Scheduled reports, tidy folders, Telegram and Discord bots, webhooks: an operations assistant that never clocks out.' },
    { title: 'Gamers & Steam Deck owners', body: 'A buddy that plays for you, joins as player 2, or watches and commentates, right inside Game Mode.' },
    { title: 'Everyone who hates terminals', body: 'A real app with 17 themes, voice in and out, and memory that remembers how you like things done.' },
  ],
  reasons: [
    { title: 'Finished, not “probably done”', body: 'P.R.I.M.E. makes every build pass a real run before Dino can call it complete. Most agents just take the model’s word for it.' },
    { title: 'A product, not a project', body: 'Installers for Windows, macOS, Linux and Steam Deck. No npm, no Docker, no config files required.' },
    { title: 'A character people love', body: 'DinoBuddy turns an agent into a companion. Harvard got to meet him in person.' },
  ],
  steps: ['Download DinoClaw for your device', 'Pick Ollama for free local AI, or paste a cloud key', 'Give Dino a mission and watch him work'],
  mobileShots: [
    { src: '/img/m-dinobuddy.webp', caption: 'DinoBuddy in your pocket: tap to boop', h: 1199 },
    { src: '/img/m-dino-nest.webp', caption: 'The Nest: send missions to DinoClaw at home', h: 1109 },
  ],
}

export const PRODUCTS = [WORKBOT, DINOCLAW]

export const RECOGNITION = [
  { label: 'Harvard University', detail: 'DinoBuddy live demo', href: '/dinoclaw/#harvard' },
  {
    label: 'Hack-Nation 2026',
    detail: 'Mozilla Challenge · Top 7 Finalist',
    href: 'https://github.com/AaronGrace978/Hack-Nation-2026-Mozilla-Challenge-TOP-7-Finalist',
  },
  {
    label: 'Mistral Worldwide Hackathon',
    detail: 'SecurityPrime, 2026',
    href: 'https://github.com/AaronGrace978/2026-Mistral-Worldwide-Hackathon---SecurityPrime-Mistral-Edition',
  },
  { label: 'Gemini Live Agent Challenge', detail: 'Prism', href: 'https://github.com/AaronGrace978/Prism---Gemini-Live-Agent-Challenge' },
  { label: 'Cursor Boston', detail: 'Community builder', href: 'https://CursorBoston.com' },
]

const gh = (repo: string) => `https://github.com/AaronGrace978/${repo}`

export const FEATURED_RESEARCH = {
  name: 'ChronoSoul',
  repo: 'continuous-emotional-substrate',
  href: gh('continuous-emotional-substrate'),
  colab:
    'https://colab.research.google.com/github/AaronGrace978/continuous-emotional-substrate/blob/main/Persistent_Emotional_Memory_Substrate.ipynb',
  image: '/img/chronosoul.webp',
  title: 'A mind that keeps running between messages.',
  body: 'ChronoSoul is a continuous emotional and memory substrate for LLMs. Instead of cold-starting on every turn, it keeps a live PAD mood, decaying synaptic memories and a daydream loop running in the background, then steers the model’s residual stream with that mood when it speaks.',
  points: [
    'Mood steering via contrastive activation directions',
    'Memory recall weighted by meaning, recency and mood',
    'Senses elapsed time and catches up after dormancy',
    '20 voice providers, or fully local 1.5B–14B models',
  ],
}

export const RESEARCH = [
  { name: 'Continuous-motion-substrate', href: gh('Continuous-motion-substrate'), lang: 'Python', blurb: 'Persistent, always-in-motion state for agents that never freeze between frames.' },
  { name: 'Swarm-Soul', href: gh('Swarm-Soul'), lang: 'JavaScript', blurb: 'One identity, many bodies: the same soul-state running across models and machines.' },
  { name: 'tokenburn-governor', href: gh('tokenburn-governor'), lang: 'Python', blurb: 'Entropy-gated thinking budgets that stop frontier models burning tokens on redundant thought.' },
  { name: 'The-Ai', href: gh('The-Ai'), lang: 'Notebook', blurb: 'Fine-tunes a small execution model. It is the local “muscle” behind WorkBot’s routine clicks.' },
  { name: 'LLM-Canary', href: gh('LLM-Canary'), lang: 'Rust', blurb: 'Plants canary secrets in your repos and tells you if an AI service ever regurgitates them.' },
  { name: 'composable-lora', href: gh('composable-lora'), lang: 'Python', blurb: 'Measures and removes interference when stacking LoRA adapters on SDXL and Flux.' },
]

export const GITHUB_STATS = [
  { v: '130+', k: 'repositories built' },
  { v: '2', k: 'shipping products' },
  { v: '4', k: 'hackathons & challenges' },
  { v: '1', k: 'Harvard demo' },
]
