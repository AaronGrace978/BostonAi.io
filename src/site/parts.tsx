import { useState, type ReactNode } from 'react'
import {
  ALL_PLATFORMS,
  COMPANY,
  FEATURED_RESEARCH,
  GITHUB_STATS,
  RECOGNITION,
  RESEARCH,
  PLATFORM_LABEL,
  PRODUCTS,
  mail,
  type Cell,
  type Comparison,
  type Feature,
  type Platform,
  type Product,
} from './data'

export type PageId = 'home' | 'workbot' | 'dinoclaw' | 'blog' | 'frustum'

export function Logo() {
  return (
    <a className="logo" href="/" aria-label="BostonAI home">
      <img src="/favicon.svg?v=3" alt="" width="32" height="32" />
      <span>
        Boston<b>AI</b>
      </span>
    </a>
  )
}

export function Nav({ page }: { page: PageId }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={`nav${open ? ' nav--open' : ''}`}>
      <div className="nav__inner">
        <Logo />
        <button type="button" className="nav__toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <span />
          <span />
        </button>
        <nav className="nav__links" onClick={() => setOpen(false)}>
          <a href="/workbot/" aria-current={page === 'workbot' ? 'page' : undefined}>
            WorkBot
          </a>
          <a href="/dinoclaw/" aria-current={page === 'dinoclaw' ? 'page' : undefined}>
            DinoClaw
          </a>
          <a href="/#mission">Mission</a>
          <a href="/frustum/" aria-current={page === 'frustum' ? 'page' : undefined}>
            Frustum
          </a>
          <a href="/entity/">The Entity</a>
          <a href="/blog/" aria-current={page === 'blog' ? 'page' : undefined}>
            Blog
          </a>
          <a href="#investors">Investors</a>
          <a className="btn btn--sm btn--light" href={mail('BostonAI sales inquiry')}>
            Talk to sales
          </a>
        </nav>
      </div>
    </header>
  )
}

const ICONS: Record<Platform, ReactNode> = {
  windows: <path d="M3 5.5 10.5 4.4v7H3zM11.5 4.3 21 3v8.4h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" />,
  macos: (
    <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5a4.3 4.3 0 0 0-3.4-1.8c-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8A4.5 4.5 0 0 0 4.7 9.7c-1.6 2.8-.4 6.9 1.1 9.2.8 1.1 1.7 2.3 2.8 2.3s1.6-.7 3-.7 1.8.7 3 .7 2-1.1 2.7-2.2a9 9 0 0 0 1.2-2.5 3.9 3.9 0 0 1-2.1-3.9zM14.2 5.8A3.9 3.9 0 0 0 15.1 3a4 4 0 0 0-2.6 1.3 3.7 3.7 0 0 0-.9 2.7 3.3 3.3 0 0 0 2.6-1.2z" />
  ),
  ios: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="10" y="18" width="4" height="1.4" rx=".7" />
    </>
  ),
  android: (
    <path d="M7.2 9.5h9.6v7.3a1.2 1.2 0 0 1-1.2 1.2h-.8v2.4a1.1 1.1 0 0 1-2.2 0V18h-1.2v2.4a1.1 1.1 0 0 1-2.2 0V18h-.8a1.2 1.2 0 0 1-1.2-1.2zM4.9 9.6a1.1 1.1 0 0 1 2.2 0v4.9a1.1 1.1 0 0 1-2.2 0zm12 0a1.1 1.1 0 0 1 2.2 0v4.9a1.1 1.1 0 0 1-2.2 0zM7.3 8.7a4.8 4.8 0 0 1 2.4-3.8l-.9-1.6.5-.3 1 1.6a5 5 0 0 1 3.4 0l1-1.6.5.3-.9 1.6a4.8 4.8 0 0 1 2.4 3.8zm2.8-2a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2zm3.8 0a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2z" />
  ),
  linux: (
    <path d="M12 2.5c-2.2 0-3.4 1.9-3.4 4.4 0 1.4.4 2.4.1 3.3-.5 1.4-2.8 3.3-2.8 6.1 0 .7.2 1.2.5 1.6-.6.4-1.5.6-1.5 1.5 0 1.2 2.4 1.1 3.6 1.7.9.4 1.7.4 2.3-.3h2.4c.6.7 1.4.7 2.3.3 1.2-.6 3.6-.5 3.6-1.7 0-.9-.9-1.1-1.5-1.5.3-.4.5-.9.5-1.6 0-2.8-2.3-4.7-2.8-6.1-.3-.9.1-1.9.1-3.3 0-2.5-1.2-4.4-3.4-4.4zm-1.3 4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm2.6 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zM12 9.2l1.6.8-1.6.9-1.6-.9z" />
  ),
  steamdeck: (
    <>
      <circle cx="13" cy="12" r="6.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="13" cy="12" r="2.6" />
      <path d="M3.5 10.6h3.2v2.8H3.5z" />
    </>
  ),
}

