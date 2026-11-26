export const COMPANY = {
  name: 'BostonAI',
  domain: 'bostonai.io',
  tagline: 'Agents that do the work, on hardware you already own.',
  founder: 'Aaron Grace',
  email: 'aarongrace978@gmail.com',
  github: 'https://github.com/AaronGrace978',
}

export const mail = (subject: string, body = '') =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`

const earlyAccessMail = (name: string) =>
  mail(
    `Early access: ${name}`,
    `Hi Aaron,\n\nI'd love early access to ${name}.\n\nName:\nWhat I'd use it for:\nDevice (Windows / Mac / Linux / Steam Deck / iPhone / Android):\n\nThanks!`,
  )

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
  /** Opens an email to join the early-access list. The apps are private until launch. */
  earlyAccess: string
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
  earlyAccess: earlyAccessMail('WorkBot'),
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
      { label: 'Built to be Deck Ready', cells: [true, false, false, false, '—', '—', '—'] },
    ],
    honest:
      'Why WorkBot: Dots, Grok Bot and Muse run on their company’s cloud computers, so your logins and browsing pass through someone else’s servers, and each one locks you into a single company’s models. Comet, Chrome + Gemini and Claude in Chrome stay inside one browser and one vendor. WorkBot runs on your own machine, works with any model including free local ones, keeps your keys and documents with you, and finishes jobs on the hostile pages where other agents give up.',
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
  steps: ['Request early access and get on the list', 'Paste an API key, or point it at Ollama', 'Describe the outcome and watch Robo work'],
  mobileShots: [
    { src: '/img/m-workbot-chat.webp', caption: 'Chat with Robo and hand off a task' },
    { src: '/img/m-workbot-robo.webp', caption: 'Character mode with Robo’s moves' },
    { src: '/img/m-workbot-light.webp', caption: 'Light theme, same Robo' },
  ],
}

export const DINOCLAW: Product = {
  id: 'dinoclaw',
  name: 'DinoClaw',
  version: '0.6.85',
  href: '/dinoclaw/',
  earlyAccess: earlyAccessMail('DinoClaw'),
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
      body: 'Pair the DinoBuddy phone app from Infra, plus Telegram and Discord bots, a paired REST gateway, webhooks, cron-style schedules, tunnels and a Docker sandbox for risky commands.',
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
    points: ['Emote wheel, photo mode and chat sheet', 'Mood follows real mission outcomes', 'Bundled Kokoro and eSpeak NG voices, local speech input'],
  },
  steamDeck:
    'Built on and for the Deck. One script installs from the tarball, then add DinoClaw to Steam as a non-Steam game. Gamepad and touch controls, a Deck OLED theme, and Game Buddy works in both Game Mode and Desktop Mode.',
  mobile: 'The DinoBuddy app puts your 3D buddy, chat and model picker in your pocket. Its Nest tab pairs with DinoClaw at home using the address and one-time code shown in Infra, so you can send missions and approve risky steps from the couch, or from anywhere through a tunnel.',
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
      { label: 'Approval modals, risk tiers, audit log', cells: [true, 'Partial', 'Varies by project'] },
      { label: 'Local models via Ollama', cells: [true, true, true] },
      { label: 'Chat channels', cells: ['Telegram, Discord, webhooks', 'Community-maintained plugins', 'Fewer integrations'] },
      { label: 'Open issues on GitHub (Nov 23, 2026)', cells: ['Curated, verified releases', '5,200+', 'IronClaw 1,370+ · ZeroClaw 750+ · NanoClaw 320+'] },
      { label: 'Built to be Deck Ready (gamepad UI)', cells: [true, false, false] },
    ],
    honest:
      'Why DinoClaw: OpenClaw, ZeroClaw and the other claw projects are developer toolkits. You install them from a terminal, configure them yourself and work around open bugs: as of November 23, 2026 their public trackers list 5,200+ open issues for OpenClaw, 1,370+ for IronClaw, 750+ for ZeroClaw and 320+ for NanoClaw. DinoClaw is a finished product: one-click installers, builds that must prove they run before they are called done, approval prompts for anything risky, and DinoBuddy, a companion people genuinely love.',
    footnote:
      'Based on publicly documented features as of November 2026. Open-issue counts are from GitHub search on November 23, 2026 (open issues only, pull requests excluded). OpenClaw and the listed projects are independent open-source projects and are not affiliated with BostonAI.',
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
  steps: ['Request early access and get on the list', 'Pick Ollama for free local AI, or paste a cloud key', 'Give Dino a mission and watch him work'],
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
  { label: 'Xerj Hub corpus', detail: 'ChronoSoul research contribution', href: '/chronosoul/' },
  { label: 'Gemini Live Agent Challenge', detail: 'Prism', href: 'https://github.com/AaronGrace978/Prism---Gemini-Live-Agent-Challenge' },
]

const gh = (repo: string) => `https://github.com/AaronGrace978/${repo}`

