import { useState, type ReactNode } from 'react'
import {
  ALL_PLATFORMS,
  COMPANY,
  PLATFORM_LABEL,
  PRODUCTS,
  mail,
  type Cell,
  type Comparison,
  type Feature,
  type Platform,
  type Product,
} from './data'

export type PageId = 'home' | 'workbot' | 'dinoclaw'

export function Logo() {
  return (
    <a className="logo" href="/" aria-label="BostonAI home">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--ink)" />
        <path d="M9 22V10h7.2a3.4 3.4 0 0 1 0 6.8H9m7.2 0a2.6 2.6 0 0 1 0 5.2H9" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="23" cy="21" r="2.2" fill="var(--accent)" />
      </svg>
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
          <a href={page === 'home' ? '#platforms' : '/#platforms'}>Platforms</a>
          <a href={page === 'home' ? '#investors' : '#investors'}>Investors</a>
          <a className="btn btn--sm btn--dark" href={mail('BostonAI sales inquiry')}>
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
          <path d="M6.5 10h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              src="/img/harvard-demo.webp"
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
          <p className="investors__fine">We reply to every note personally, usually within a day.</p>
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
          <a className="btn btn--dark" href={mail(`Sales: ${product.name} for business`)}>
            Contact sales
          </a>
          <a className="btn btn--ghost" href={product.releases} target="_blank" rel="noreferrer">
            Download free
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
        </div>
        <div className="footer__col">
          <h4>Products</h4>
          {PRODUCTS.map(p => (
            <a key={p.id} href={p.href}>
              {p.name}
            </a>
          ))}
          <a href="/dinoclaw/#dinobuddy">DinoBuddy</a>
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
        <span>Steam Deck is a trademark of Valve Corporation. Other names are trademarks of their respective owners.</span>
      </div>
    </footer>
  )
}
