export type Post = {
  slug: string
  title: string
  date?: string // ISO date; undated posts sort first
  tag: string
  image: string
  excerpt: string
  body: (string | { h: string } | { quote: string } | { list: string[] })[]
}

export const AUTHOR = {
  name: 'Aaron Grace',
  role: 'Founder, BostonAI',
}

export const POSTS: Post[] = [
  {
    slug: 'frustum-510gb-on-16gb',
    title: 'Running a 510 GB model on a 16 GB GPU',
    date: '2026-11-17',
    tag: 'Research',
    image: '/img/frustum-activateprime.webp',
    excerpt:
      'Frustum streams DeepSeek V4.1 Flash from a USB SSD through one RTX 5060 Ti. The first six tokens took 1,118 seconds. Version 0.8 decodes a token in about four.',
    body: [
      'DeepSeek V4.1 Flash is roughly 510 GB on disk. My graphics card has 16. The usual answer is “rent a data center.” Frustum is my answer instead: stream the model from a Samsung T7 USB SSD and only bring onto the GPU what the current token actually needs.',
      { h: 'Why it can work at all' },
      'It is a mixture-of-experts model: 384 routed experts per layer, and each token only uses six of them. So a token never needs the whole model, just the slice that is “in view,” the way a game engine only renders what is inside the camera frustum. That is where the name comes from.',
      { h: 'The road from 1,118 seconds' },
      {
        list: [
          'v0.3.8 produced its first six tokens in 1,118 seconds.',
          'v0.5 kept dense weights resident on the GPU and added a GPU and host-RAM expert cache with parallel readers. On a USB 3.x link: about 8 seconds a token.',
          'v0.6 added fused CUDA kernels that decode packed FP4, FP8 and GGUF weights in registers, each one checked against the reference before it is trusted.',
          'v0.8 switched to unbuffered reads: 5.69 to 4.06 seconds per token, with identical tokens.',
          'v0.9 made follow-up turns start replying 38% to 51% sooner.',
        ],
      },
      { h: 'More than one model' },
      'The same engine now runs Qwen3-Next 80B (163 GB) at about 0.6 to 0.8 tokens per second, plus GLM-4.7-Flash and Phi-4, all from a desktop chat app called ActivatePrime.',
      { h: 'What it does not claim' },
      'Streaming weights from flash is not a new idea, and full-model parity against a reference provider is still open. Every number comes from one machine. The white paper says all of that plainly, along with the ideas that measured slower and were switched off. That honesty is the point.',
      'The full 35-page white paper and the code are on the Frustum page.',
    ],
  },
  {
    slug: 'dinobuddy-at-harvard',
    title: 'DinoBuddy went to Harvard',
    tag: 'Event',
    image: '/img/harvard-demo-wide.webp',
    excerpt:
      'I put DinoClaw and DinoBuddy on the big screen in a Harvard lecture hall and let them run live: Talk Mode, a freshly built 3D game and a passing smoke check.',
    body: [
      'There is a moment in every demo where you decide whether to trust the thing you built. At Harvard I decided to trust DinoBuddy: the DinoClaw desktop app went up on the lecture-hall projector and he ran live in front of the room.',
      { h: 'What we showed' },
      {
        list: [
          'Talk Mode: tap the mic, speak, and DinoBuddy answers out loud with his own voice.',
          'A game DinoClaw had built itself, Super Dino Buddy Brothers 64, running on a custom canvas-based 3D engine. No Three.js.',
          'The part I care about most: the smoke check that proved it actually ran before Dino was allowed to call it done.',
        ],
      },
      'That last point is the whole philosophy of DinoClaw. Plenty of agents will tell you a build is finished. DinoClaw has to prove it, and when it cannot, it says “Needs work” and keeps your files so you can pick up where it left off.',
      { h: 'Why a dinosaur?' },
      'Because people do not get attached to a progress bar. They get attached to a character who blinks, stomps when he is happy and gets visibly determined when a mission is hard. DinoBuddy is how a desktop agent stops feeling like infrastructure and starts feeling like a friend you want to open every day.',
      'Thank you to everyone who came out. DinoBuddy says hi.',
    ],
  },
  {
    slug: 'workbot-2-5-robo-has-a-body',
    title: 'WorkBot 2.5: Robo has a body',
    date: '2026-11-20',
    tag: 'Release',
    image: '/img/workbot-hero.webp',
    excerpt:
      'Robo now lives in his own panel as a rigged 3D character who types while WorkBot acts, thinks while it plans and celebrates when the job is done.',
    body: [
      'Browser agents have a trust problem: they work in a window you are not watching. With 2.5 I wanted you to be able to glance over and know exactly what WorkBot is doing. So Robo got a body.',
      { h: 'He shows what WorkBot is doing' },
      'Robo types while WorkBot acts, rests his chin on his hand while it thinks, tilts his head while you type or talk, waves when a task completes and shrugs when a site blocks it. His glow follows the live friction level, and a speech bubble carries the current step.',
      { h: 'He is alive, but light' },
      'He breathes, follows your cursor and sometimes strolls around his panel while idle. The 3D engine only loads while Robo is shown, draws at 30 fps when he is calm, pauses when the window is hidden and holds still when your system asks for reduced motion.',
      { h: 'Also in the 2.x line' },
      {
        list: [
          'Second nature: plain commands run instantly with no model in the loop, and clean tasks replay in seconds.',
          'Five-point hit-testing before every click, plus friction detection that escalates to a deeper model the moment a site pushes back.',
          'Gold Standard playbooks that turn every successful run into a reusable, verified workflow.',
          'Opt-in desktop control behind a review gate, with payments, credentials and CAPTCHA bypasses refused in code.',
        ],
      },
      'WorkBot is built for Windows, macOS and Linux, and it runs on Steam Deck. It is coming soon to the public: request early access on the WorkBot page.',
    ],
  },
  {
    slug: 'workbot-mobile-on-android',
    title: 'WorkBot is now on your phone',
    date: '2026-11-20',
    tag: 'Mobile',
    image: '/img/m-workbot-robo.webp',
    excerpt:
      'WorkBot Mobile is not a remote control. The interface and the agent run on the phone itself, with a private in-app browser and Robo in full 3D.',
    body: [
      'The easy way to put an agent on a phone is to make it a remote for a computer somewhere else. I did not want that. WorkBot Mobile runs the React interface and the Rust agent on the phone itself.',
      { h: 'How it works' },
      'An app-owned browser runs in its own private process, with its own storage. Websites get no access to the app’s internals, cannot jump into local files or other apps, and keep TLS validation and Safe Browsing on. Tabs and cookies belong to WorkBot, not to your phone’s main browser.',
      { h: 'What it feels like' },
      'Same Robo, same moves bar, same chat. Dictate a task, hear the reply spoken back, switch between dark and light, and hand off the boring part of your day from the couch.',
      'The current Android build supports ARM64 phones on Android 9 or newer, and updates install over the previous version without losing your settings or chats.',
    ],
  },
  {
    slug: 'dinoclaw-watch-dino-work',
    title: 'Watch Dino work, then pair your phone',
    date: '2026-11-26',
    tag: 'Release',
    image: '/img/dinoclaw-live-view.webp',
    excerpt:
      'DinoClaw v0.6.85 turns the mission view into a live trace you can actually read, and makes pairing the DinoBuddy phone app a one-step job.',
    body: [
      'An agent that works quietly behind a spinner asks you to trust it. An agent that shows its work earns that trust. DinoClaw v0.6.85 is about showing the work.',
      { h: 'A live trace, not a log dump' },
      'The mission view used to print raw tool calls and JSON. Now a generative signal at the top reacts to every step and shifts colour with what Dino is doing: thinking, writing, running, waiting for you or recovering from a failure. His plan sits up front. Every action reads like a sentence, “Wrote index.html in nocturne-landing”, and the file he is writing appears as highlighted code while he writes it.',
      { h: 'Your phone, paired in one step' },
      'Infra now shows exactly what the DinoBuddy app asks for: the Nest address and a one-time code. One button gets the PC ready for phones, and it fixes the things that used to get in the way:',
      {
        list: [
          'A fresh pairing code any time, so a new or reinstalled phone can always pair.',
          'The real Wi‑Fi address instead of a virtual adapter the phone cannot reach.',
          'A one-click Windows firewall fix, limited to devices on your own network.',
          'No app installed? The Nest serves Dino Link to the phone’s browser, and a QR code opens it.',
        ],
      },
      { h: 'And the small things' },
      'Enter now sends in missions and DinoBuddy chat, with Shift+Enter for a new line. On Windows, the build bundles eSpeak NG, the classic Dino voice from Linux and Steam Deck, which also keeps him talking if the Windows voice cannot start.',
      'DinoClaw runs on Windows, macOS (Apple Silicon and Intel), Linux and Steam Deck. It is coming soon to the public: request early access on the DinoClaw page.',
    ],
  },
  {
    slug: 'dinoclaw-needs-work-is-a-feature',
    title: '“Needs work” is a feature',
    date: '2026-11-19',
    tag: 'Release',
    image: '/img/dinoclaw-projects.webp',
    excerpt:
      'DinoClaw v0.6.84 marks builds that run out of verification retries as “Needs work” instead of pretending they are done, and keeps every file so you can continue.',
    body: [
      'The most dangerous word an AI agent can say is “done.” If it is wrong, you find out later, usually at the worst possible moment.',
      'In v0.6.84, when SupremeMode saves changes but runs out of verification retries, DinoClaw reports the project as Needs work. The desktop app and CLI keep the edited files and the project record, so you continue in the same folder instead of starting over.',
      { h: 'Built on proof' },
      'This is the same rule behind P.R.I.M.E., DinoClaw’s build harness: intake, research, plan, guard, execute, verify. Every step names its tool and its expected outcome before it runs. An untested result cannot be reported as complete.',
      'Project Home shows the evidence: build verification, visual checks, blockers and exactly where Dino left off. Honest status is how you build trust with people who are not engineers.',
      'DinoClaw runs on Windows, macOS (Apple Silicon and Intel), Linux and Steam Deck. It is coming soon to the public: request early access on the DinoClaw page.',
    ],
  },
  {
    slug: 'chronosoul-a-mind-between-messages',
    title: 'ChronoSoul: a mind that keeps running between messages',
    date: '2026-10-23',
    tag: 'Research',
    image: '/img/chronosoul.webp',
    excerpt:
      'Language models freeze between turns. ChronoSoul gives them a continuous emotional and memory substrate that keeps moving whether you are talking or not.',
    body: [
      'Every chatbot you have used is a cold start. It exists only when a message arrives, reads a flat history log and disappears the moment it replies. ChronoSoul is my attempt at the opposite.',
      { h: 'What runs in the background' },
      {
        list: [
          'A live mood in pleasure-arousal-dominance space, plus a “solitude tension” that builds when nobody talks to it.',
          'Memories that fade exponentially unless they are recalled or emotionally re-stimulated, with recall ranked by meaning, recency and mood.',
          'A daydream loop that finds connections between memories and consolidates facts into a short biography while you are away.',
          'A sense of time: it knows how long you have been gone and catches up when it wakes.',
        ],
      },
      { h: 'Mood you can measure' },
      'The mood is not just written into the prompt. ChronoSoul finds valence and arousal directions inside the model’s own activations and nudges them while it speaks, with an evaluation script that measures the effect on tone, energy and fluency.',
      'It runs fully local on 1.5B to 14B models, or on any of twenty cloud providers. The notebook opens in Colab with one click, and the same thinking about continuity shows up in DinoClaw’s Temporal Continuity setting.',
    ],
  },
  {
    slug: 'ai-for-the-people',
    title: 'AI for the people. Not the portfolio.',
    date: '2026-11-23',
    tag: 'Essay',
    image: '/img/m-dinobuddy.webp',
    excerpt:
      'The biggest companies in the world are racing to rent you an agent. I think most people just want help, on hardware they already own.',
    body: [
      'The biggest companies in the world are racing to build AI agents, and most of them run on someone else’s computer, with someone else’s model, at someone else’s price.',
      { quote: 'They forgot that most people just want help.' },
      'That line from the DinoClaw manifesto is still the north star for everything at BostonAI. A few beliefs fall out of it:',
      {
        list: [
          'AI should run on your machine, so your data, logins and documents stay yours.',
          'You should not need a terminal. Point, click, go.',
          'You should be able to pick any model, including free local ones.',
          'Agents should prove their work before they say “done.”',
        ],
      },
      'WorkBot and DinoClaw are two answers to the same question: what does a genuinely helpful agent look like for a normal person? One does your browser work. The other builds, organizes and plays alongside you. Both run on your desktop, your Steam Deck and your phone.',
      'If that resonates, request early access, tell me what you would use them for, and if you invest in early-stage companies, my inbox is open.',
    ],
  },
]

export const sortedPosts = () =>
  [...POSTS].sort((a, b) => (b.date ?? '9999').localeCompare(a.date ?? '9999'))

export const formatDate = (iso?: string) =>
  iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Featured'