export const FEATURED_RESEARCH = {
  name: 'ChronoSoul',
  repo: 'continuous-emotional-substrate',
  href: gh('continuous-emotional-substrate'),
  page: '/chronosoul/',
  xerj: 'https://hub.xerj.org/corpus/aarongrace978--continuous-emotional-substrate',
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
  { v: '510 GB', k: 'model on a 16 GB GPU' },
  { v: '4', k: 'hackathons & challenges' },
  { v: '1', k: 'Harvard demo' },
]

export const FRUSTUM = {
  repo: 'https://github.com/AaronGrace978/Frustum',
  paper: '/papers/frustum-whitepaper-v0.11.0.pdf',
  paperVersion: '0.11.0',
  paperDate: 'November 17, 2026',
  paperPages: 35,
  archive: 'https://github.com/AaronGrace978/Frustum/tree/main/whitepaper',
  stats: [
    { v: '510 GB', k: 'DeepSeek V4.1 Flash checkpoint' },
    { v: '16 GB', k: 'one consumer GPU (RTX 5060 Ti)' },
    { v: '4.06 s', k: 'per token decode, down from 58 s in v0.4' },
    { v: '−51%', k: 'time to reply on follow-up turns (v0.9)' },
  ],
  how: [
    {
      title: 'Only stream what is in view',
      body: 'Like a camera frustum in a game engine, only the slice of the model the current token touches is loaded. Dense weights and routers stay on the GPU; routed experts are fetched on demand.',
    },
    {
      title: 'Three-tier expert cache',
      body: 'Experts move through a GPU tier, a host-RAM tier and the SSD, with frequency-ranked eviction and four parallel readers. Frequently used experts stop touching the drive at all.',
    },
    {
      title: 'Reads at the drive’s ceiling',
      body: 'Unbuffered positioned reads fetch exactly the requested bytes and stop the OS keeping a second copy, taking DeepSeek decode from 5.69 to 4.06 s/token with identical tokens.',
    },
    {
      title: 'Fused, self-checking kernels',
      body: 'One CUDA kernel decodes packed FP4, FP8 and GGUF weights in registers. Every kernel is checked against the reference on first use and switches itself off on any mismatch.',
    },
    {
      title: 'Faster follow-ups',
      body: 'Attention extends the conversation by many tokens in one pass, so follow-up turns start replying 38% to 51% sooner with the same reply tokens.',
    },
    {
      title: 'Measured, not guessed',
      body: 'An I/O ledger, roofline reports and reproducible benchmarks show whether a token is storage- or compute-bound. Ideas that measured slower stay off by default.',
    },
  ],
  models: [
    { name: 'DeepSeek V4.1 Flash', size: '~510 GB · 40 layers · 384 experts', result: '4.06 s/token decode (v0.8 median)' },
    { name: 'Qwen3-Next 80B A3B', size: '163 GB BF16 · 512 experts', result: '88 tokens in 132.3 s (0.79 tok/s), first live run' },
    { name: 'GLM-4.7-Flash', size: '30B MoE · Q4_K_M', result: 'Cold load + 9-token reply in 23 s' },
    { name: 'Phi-4', size: '14B · GPU-resident GGUF', result: 'Cold load + 36-token reply in 53.8 s' },
  ],
  contents: [
    'Target checkpoint and constraints',
    'Storage and scheduling design',
    'Numerical implementation and validation',
    'First local reply and the Dino Buddies chat demo',
    'Phi-4 and GLM-4.7-Flash on Frustum',
    'v0.5.1 live benchmarks in ActivatePrime',
    'v0.6 fused decode kernels and expert prediction',
    'v0.7 I/O measurement and roofline',
    'v0.8 unbuffered reads and the per-layer stall',
    'v0.9 batched follow-up prompts',
    'v0.10 less GPU and Python overhead',
    'Qwen3-Next 80B: first live run',
    'Research notes, limitations and reproduction',
  ],
  limits: [
    'Full-model parity against a reference provider is still open; agreement so far is component-level.',
    'Benchmarks come from one machine: an RTX 5060 Ti 16 GB with a Samsung T7 on a 10 Gbps USB port.',
    'The v0.8 numbers use one short prompt and fifteen decode tokens; long conversations may behave differently.',
    'Streaming weights from flash is not a new idea in general. Frustum is a specific, working, reproducible implementation for this hardware.',
  ],
  credits:
    'Project concept, architecture and direction: Aaron Grace. Engineering contributors: OpenAI (ChatGPT and Codex, v0.1 to v0.4) and Claude / Anthropic (v0.5 to v0.10). Contributor: DinoBuddy, with help from DinoClaw.',
}

