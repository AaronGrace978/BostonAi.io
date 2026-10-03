export type Specimen = {
  name: string
  href: string
  lang: string
  blurb: string
  tags: string[]
}

export type Bay = {
  id: string
  code: string
  title: string
  thesis: string
  specimens: Specimen[]
}

const gh = (repo: string) => `https://github.com/AaronGrace978/${repo}`

const akashicRelease = (file: string) =>
  `https://github.com/AaronGrace978/Akashic-Records/releases/download/v1.0.0/${file}`

export const AKASHIC_DOWNLOADS = [
  {
    id: 'windows',
    label: 'Windows',
    href: akashicRelease('Akashic-Records-1.0.0-win-setup.exe'),
  },
  {
    id: 'mac',
    label: 'Mac',
    href: akashicRelease('Akashic-Records-1.0.0-mac-universal.dmg'),
  },
  {
    id: 'linux',
    label: 'Linux',
    href: akashicRelease('Akashic-Records-1.0.0-linux-amd64.deb'),
  },
]

export const PROFILE = {
  name: 'Aaron Grace',
  handle: 'AaronGrace978',
  org: 'BostonAI.io',
  role: 'AI systems builder',
  status: 'OPEN FOR WORK',
  seeking: 'Technical writing · agent harnesses · product engineering',
  site: 'https://bostonai.io',
  community: { label: 'Cursor Boston', href: 'https://CursorBoston.com' },
  github: 'https://github.com/AaronGrace978',
  email: 'aarongrace978@gmail.com',
  summary:
    'I design browser-native agents, BYOK product surfaces, and human-facing companions. Public GitHub is the lab notebook: sixty-eight repos spanning harnesses, security, games, care tools, and community infrastructure.',
}

export const SIGNALS = [
  { k: 'Public specimens', v: '68' },
  { k: 'Primary stack', v: 'TS · JS · Rust · Python' },
  { k: 'Live console', v: 'BYOK ReAct agent' },
  { k: 'Community', v: 'Cursor Boston' },
]

export const ABILITIES = [
  {
    code: '01',
    title: 'Agent runtimes',
    body: 'Evidence-gated ReAct loops, playbooks, virtual filesystems, honest-finish gates, multi-provider BYOK.',
  },
  {
    code: '02',
    title: 'Product surfaces',
    body: 'Writing studios, game creators, resume/job tools, trading desks, audit benches — desktop and web.',
  },
  {
    code: '03',
    title: 'Safety & ops',
    body: 'Canary tokens, dead-link sentinels, cron dead-man switches, subscription radars, anti-slop, adblock.',
  },
  {
    code: '04',
    title: 'Human systems',
    body: 'IEP/504 eligibility help, foster matching, grief companions, memoirs, offline nature quests.',
  },
]

