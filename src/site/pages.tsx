import { useEffect } from 'react'
import { ALL_PLATFORMS, DINOCLAW, PLATFORM_LABEL, PRODUCTS, WORKBOT, type Product } from './data'
import {
  CompareTable,
  DeviceShowcase,
  RecognitionStrip,
  ResearchSection,
  type DeviceShots,
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

const HOME_SHOTS: DeviceShots = {
  laptop: { src: '/img/workbot-app.webp', label: 'WorkBot on a laptop' },
  deck: { src: '/img/dinoclaw-projects.webp', pos: 'left top', label: 'DinoClaw on Steam Deck' },
  ios: { src: '/img/dinobuddy.webp', pos: '50% 40%', label: 'DinoBuddy on iPhone' },
  android: { src: '/img/workbot-app.webp', pos: '92% 50%', label: 'Robo on Android' },
}

const WORKBOT_SHOTS: DeviceShots = {
  laptop: { src: '/img/workbot-console.webp', label: 'WorkBot console on a laptop' },
  deck: { src: '/img/workbot-app.webp', pos: 'left top', label: 'WorkBot on Steam Deck' },
  ios: { src: '/img/workbot-app.webp', pos: '92% 50%', label: 'Robo on iPhone' },
  android: { src: '/img/workbot-hero.webp', pos: '22% 50%', label: 'WorkBot on Android' },
}

const DINO_SHOTS: DeviceShots = {
  laptop: { src: '/img/dinoclaw-projects.webp', label: 'DinoClaw Project Home on a laptop' },
  deck: { src: '/img/dinobuddy.webp', label: 'DinoBuddy on Steam Deck' },
  ios: { src: '/img/dinobuddy.webp', pos: '50% 40%', label: 'DinoBuddy on iPhone' },
  android: { src: '/img/dinoclaw-projects.webp', pos: '60% 50%', label: 'DinoClaw on Android' },
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
            <b>DinoClaw</b> builds, organizes and plays alongside you, with DinoBuddy at his side.
          </p>
          <div className="hero__actions">
            <a className="btn btn--accent btn--lg" href="#products">
              Explore the products
            </a>
            <a className="btn btn--ghost btn--lg" href="#investors">
              Investor relations
            </a>
          </div>
          <PlatformRow />
        </div>
        <div className="wrap hero-stage" aria-hidden>
          <div className="hero-stage__glow" />
          <img className="hero-stage__shot hero-stage__shot--left" src="/img/workbot-app.webp" alt="" />
          <img className="hero-stage__shot hero-stage__shot--right" src="/img/dinoclaw-projects.webp" alt="" />
          <img className="hero-stage__shot hero-stage__shot--center" src="/img/dinobuddy.webp" alt="" />
        </div>
      </section>

      <RecognitionStrip />

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

      <section id="platforms" className="section platforms">
        <div className="wrap">
          <SectionHead
            eyebrow="Everywhere you are"
            title={
              <>
                Every product. <em>Every screen.</em>
              </>
            }
            sub="WorkBot and DinoClaw both ship on Windows, macOS, Linux, Steam Deck, iOS and Android."
            center
          />
          <DeviceShowcase shots={HOME_SHOTS} products={PRODUCTS} />
        </div>
      </section>

      <ResearchSection />

      <HarvardFeature />

      <InvestorBand />
    </Shell>
  )
}

/* ───────────────────────── Product pages ───────────────────────── */

function ProductPage({
  product,
  rivalsTitle,
  shots,
  children,
}: {
  product: Product
  rivalsTitle: string
  shots: DeviceShots
  children?: React.ReactNode
}) {
  const p = product
  return (
    <Shell page={p.id}>
      <section id="top" className={`hero hero--product hero--${p.id}`}>
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

      <section className="section pitch">
        <div className="wrap">
          <SectionHead eyebrow={`Why ${p.name}`} title={p.pitch.title} sub={p.pitch.body} />
          <div className="usecases">
            {p.useCases.map(u => (
              <article key={u.title} className="usecase reveal">
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </article>
            ))}
          </div>
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
          <div className="reasons">
            {p.reasons.map((r, i) => (
              <article key={r.title} className="reason reveal">
                <span className="reason__n">{i + 1}</span>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
          <CompareTable data={p.compare} />
        </div>
      </section>

      <section id="platforms" className="section platforms">
        <div className="wrap">
          <SectionHead
            eyebrow="Platforms"
            title={`${p.name} runs everywhere you do`}
            sub={
              <>
                <b>Steam Deck:</b> {p.steamDeck} <br />
                <b>Mobile:</b> {p.mobile}
              </>
            }
          />
          <DeviceShowcase shots={shots} products={[{ name: p.name, href: '#top' }]} />
        </div>
      </section>

      <section className="section start">
        <div className="wrap start__inner reveal">
          <div>
            <p className="eyebrow">Get started</p>
            <h2>
              Up and running in <em>three steps</em>.
            </h2>
          </div>
          <ol className="steps">
            {p.steps.map(st => (
              <li key={st}>{st}</li>
            ))}
          </ol>
          <div className="start__cta">
            <a className="btn btn--accent btn--lg" href={p.releases} target="_blank" rel="noreferrer">
              Download {p.name}
            </a>
            <a className="btn btn--ghost btn--lg" href={p.repo} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
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
    <ProductPage product={WORKBOT} rivalsTitle="WorkBot vs. every big-lab agent" shots={WORKBOT_SHOTS}>
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
    <ProductPage product={DINOCLAW} rivalsTitle="DinoClaw vs. OpenClaw and the other claws" shots={DINO_SHOTS}>
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