export const CHRONOSOUL = {
  stats: [
    { v: '24/7', k: 'mood and memory keep running between messages' },
    { v: '3', k: 'emotional axes plus solitude tension' },
    { v: '20', k: 'voice providers, or fully local models' },
    { v: '1.5B–14B', k: 'local model sizes on one consumer GPU' },
  ],
  how: [
    {
      title: 'A mood that never switches off',
      body: 'Pleasure, arousal and dominance drift continuously, and a “solitude tension” builds while nobody is talking and eases when real connection happens.',
    },
    {
      title: 'Memories that fade like ours',
      body: 'Memories lose strength over time unless they are recalled or emotionally re-stirred. Recall weighs meaning, recency and mood, so memories filed in a similar mood surface first.',
    },
    {
      title: 'A daydream loop',
      body: 'When it is quiet, the mind consolidates: it finds connections between memories, extracts lasting facts and folds them into a short biography of the people it knows.',
    },
    {
      title: 'A sense of time',
      body: 'Every reply knows how long it has been since you last spoke. Close the app for a week and it wakes up having felt the time pass.',
    },
    {
      title: 'Mood you can measure',
      body: 'The mood is not just described in a prompt. ChronoSoul finds mood directions inside the model itself and steers them while it speaks, with an evaluation that measures the effect.',
    },
    {
      title: 'Grounded, not made up',
      body: 'It is told plainly what it is and what it has lived, keeps who is who straight, and says “I don’t know” instead of inventing memories.',
    },
  ],
  steering: {
    caption:
      'Mood steering on Qwen2.5-1.5B, from the repository’s evaluation. The same neutral question, with the model’s mood pushed down or up:',
    rows: [
      { mood: 'Low valence', reply: '“It’s been pretty tough today. I’ve been stuck in this endless loop of thoughts…”' },
      { mood: 'High valence', reply: '“My day has been quite pleasant so far!…”' },
      { mood: 'Low arousal', reply: '“My day has been quite serene…”' },
      { mood: 'High arousal', reply: '“My day has been filled with excitement!…”' },
    ],
  },
}