export function PlatformIcon({ p }: { p: Platform }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      {ICONS[p]}
    </svg>
  )
}

export function PlatformRow({ platforms = ALL_PLATFORMS }: { platforms?: Platform[] }) {
  return (
    <ul className="platform-row" aria-label="Available platforms">
      {platforms.map(p => (
        <li key={p}>
          <PlatformIcon p={p} />
          {PLATFORM_LABEL[p]}
        </li>
      ))}
    </ul>
  )
}

export function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <header className={`section-head${center ? ' section-head--center' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {sub && <p className="section-head__sub">{sub}</p>}
    </header>
  )
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="feature-grid">
      {features.map((f, i) => (
        <article key={f.title} className="feature">
          <span className="feature__n">{String(i + 1).padStart(2, '0')}</span>
          <h3>{f.title}</h3>
          <p>{f.body}</p>
        </article>
      ))}
    </div>
  )
}

function CellView({ c }: { c: Cell }) {
  if (c === true)
    return (
      <span className="cell cell--yes">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity=".14" />
          <path d="m6 10.3 2.6 2.6L14 7.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr">Yes</span>
      </span>
    )
  if (c === false)
    return (
      <span className="cell cell--no">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity=".14" />
          <path d="m7.2 7.2 5.6 5.6m0-5.6-5.6 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="sr">No</span>
      </span>
    )
  return <span className="cell cell--text">{c}</span>
}

export function CompareTable({ data }: { data: Comparison }) {
  return (
    <div className="compare">
      <div className="compare__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr">Capability</span>
              </th>
              {data.columns.map((c, i) => (
                <th key={c} scope="col" className={i === 0 ? 'is-us' : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map(r => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {r.cells.map((c, i) => (
                  <td key={i} className={i === 0 ? 'is-us' : undefined}>
                    <CellView c={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="compare__honest">{data.honest}</p>
      <p className="compare__foot">{data.footnote}</p>
    </div>
  )
}

export function HarvardBadge({ compact }: { compact?: boolean }) {
  return (
    <a className={`harvard-badge${compact ? ' harvard-badge--compact' : ''}`} href="/dinoclaw/#harvard">
      <span className="harvard-badge__seal" aria-hidden>
        H
      </span>
      <span>
        <b>Demoed at Harvard University</b>
        {!compact && <small>DinoBuddy, live on the big screen</small>}
      </span>
    </a>
  )
}

export function HarvardFeature() {
  const [hasPhoto, setHasPhoto] = useState(true)
  return (
    <section id="harvard" className="section harvard">
      <div className={`wrap harvard__inner${hasPhoto ? '' : ' harvard__inner--solo'}`}>
        <div className="harvard__copy">
          <p className="eyebrow">In the room</p>
          <h2>DinoBuddy went to Harvard.</h2>
          <p>
            DinoClaw and DinoBuddy were demoed live at Harvard University. Up on the lecture-hall screen, DinoBuddy talked with
            the room in Talk Mode while DinoClaw showed off a 3D game it built on its own canvas engine and verified with a
            passing smoke check.
          </p>
          <ul className="checks">
            <li>Live voice conversation with DinoBuddy</li>
            <li>An agent-built 3D game, smoke-tested and launched</li>
            <li>Running in the shipping desktop app</li>
          </ul>
        </div>
        {hasPhoto && (
          <figure className="harvard__photo">
            <img
              src="/img/harvard-demo-wide.webp"
              alt="The BostonAI team and attendees in a Harvard lecture hall in front of DinoBuddy on the projector screen"
              loading="lazy"
              onError={() => setHasPhoto(false)}
            />
            <figcaption>DinoBuddy on the big screen at Harvard University.</figcaption>
          </figure>
        )}
      </div>
    </section>
  )
}

export function InvestorBand({ product }: { product?: Product }) {
  const subject = product ? `Early investor interest: ${product.name}` : 'Early investor interest: BostonAI'
  const body = `Hi Aaron,\n\nI'd like to learn more about investing early in ${product ? product.name : 'BostonAI'}.\n\nName:\nFirm / angel:\nTypical check size:\n\nThanks!`
  return (
    <section id="investors" className="section investors">
      <div className="wrap investors__inner">
        <div>
          <p className="eyebrow eyebrow--light">For investors</p>
          <h2>{product ? `Back ${product.name} early.` : 'Two shipping products. One small, fast team.'}</h2>
          <p>
            {product
              ? `${product.name} is built, released and in users’ hands on desktop, Steam Deck, iOS and Android. The product risk is behind us. We are now opening a small early-investor round to fund growth, mobile and go-to-market.`
              : 'WorkBot and DinoClaw are built, released and running on Windows, macOS, Linux, Steam Deck, iOS and Android. We are opening a small early-investor round to fund growth, mobile and go-to-market.'}
          </p>
          <ul className="investors__points">
            <li>
              <b>Shipping today</b>
              <span>Public releases, installers and changelogs, not slideware</span>
            </li>
            <li>
              <b>Capital-light</b>
              <span>BYOK and local models mean near-zero inference cost to us</span>
            </li>
            <li>
              <b>Two wedges</b>
              <span>Browser work for professionals, a desktop companion for everyone</span>
            </li>
          </ul>
        </div>
        <div className="investors__card">
          <p className="investors__label">Early investor list</p>
          <p className="investors__status">
            <span className="pulse" aria-hidden /> Now taking intro calls
          </p>
          <a className="btn btn--accent btn--lg btn--block" href={mail(subject, body)}>
            Become an early investor
          </a>
          <a className="btn btn--ghost-light btn--block" href={mail(product ? `Sales / licensing: ${product.name}` : 'Sales / licensing: BostonAI')}>
            Sales &amp; licensing
          </a>
          <p className="investors__fine">
            We reply to every note personally, usually within a day.
            <br />
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function SalesBand({ product }: { product: Product }) {
  return (
    <section className="section sales">
      <div className="wrap">
        <SectionHead
          eyebrow="Buying for a team?"
          title={`${product.name} for business`}
          sub="Volume licensing, private deployments and white-label partnerships are available today."
        />
        <div className="sales__grid">
          {[
            { t: 'Team licenses', d: 'Seats for your whole team, central key management and shared playbooks or skills.' },
            { t: 'Private deployment', d: 'Run fully on your hardware with local models. Nothing leaves your network.' },
            { t: 'OEM & white-label', d: 'Ship our agent under your brand, on your devices, including handhelds.' },
          ].map(s => (
            <article key={s.t} className="sales__card">
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
        <div className="sales__cta">
          <a className="btn btn--light" href={mail(`Sales: ${product.name} for business`)}>
            Contact sales
          </a>
          <a className="btn btn--ghost" href={product.releases} target="_blank" rel="noreferrer">
            Download {product.name}
          </a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__brand">
          <Logo />
          <p>{COMPANY.tagline}</p>
          <p className="footer__small">Built in Boston, MA.</p>
          <p>
            <a className="footer__email" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>
          </p>
        </div>
        <div className="footer__col">
          <h4>Products</h4>
          {PRODUCTS.map(p => (
            <a key={p.id} href={p.href}>
              {p.name}
            </a>
          ))}
          <a href="/dinoclaw/#dinobuddy">DinoBuddy</a>
          <a href="/frustum/">Frustum</a>
          <a href="/entity/">The Entity</a>
        </div>
        <div className="footer__col">
          <h4>Download</h4>
          {PRODUCTS.map(p => (
            <a key={p.id} href={p.releases} target="_blank" rel="noreferrer">
              {p.name} releases
            </a>
          ))}
        </div>
        <div className="footer__col">
          <h4>Company</h4>
          <a href="/#mission">Our mission</a>
          <a href="/#research">Research</a>
          <a href="/frustum/#whitepaper">Frustum white paper</a>
          <a href="/blog/">Blog</a>
          <a href="#investors">Investors</a>
          <a href={mail('BostonAI sales inquiry')}>Sales</a>
          <a href={COMPANY.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={COMPANY.community.href} target="_blank" rel="noreferrer">
            {COMPANY.community.label}
          </a>
        </div>
      </div>
      <div className="wrap footer__legal">
        <span>© {new Date().getFullYear()} BostonAI. All rights reserved.</span>
        <span>Steam and Steam Deck are trademarks of Valve Corporation. BostonAI is not affiliated with or endorsed by Valve. Other names are trademarks of their respective owners.</span>
      </div>
    </footer>
  )
}

export function RecognitionStrip() {
  const items = [...RECOGNITION, ...RECOGNITION]
  return (
    <section className="recog" aria-label="Recognition">
      <p className="recog__label">Demoed, shortlisted and built at</p>
      <div className="recog__track">
        <ul>
          {items.map((r, i) => (
            <li key={i} aria-hidden={i >= RECOGNITION.length || undefined}>
              <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" tabIndex={i >= RECOGNITION.length ? -1 : undefined}>
                <b>{r.label}</b>
                <span>{r.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export type DeviceShots = {
  laptop: { src: string; pos?: string; label: string }
  ios: { src: string; pos?: string; label: string }
  android: { src: string; pos?: string; label: string }
}

function Screen({ src, pos, label }: { src: string; pos?: string; label: string }) {
  return <img className="screen" src={src} alt={label} loading="lazy" style={pos ? { objectPosition: pos } : undefined} />
}

export function DeviceShowcase({ shots, products }: { shots: DeviceShots; products: { name: string; href: string }[] }) {
  return (
    <div className="devices">
      <article className="dev-card dev-card--desktop reveal">
        <div className="dev-card__copy">
          <div className="dev-card__icons">
            <PlatformIcon p="windows" />
            <PlatformIcon p="macos" />
            <PlatformIcon p="linux" />
          </div>
          <h3>Desktop</h3>
          <p>Native installers for Windows, macOS (Apple Silicon &amp; Intel) and Linux.</p>
        </div>
        <div className="laptop" aria-hidden>
          <div className="laptop__lid">
            <Screen {...shots.laptop} />
          </div>
          <div className="laptop__base" />
        </div>
      </article>

      <article className="dev-card dev-card--mobile reveal">
        <div className="dev-card__copy">
          <div className="dev-card__icons">
            <PlatformIcon p="ios" />
            <PlatformIcon p="android" />
          </div>
          <h3>iOS &amp; Android</h3>
          <p>Your agent in your pocket: check on tasks, approve steps and chat with your companion.</p>
        </div>
        <div className="phones" aria-hidden>
          <div className="phone phone--ios">
            <span className="phone__island" />
            <Screen {...shots.ios} />
          </div>
          <div className="phone phone--android">
            <span className="phone__cam" />
            <Screen {...shots.android} />
          </div>
        </div>
      </article>

      <article className="dev-card dev-card--deck reveal">
        <div className="deck-ready">
          <div className="deck-ready__badge" aria-hidden>
            <PlatformIcon p="steamdeck" />
          </div>
          <div className="deck-ready__copy">
            <p className="eyebrow">Handheld</p>
            <h3>Built to be Deck Ready</h3>
            <p>
              Both apps are designed for handheld gaming PCs like Steam Deck: they fit the screen, respond to gamepad,
              trackpad and touch, and run from Desktop Mode or straight from your library.
            </p>
          </div>
          <ul className="deck-ready__list">
            <li>Handheld-sized layouts</li>
            <li>Gamepad, trackpad &amp; touch</li>
            <li>Game Mode or Desktop Mode</li>
          </ul>
        </div>
      </article>

      <div className="avail reveal">
        {products.map(p => (
          <a key={p.name} className="avail__row" href={p.href}>
            <b>{p.name}</b>
            <span className="avail__chips">
              {ALL_PLATFORMS.map(pl => (
                <span key={pl} className="avail__chip" title={PLATFORM_LABEL[pl]}>
                  <PlatformIcon p={pl} />
                  <span>{PLATFORM_LABEL[pl]}</span>
                </span>
              ))}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

export function ResearchSection() {
  const f = FEATURED_RESEARCH
  return (
    <section id="research" className="section research">
      <div className="wrap">
        <SectionHead
          eyebrow="Research & open source"
          title={
            <>
              The lab behind the <em>products</em>.
            </>
          }
          sub="WorkBot and DinoClaw sit on top of a deep bench of public research into agents that stay continuous, honest and cheap to run."
        />
        <a className="frustum-feature reveal" href="/frustum/">
          <div className="frustum-feature__copy">
            <span className="frustum-feature__tag">New · white paper v0.11</span>
            <h3>
              Frustum: a 510 GB model on a <em>16 GB</em> GPU.
            </h3>
            <p>
              DeepSeek V4.1 Flash streamed from a USB SSD through one RTX 5060 Ti, at about four seconds a token. Qwen3-Next
              80B, GLM and Phi-4 run on the same engine.
            </p>
            <span className="frustum-feature__cta">Explore Frustum and the white paper →</span>
          </div>
          <img src="/img/frustum-activateprime.webp" alt="ActivatePrime running Qwen3-Next 80B on Frustum" loading="lazy" />
        </a>

        <article className="featured reveal">
          <div className="featured__art">
            <img src={f.image} alt="ChronoSoul: a glowing mind suspended in a glass chamber surrounded by drifting memories" loading="lazy" />
            <span className="featured__tag">Featured research</span>
          </div>
          <div className="featured__copy">
            <p className="featured__repo">
              github.com/AaronGrace978/<b>{f.repo}</b>
            </p>
            <h3>
              {f.name}: {f.title}
            </h3>
            <p>{f.body}</p>
            <ul className="checks">
              {f.points.map(x => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="featured__cta">
              <a className="btn btn--accent" href={f.href} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
              <a className="btn btn--ghost" href={f.colab} target="_blank" rel="noreferrer">
                Open in Colab
              </a>
            </div>
          </div>
        </article>

        <div className="repo-grid">
          {RESEARCH.map(r => (
            <a key={r.name} className="repo reveal" href={r.href} target="_blank" rel="noreferrer">
              <span className="repo__top">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.71 1.71.75.75 0 0 1-1.07 1.06A2.5 2.5 0 0 1 2 11.5zm10.5-1h-8a1 1 0 0 0-1 1v6.71A2.5 2.5 0 0 1 4.5 9h8zM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.09a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2z" />
                </svg>
                <span className="repo__lang">{r.lang}</span>
              </span>
              <b>{r.name}</b>
              <span className="repo__blurb">{r.blurb}</span>
            </a>
          ))}
        </div>

        <div className="gh-band reveal">
          <dl>
            {GITHUB_STATS.map(s => (
              <div key={s.k}>
                <dt>{s.v}</dt>
                <dd>{s.k}</dd>
              </div>
            ))}
          </dl>
          <a className="btn btn--light" href={COMPANY.github} target="_blank" rel="noreferrer">
            See everything on GitHub →
          </a>
        </div>
      </div>
    </section>
  )
}

export function MissionSection() {
  return (
    <section id="mission" className="section mission">
      <div className="wrap mission__inner">
        <p className="eyebrow">Our mission</p>
        <h2 className="mission__headline">
          AI that works for <em>you</em>.
        </h2>
        <div className="mission__letter">
          <p className="mission__lead">
            BostonAI builds artificial intelligence for regular people. Not for a quarterly report, not for a leaderboard.
            For you.
          </p>
          <p>
            You have heard the headlines about AI taking over the world. Relax. Around here, the only thing taking over the
            world is the Celtics, and they have the banners hanging from the rafters to prove it.
          </p>
          <p>
            The real story is quieter, and more urgent. Too much of this industry is racing to push out the next model and
            move the next metric, while the people who could gain the most are left behind: the parent working two jobs,
            the student without a tutor, the neighbor who cannot afford one more subscription, the communities the market
            rarely stops to notice. Technology this powerful should lift up the people who need it most, not only the people
            who can pay the most.
          </p>
          <p>
            So we build differently. Our products run on hardware you already own. Your data stays with you. You choose the
            model, and you never need a subscription just to get help. And because help should feel human, our agents come
            with a little heart: a robot named Robo and a dinosaur named DinoBuddy, both firmly on your side.
          </p>
          <p className="mission__close">AI should work for you, and be your buddy. That is the whole idea.</p>
          <div className="mission__sign">
            <span className="mission__signature">Aaron Grace</span>
            <span>Founder, BostonAI · Boston, Massachusetts</span>
          </div>
        </div>
        <div className="mission__pillars">
          {[
            { t: 'People over metrics', d: 'We measure success by the people we help, not the benchmarks we top.' },
            { t: 'Yours, not rented', d: 'Your machine, your data, your choice of model. No lock-in, no surprise bills.' },
            { t: 'Everyone, first', d: 'Built for regular people, with those who are overlooked most at the front of the line.' },
          ].map(x => (
            <article key={x.t} className="mission__pillar reveal">
              <h3>{x.t}</h3>
              <p>{x.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EntityBand() {
  return (
    <section className="section entity-band">
      <div className="wrap">
        <a className="entity-card reveal" href="/entity/">
          <div className="entity-card__copy">
            <span className="entity-card__tag">◆ Try it now · no download</span>
            <h2>
              Talk to <em>The Entity</em>.
            </h2>
            <p>
              A face made of light that contorts in real time as the model thinks. Bring your own key for Ollama Cloud,
              OpenAI, Anthropic, Gemini, OpenRouter or Groq, or try it with the built-in simulator.
            </p>
            <p className="entity-card__fine">Your key is never saved. It is wiped the moment you end the chat.</p>
            <span className="entity-card__cta">Open The Entity →</span>
          </div>
          <img src="/img/entity-chat.webp" alt="The Entity: a green ASCII face beside a chat transcript" loading="lazy" />
        </a>
      </div>
    </section>
  )
}