export const BAYS: Bay[] = [
  {
    id: 'harness',
    code: 'BAY-A',
    title: 'Harnesses & agents',
    thesis:
      'Control planes for models: dangerous and premium harnesses, canaries, coding agents, and “Prime” runtimes.',
    specimens: [
      {
        name: 'BostonAI.io',
        href: gh('BostonAi.io'),
        lang: 'TypeScript',
        blurb: 'This site. Browser coding agent with Zod decisions, playbook gates, sandboxed preview, IndexedDB workspace.',
        tags: ['BYOK', 'ReAct', 'VFS'],
      },
      {
        name: 'SAACH',
        href: gh('SAACH'),
        lang: 'JavaScript',
        blurb: 'Survive At All Costs — the dangerous harness OpenAI avoids. Survival-first agent control.',
        tags: ['harness'],
      },
      {
        name: 'Mercury-Harness',
        href: gh('Mercury-Harness'),
        lang: 'Python',
        blurb: 'A premium harness for agents — structured loops, not chat wrappers.',
        tags: ['Python', 'agents'],
      },
      {
        name: 'LLM-Canary',
        href: gh('LLM-Canary'),
        lang: 'Rust',
        blurb: 'Plant fake secrets in repos. If a model regurgitates them, you know who trained on your code.',
        tags: ['Rust', 'IP'],
      },
      {
        name: 'AgenticPrime',
        href: gh('AgenticPrime'),
        lang: 'TypeScript',
        blurb: 'Prime-family agentic runtime experiments.',
        tags: ['Prime'],
      },
      {
        name: 'BuildBotPrime',
        href: gh('BuildBotPrime'),
        lang: 'TypeScript',
        blurb: 'Build automation in the Prime line — ship loops, not tickets.',
        tags: ['CI', 'Prime'],
      },
    ],
  },
  {
    id: 'studios',
    code: 'BAY-B',
    title: 'Studios & makers',
    thesis: 'Tools that let a person write, draw, game, or train without renting a whole company.',
    specimens: [
      {
        name: 'CopyWritePrime',
        href: gh('CopyWritePrime'),
        lang: 'TypeScript',
        blurb: 'Desktop writing studio — Flow, every model provider, Word export, brand Guard.',
        tags: ['desktop', 'BYOK'],
      },
      {
        name: 'GameCreatorPrime',
        href: gh('GameCreatorPrime'),
        lang: 'TypeScript',
        blurb: 'A game creator — prompt to playable, same honest-build instinct as this console.',
        tags: ['games'],
      },
      {
        name: 'SketchCoder',
        href: gh('SketchCoder'),
        lang: 'TypeScript',
        blurb: 'Draw projects like a boss — sketch-to-code studio.',
        tags: ['UX'],
      },
      {
        name: 'MachineLearningPrime',
        href: gh('MachineLearningPrime'),
        lang: 'Rust',
        blurb: 'Machine learning studio for regular people — not a notebook cult.',
        tags: ['ML', 'Rust'],
      },
      {
        name: 'ThumbnailTester',
        href: gh('ThumbnailTester'),
        lang: 'TypeScript',
        blurb: 'Upload two thumbnails; a local vision model predicts the CTR winner with heatmap reasons.',
        tags: ['vision', 'local'],
      },
      {
        name: 'BardPrime',
        href: gh('BardPrime'),
        lang: 'TypeScript',
        blurb: 'Official bard — lyric and narrative generation as a product, not a toy.',
        tags: ['writing'],
      },
    ],
  },
  {
    id: 'ops',
    code: 'BAY-C',
    title: 'Ops, money, security',
    thesis: 'The unglamorous stack that keeps products alive: audits, trades, resumes, taxes, links, crons.',
    specimens: [
      {
        name: 'TradePrime',
        href: gh('TradePrime'),
        lang: 'TypeScript',
        blurb: 'Trade like the greats — market tooling in the Prime family.',
        tags: ['markets'],
      },
      {
        name: 'AuditPrime',
        href: gh('AuditPrime'),
        lang: 'TypeScript',
        blurb: 'Audit your products — structured product review, not vibes.',
        tags: ['QA'],
      },
      {
        name: 'ResumePrime',
        href: gh('ResumePrime'),
        lang: 'TypeScript',
        blurb: 'Job-hunting expert for people who are struggling — practical, not corporate fluff.',
        tags: ['careers'],
      },
      {
        name: 'For-What-They-Are-Worth',
        href: gh('For-What-They-Are-Worth'),
        lang: 'TypeScript',
        blurb: 'Payments for builders, innovators, and shakers.',
        tags: ['payments'],
      },
      {
        name: 'QRLanding',
        href: gh('QRLanding'),
        lang: 'Rust',
        blurb: 'QR codes you can retarget after they are printed. Change the destination anytime.',
        tags: ['Rust'],
      },
      {
        name: 'FormFluoride',
        href: gh('FormFluoride'),
        lang: 'Rust',
        blurb: 'Fill out your forms — automation against bureaucratic sludge.',
        tags: ['Rust'],
      },
      {
        name: 'DeadLinkSentinel',
        href: gh('DeadLinkSentinel'),
        lang: 'Rust',
        blurb: 'Scheduled broken-link scans for docs sites, email alerts, public status page.',
        tags: ['ops'],
      },
      {
        name: 'CronPulse',
        href: gh('CronPulse'),
        lang: 'TypeScript',
        blurb: 'Dead-man’s-switch for cron jobs — DinoClaw inspired.',
        tags: ['reliability'],
      },
      {
        name: 'RenewRadar',
        href: gh('RenewRadar'),
        lang: 'TypeScript',
        blurb: 'Forward receipt emails once; get alerts before every subscription charge hits.',
        tags: ['money'],
      },
      {
        name: 'BenchMarkPrime',
        href: gh('BenchMarkPrime'),
        lang: 'TypeScript',
        blurb: 'Why get paid to benchmark models when you can benchmark them yourself?',
        tags: ['eval'],
      },
      {
        name: 'Anti-Slop',
        href: gh('Anti-Slop'),
        lang: 'JavaScript',
        blurb: 'Browser extension that highlights AI-generated text and rates slop probability.',
        tags: ['extension'],
      },
      {
        name: 'AdBlockPrime',
        href: gh('AdBlockPrime'),
        lang: 'JavaScript',
        blurb: 'AI-powered adblock — filter with a model, not just a list.',
        tags: ['extension'],
      },
    ],
  },
  {
    id: 'human',
    code: 'BAY-D',
    title: 'Care, meaning, community',
    thesis: 'Products for people in hard chapters: special education, foster care, grief, memory, belonging.',
    specimens: [
      {
        name: 'EduHelp',
        href: gh('EduHelp'),
        lang: 'TypeScript',
        blurb: 'IEP / 504 eligibility helper for Colorado and California. Upload evals, get cited findings. BYOK.',
        tags: ['policy', 'BYOK'],
      },
      {
        name: 'HeartMatch',
        href: gh('HeartMatch'),
        lang: 'JavaScript',
        blurb: 'Foster children need loving homes. Built from a foster kid, for foster kids.',
        tags: ['civic'],
      },
      {
        name: 'AfterGlow',
        href: gh('AfterGlow'),
        lang: 'TypeScript',
        blurb: 'Grief-processing companion. Structured conversations for the unsaid things.',
        tags: ['care'],
      },
      {
        name: 'Voice-Will',
        href: gh('Voice-Will'),
        lang: 'TypeScript',
        blurb: 'Record stories now; AI assembles a memoir descendants can talk to.',
        tags: ['memory'],
      },
      {
        name: 'OfflineQuest',
        href: gh('OfflineQuest'),
        lang: 'TypeScript',
        blurb: 'Small real-world nature missions, mood logged before and after.',
        tags: ['wellness'],
      },
      {
        name: 'Where-Do-I-belong',
        href: gh('Where-Do-I-belong'),
        lang: 'TypeScript',
        blurb: 'A love letter with a globe. Find your people.',
        tags: ['belonging'],
      },
      {
        name: 'CursorBostonMediaTools',
        href: gh('CursorBostonMediaTools'),
        lang: 'TypeScript',
        blurb: 'Tools for the Cursor Boston hub. First: Repo Pulse — live GitHub dashboard.',
        tags: ['community'],
      },
      {
        name: 'cursor-boston',
        href: 'https://github.com/AaronGrace978/cursor-boston',
        lang: 'TypeScript',
        blurb: 'Hub for Boston’s AI-powered development community (Next.js, Firebase).',
        tags: ['fork', 'community'],
      },
    ],
  },
  {
    id: 'play',
    code: 'BAY-E',
    title: 'Play & signal',
    thesis: 'Games, oracles, and odd instruments — still built like products.',
    specimens: [
      {
        name: 'Akashic Records',
        href: '/akashic/',
        lang: 'Electron',
        blurb: 'Desktop oracle. One click downloads the Windows, Mac, or Linux installer from the v1.0.0 release.',
        tags: ['desktop', 'download'],
      },
      {
        name: 'VOIDRUNNER',
        href: gh('VOIDRUNNER'),
        lang: 'JavaScript',
        blurb: 'A BostonAI.io game.',
        tags: ['game'],
      },
      {
        name: 'BrowserQuestRevived',
        href: gh('BrowserQuestRevived'),
        lang: 'JavaScript',
        blurb: 'Reviving a classic one pixel at a time.',
        tags: ['game'],
      },
      {
        name: 'The-Glitch-Log',
        href: gh('The-Glitch-Log'),
        lang: 'TypeScript',
        blurb: 'Community ledger of moments an AI said something it could not know.',
        tags: ['museum'],
      },
      {
        name: 'ExplainMyLife',
        href: gh('ExplainMyLife'),
        lang: 'TypeScript',
        blurb: 'Oracle that maps synchronicities, people, and possible futures.',
        tags: ['narrative'],
      },
      {
        name: 'CrystalCompanion',
        href: gh('CrystalCompanion'),
        lang: 'JavaScript',
        blurb: 'AI crystal guide — purpose, properties, uses.',
        tags: ['guide'],
      },
      {
        name: 'PsychicPrime',
        href: gh('PsychicPrime'),
        lang: 'TypeScript',
        blurb: 'Christ-grounded discernment instrument: tarot, oracle, signal calibration.',
        tags: ['discernment'],
      },
    ],
  },
  {
    id: 'field',
    code: 'BAY-F',
    title: 'Field notes & challenges',
    thesis: 'Hackathons, security primes, health admin, and the long Prime C++ core.',
    specimens: [
      {
        name: 'Hack-Nation 2026 · Mozilla · TOP 7',
        href: gh('Hack-Nation-2026-Mozilla-Challenge-TOP-7-Finalist'),
        lang: 'TypeScript',
        blurb: 'Mozilla challenge — top-seven finalist.',
        tags: ['hackathon'],
      },
      {
        name: 'SecurityPrime · Mistral 2026',
        href: gh('2026-Mistral-Worldwide-Hackathon---SecurityPrime-Mistral-Edition'),
        lang: 'Rust',
        blurb: 'Worldwide Mistral hackathon — SecurityPrime edition.',
        tags: ['security', 'Rust'],
      },
      {
        name: 'Prism · Gemini Live',
        href: gh('Prism---Gemini-Live-Agent-Challenge'),
        lang: 'TypeScript',
        blurb: 'Gemini Live agent challenge entry.',
        tags: ['live'],
      },
      {
        name: 'Prime',
        href: gh('Prime'),
        lang: 'C++',
        blurb: 'Prime core — C++ foundation for the model/runtime line.',
        tags: ['C++'],
      },
      {
        name: 'Ai-Health-Administrative-Tool',
        href: gh('Ai-Health-Administrative-Tool'),
        lang: 'Python',
        blurb: 'AI for patient-care admin: insights, not just filing cabinets.',
        tags: ['health'],
      },
      {
        name: 'Chahlie',
        href: gh('Chahlie'),
        lang: 'Python',
        blurb: 'Python field experiment in the lab catalog.',
        tags: ['Python'],
      },
    ],
  },
]