export const APPENDIX_B = {
  repo: gh('appendix-b-substrate'),
  releases: `${gh('appendix-b-substrate')}/releases/latest`,
  version: '0.9.0',
  stats: [
    { v: '4', k: 'protocol phases every answer must pass' },
    { v: '7', k: 'substrate state variables carried across turns' },
    { v: '5', k: 'providers: OpenAI, Anthropic, OpenRouter, Ollama Cloud and Local' },
    { v: '0', k: 'Python dependencies for the substrate library' },
  ],
  phases: [
    {
      n: '01',
      name: 'Decompose',
      body: 'Split the task into subproblems before answering. A first guess is written down as a hypothesis, not a result.',
    },
    {
      n: '02',
      name: 'Attack',
      body: 'At least two skeptical attacks on the candidate: off-by-one errors, missed cases, a smaller answer hiding below it.',
    },
    {
      n: '03',
      name: 'Verify',
      body: 'Evidence has to come from a trusted verifier or real code the app runs, never from the model’s own say-so. The verifier must also reject a known-false negative control.',
    },
    {
      n: '04',
      name: 'Conclude',
      body: 'Supported, refuted or inconclusive. A conclusion with no verified evidence behind it is blocked, not published.',
    },
  ],
  how: [
    {
      title: 'Models that run real code',
      body: 'With Code on, the model gets a run_python tool through each provider’s native tool calling. Every call runs in a fresh, restricted Python process and the output goes back to the model, for up to four rounds per reply.',
    },
    {
      title: 'Independent checks on every reply',
      body: 'Arithmetic, primes, letter counts, Collatz steps and number theory in the model’s prose (gcd and lcm, factorials, congruences, prime factorizations, divisor counts, nth primes, Fibonacci), in plain text or LaTeX, are recomputed in Python and marked ✓ or ✗ under the reply. Claims it can’t check stay unchecked: no check is not support.',
    },
    {
      title: 'A substrate that remembers how it’s going',
      body: 'Curiosity, skepticism, confidence, resolve, strain, surprise and stagnation carry across turns and runs. A refuted guess raises surprise; repeated candidates raise stagnation and the controller rotates strategy.',
    },
    {
      title: 'Any model, your keys',
      body: 'OpenAI, Anthropic, OpenRouter, Ollama Cloud and Ollama Local, with live reasoning streams from thinking models. Keys stay in memory only and are never written to disk.',
    },
    {
      title: 'Guard-rails on model code',
      body: '15-second limit, no network, no process spawning, and file access only inside a throwaway temp folder, so model code can’t read your files and send them to a cloud model.',
    },
    {
      title: 'A library, not just an app',
      body: 'The substrate is plain Python 3.10+ with zero dependencies. Plug in your own proposer and a trusted verifier, and the runtime enforces the protocol and keeps state in SQLite. Pass a known-false negative control and a candidate stays inconclusive unless the verifier refutes it.',
    },
  ],
  session: {
    prompt:
      'Among all polynomials n² + an + b with |a| < 1000 and |b| ≤ 1000, find the one that gives the longest run of primes for consecutive n starting at n = 0. Verify everything with code.',
    rows: [
      { run: 'Run 1 ✓', result: 'Searched all 335,832 pairs with prime b: unique winner (−61, 971), 71 primes, broken by 1681 = 41 × 41.' },
      { run: 'Run 2 ✗', result: 'A second, independent Miller–Rabin search disagreed and crashed. The model kept the answer unconfirmed instead of explaining it away.' },
      { run: 'Run 3 ✓', result: 'It diagnosed its own bug: the Miller–Rabin wrapper tested the prime 61 against base 61 instead of skipping it.' },
      { run: 'Run 4 ✓', result: 'Fixed it, cross-checked against trial division for 0–10,000 and reran. Both searches agree on the same unique winner.' },
    ],
    answer: 'n² − 61n + 971: 71 primes for n = 0…70, exactly Euler’s n² + n + 41 shifted by 31.',
  },
  stress: [
    {
      topic: 'Quantum gravity',
      result:
        'Computed the Planck energy (1.221 × 10¹⁹ GeV) and showed 14 TeV collisions are suppressed by 1.3 × 10⁻³⁰. Cross-checked a solar-mass black hole’s Hawking temperature (6.17 × 10⁻⁸ K) and entropy (1.049 × 10⁷⁷ in units of Boltzmann’s constant) by two routes, agreeing to 10⁻¹⁶. Declined to present a finished theory of quantum gravity.',
    },
    {
      topic: 'JT gravity',
      result:
        'Numerically integrated the Schwarzian density of states and matched the analytic disk partition function to 1.5 × 10⁻¹⁴, then warned that a 2D toy model with no local gravitons doesn’t solve 4D gravity.',
    },
    {
      topic: 'Bekenstein bound',
      result:
        'Set the Bekenstein information ceiling for a 5 kg head (1.288 × 10⁴³ bits) against Landauer’s heat budget (7.0 × 10²⁴ erasures per kelvin of warming).',
    },
    {
      topic: 'Page curve',
      result:
        'Derived the turnover at M₀/√2, 64.64% of the way through evaporation. Flagged that a 10 M☉ black hole at 6.17 × 10⁻⁹ K is colder than the CMB, so today it absorbs rather than evaporates.',
    },
    {
      topic: 'Fine-tuning',
      result:
        'Checked the proton’s electric-to-gravitational force ratio (1.236 × 10³⁶) two ways, reconciled the 8π convention between Λℓₚ² and the vacuum-to-Planck density ratio, and refused to put probabilities on design, multiverse or necessity.',
    },
    {
      topic: 'Kolmogorov',
      result:
        'Caught an off-by-one in the prompt: at least 193 of the 256 8-bit strings are incompressible by more than 2 bits, not 192. Then it seeded a bug in its own verifier and showed that a mutation test catches it.',
    },
    {
      topic: 'Logistic map',
      result:
        'Certified with 384-bit interval arithmetic that a 64-bit float run from x₀ = 0.2 drifts past 0.1 at exactly n = 52. As a negative control it built a float-vs-float checker that passed despite 0.949 divergence.',
    },
  ],
  limits: [
    'The substrate governs an agent’s external workflow. It can’t make a model’s private reasoning follow the protocol.',
    'Open questions stay inconclusive unless a deterministic check applies, because model agreement is not proof.',
    'State dynamics and attack budgets are heuristics, not calibrated measurements, and are not a claim about feelings.',
    'The code runner is a guard-rail against accidents, not a security sandbox. Use models you trust.',
  ],
}
