import { useEffect } from 'react'
import { ALL_PLATFORMS, DINOCLAW, PLATFORM_LABEL, PRODUCTS, WORKBOT, type Product } from './data'
import {
  CompareTable,
  FeatureGrid,
  Footer,
  HarvardBadge,
  HarvardFeature,
  InvestorBand,
  Nav,
  PlatformIcon,
  PlatformRow,
  SalesBand,
  SectionHead,
  type PageId,
} from './parts'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function Shell({ page, children }: { page: PageId; children: React.ReactNode }) {
  useReveal()
  return (
    <div className="site" data-page={page}>
      <Nav page={page} />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

/* ───────────────────────── Home ───────────────────────── */

export function HomePage() {
  return (
    <Shell page="home">
      <section className="hero hero--home">
        <div className="hero__bg" aria-hidden />
        <div className="wrap hero__inner">
          <HarvardBadge />
          <h1>
            AI agents that <em>actually finish</em> the job.
          </h1>
          <p className="hero__lede">
            BostonAI builds two agents that run on hardware you already own. <b>WorkBot</b> does your browser work.{' '}
            <b>DinoClaw</b> builds, organizes and plays alongside you, with DinoBuddy at his side. Desktop, Steam Deck, iOS and
            Android.
          </p>
          <div className="hero__actions">
            <a className="btn btn--dark btn--lg" href="#products">
              Explore the products
            </a>
            <a className="btn btn--ghost btn--lg" href="#investors">
              Investor relations
            </a>
          </div>
          <PlatformRow />
        </div>
      </section>

      <section id="products" className="section">
        <div className="wrap">
          <SectionHead eyebrow="Products" title="Two agents. Built for real work and real people." center />
          <div className="product-cards">
            {PRODUCTS.map(p => (
              <a key={p.id} className={`product-card reveal product-card--${p.id}`} href={p.href}>
                <div className="product-card__top">
                  <img src={p.icon} alt="" width="48" height="48" />
                  <div>
                    <h3>
                      {p.name} <span className="ver">v{p.version}</span>
                    </h3>
                    <p className="product-card__kicker">{p.kicker}</p>
                  </div>
                </div>
                <p className="product-card__head">{p.headline}</p>
                <div className="product-card__shot">
                  <img src={p.hero} alt={p.heroAlt} loading="lazy" />
                </div>
                <ul className="product-card__plat">
                  {ALL_PLATFORMS.map(pl => (
                    <li key={pl} title={PLATFORM_LABEL[pl]}>
                      <PlatformIcon p={pl} />
                    </li>
                  ))}
                </ul>
                <span className="product-card__link">See {p.name} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <SectionHead
            eyebrow="Why BostonAI"
            title="The big labs rent you an agent. We hand you one."
            sub="Cloud agents run on someone else’s computer, with someone else’s model, at someone else’s price. Ours run where you are."
            center
          />
          <div className="pillars">
            {[
              { t: 'Local first', d: 'Keys, memory, documents and logins stay on your device. Cloud models are optional, never required.' },
              { t: 'Any model', d: 'OpenAI, Anthropic, Gemini, Ollama, OpenRouter and more. Swap vendors without changing products.' },
              { t: 'Proven, not promised', d: 'Verification gates, review steps and audit logs. Our agents show their work before they say “done.”' },
              { t: 'Characters people love', d: 'Robo and DinoBuddy turn invisible automation into something you can watch, talk to and trust.' },
            ].map(x => (
              <article key={x.t} className="pillar reveal">
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="platforms" className="section">
        <div className="wrap">
          <SectionHead eyebrow="Everywhere you are" title="Every product. Every screen." sub="Both WorkBot and DinoClaw ship on all six platforms." center />
          <div className="plat-matrix reveal">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr">Product</span>
                  </th>
                  {ALL_PLATFORMS.map(p => (
                    <th key={p} scope="col">
                      <PlatformIcon p={p} />
                      <span>{PLATFORM_LABEL[p]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map(p => (
                  <tr key={p.id}>
                    <th scope="row">
                      <a href={p.href}>{p.name}</a>
                    </th>
                    {ALL_PLATFORMS.map(pl => (
                      <td key={pl}>
                        <span className="dot-yes" aria-label="Available" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="deck-callout reveal">
            <div className="deck-callout__icon">
              <PlatformIcon p="steamdeck" />
            </div>
            <div>
              <h3>Made for Steam Deck</h3>
              <p>
                WorkBot and DinoClaw both run natively on Steam Deck, with handheld-sized layouts, touch and gamepad input. Add
                them to Steam and launch them like any other game.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HarvardFeature />

      <InvestorBand />
    </Shell>
  )
}

/* ───────────────────────── Product pages ───────────────────────── */

function ProductPage({ product, rivalsTitle, children }: { product: Product; rivalsTitle: string; children?: React.ReactNode }) {
  const p = product
  return (
    <Shell page={p.id}>
      <section className={`hero hero--product hero--${p.id}`}>
        <div className="hero__bg" aria-hidden />
        <div className="wrap hero__split">
          <div className="hero__copy">
            <p className="eyebrow">
              <img src={p.icon} alt="" width="22" height="22" /> {p.name} v{p.version} · {p.kicker}
            </p>
            <h1>{p.headline}</h1>
            <p className="hero__lede">{p.lede}</p>
            <div className="hero__actions">
              <a className="btn btn--accent btn--lg" href={p.releases} target="_blank" rel="noreferrer">
                Download {p.name}
              </a>
              <a className="btn btn--ghost btn--lg" href="#investors">
                Early investors
              </a>
            </div>
            {p.id === 'dinoclaw' && <HarvardBadge compact />}
          </div>
          <figure className="hero__shot">
            <img src={p.hero} alt={p.heroAlt} />
          </figure>
        </div>
        <div className="wrap">
          <dl className="stats">
            {p.stats.map(s => (
              <div key={s.k}>
                <dt>{s.v}</dt>
                <dd>{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead eyebrow="Features" title={`What ${p.name} can do`} />
          <FeatureGrid features={p.features} />
        </div>
      </section>

      <section id={p.id === 'dinoclaw' ? 'dinobuddy' : 'robo'} className="section section--tint">
        <div className="wrap companion">
          <figure className="companion__img reveal">
            <img src={p.companion.image} alt={`${p.companion.name}, the ${p.name} companion`} loading="lazy" />
          </figure>
          <div className="companion__copy">
            <p className="eyebrow">Companion · {p.companion.name}</p>
            <h2>{p.companion.title}</h2>
            <p>{p.companion.body}</p>
            <ul className="checks">
              {p.companion.points.map(x => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {children}

      <section id="compare" className="section">
        <div className="wrap">
          <SectionHead eyebrow="Compare" title={rivalsTitle} />
          <CompareTable data={p.compare} />
        </div>
      </section>

      <section id="platforms" className="section section--tint">
        <div className="wrap">
          <SectionHead eyebrow="Platforms" title={`${p.name} runs everywhere you do`} />
          <PlatformRow />
          <div className="plat-cards">
            <article className="plat-card reveal">
              <PlatformIcon p="windows" />
              <h3>Desktop</h3>
              <p>Native installers for Windows, macOS (Apple Silicon and Intel) and Linux.</p>
            </article>
            <article className="plat-card plat-card--deck reveal">
              <PlatformIcon p="steamdeck" />
              <h3>Steam Deck</h3>
              <p>{p.steamDeck}</p>
            </article>
            <article className="plat-card reveal">
              <PlatformIcon p="ios" />
              <h3>iOS &amp; Android</h3>
              <p>{p.mobile}</p>
            </article>
          </div>
        </div>
      </section>

      <SalesBand product={p} />
      <InvestorBand product={p} />
    </Shell>
  )
}

export function WorkBotPage() {
  return (
    <ProductPage product={WORKBOT} rivalsTitle="WorkBot vs. OpenAI Dots and Grok Bot">
      <section className="section">
        <div className="wrap shot-band reveal">
          <div>
            <p className="eyebrow">The console</p>
            <h2>One prompt. Every tab. A playbook for next time.</h2>
            <p>
              The live HUD shows step progress, the active model, the playbooks it applied and the current friction level, so
              you always know what WorkBot is doing and why.
            </p>
          </div>
          <img src="/img/workbot-console.webp" alt="WorkBot console with the Neural Stack, provider picker and task suggestions" loading="lazy" />
        </div>
      </section>
    </ProductPage>
  )
}

export function DinoClawPage() {
  return (
    <ProductPage product={DINOCLAW} rivalsTitle="DinoClaw vs. OpenClaw and the other claws">
      <HarvardFeature />
      <section className="section">
        <div className="wrap manifesto reveal">
          <p className="eyebrow">Our creed</p>
          <blockquote>“AI for the people. Not the portfolio.”</blockquote>
          <p>
            DinoClaw is for the freelancer, the student, the small business owner and the curious tinkerer. No terminal, no
            Docker, no monthly bill. Double-click, run, done.
          </p>
        </div>
      </section>
    </ProductPage>
  )
}
