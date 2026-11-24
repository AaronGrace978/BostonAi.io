import { useEffect, useState } from 'react'
import { AUTHOR, POSTS, formatDate, sortedPosts, type Post } from './blog'
import { ALL_PLATFORMS, CHRONOSOUL, DINOCLAW, FEATURED_RESEARCH, FRUSTUM, PLATFORM_LABEL, PRODUCTS, WORKBOT, type Product } from './data'
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
  MissionSection,
  FounderNote,
  EntityBand,
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
  ios: { src: '/img/m-dinobuddy.webp', pos: 'top', label: 'DinoBuddy app on a phone' },
  android: { src: '/img/m-workbot-robo.webp', pos: 'top', label: 'WorkBot Mobile on Android' },
}

const WORKBOT_SHOTS: DeviceShots = {
  laptop: { src: '/img/workbot-console.webp', label: 'WorkBot console on a laptop' },
  ios: { src: '/img/m-workbot-chat.webp', pos: 'top', label: 'WorkBot Mobile chat' },
  android: { src: '/img/m-workbot-robo.webp', pos: 'top', label: 'Robo on WorkBot Mobile' },
}

const DINO_SHOTS: DeviceShots = {
  laptop: { src: '/img/dinoclaw-projects.webp', label: 'DinoClaw Project Home on a laptop' },
  ios: { src: '/img/m-dinobuddy.webp', pos: 'top', label: 'DinoBuddy app on a phone' },
  android: { src: '/img/m-dino-nest.webp', pos: 'top', label: 'The Nest in the DinoBuddy app' },
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

      <MissionSection />

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
                      {p.name} <span className="ver ver--soon">Coming soon</span>
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

      <EntityBand />

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

      <BlogTeaser />

      <FounderNote />

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
              <img src={p.icon} alt="" width="22" height="22" /> {p.name} · {p.kicker}
            </p>
            <span className="soon-pill">
              <span className="pulse" aria-hidden /> Coming soon · early access open
            </span>
            <h1>{p.headline}</h1>
            <p className="hero__lede">{p.lede}</p>
            <div className="hero__actions">
              <a className="btn btn--accent btn--lg" href={p.earlyAccess}>
                Request early access
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

      <section id="mobile" className="section mobile">
        <div className="wrap mobile__inner">
          <div className="mobile__copy">
            <p className="eyebrow">iOS &amp; Android</p>
            <h2>
              {p.id === 'dinoclaw' ? 'Dino' : p.name} in your <em>pocket</em>.
            </h2>
            <p>{p.mobile}</p>
            <div className="mobile__stores">
              <span className="store">
                <PlatformIcon p="ios" /> iPhone
              </span>
              <span className="store">
                <PlatformIcon p="android" /> Android
              </span>
            </div>
          </div>
          <div className={`mobile__phones mobile__phones--${p.mobileShots.length}`}>
            {p.mobileShots.map((m, i) => (
              <figure key={m.src} className={`mphone reveal mphone--${i}`}>
                <div className="mphone__body">
                  <span className="mphone__cam" />
                  <img src={m.src} alt={m.caption} loading="lazy" width={540} height={m.h ?? 1099} />
                </div>
                <figcaption>{m.caption}</figcaption>
              </figure>
            ))}
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
                <b>Deck Ready:</b> {p.steamDeck} <br />
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
              Coming soon. <em>Get on the list</em>.
            </h2>
          </div>
          <ol className="steps">
            {p.steps.map(st => (
              <li key={st}>{st}</li>
            ))}
          </ol>
          <div className="start__cta">
            <a className="btn btn--accent btn--lg" href={p.earlyAccess}>
              Request early access
            </a>
            <a className="btn btn--ghost btn--lg" href="#investors">
              Investor relations
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

/* ───────────────────────── Blog ───────────────────────── */

function PostCard({ post, big }: { post: Post; big?: boolean }) {
  return (
    <a className={`post-card reveal${big ? ' post-card--big' : ''}`} href={`/blog/#${post.slug}`}>
      <div className="post-card__img">
        <img src={post.image} alt="" loading="lazy" />
      </div>
      <div className="post-card__body">
        <p className="post-meta">
          <span className="post-tag">{post.tag}</span>
          <span>{formatDate(post.date)}</span>
        </p>
        <h3>{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <span className="post-card__more">Read the post →</span>
      </div>
    </a>
  )
}

export function BlogTeaser() {
  const posts = sortedPosts().slice(0, 3)
  return (
    <section id="blog" className="section blog-teaser">
      <div className="wrap">
        <div className="blog-teaser__head">
          <SectionHead
            eyebrow="The Aaron Grace Blog"
            title={
              <>
                Notes from the <em>bench</em>.
              </>
            }
            sub="Release stories, demos and research from the founder of BostonAI."
          />
          <a className="btn btn--ghost" href="/blog/">
            All posts
          </a>
        </div>
        <div className="post-grid">
          {posts.map(p => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Byline() {
  return (
    <div className="byline">
      <span className="byline__avatar" aria-hidden>
        AG
      </span>
      <span>
        <b>{AUTHOR.name}</b>
        <small>{AUTHOR.role}</small>
      </span>
    </div>
  )
}

function Article({ post }: { post: Post }) {
  const all = sortedPosts()
  const i = all.findIndex(p => p.slug === post.slug)
  const next = all[(i + 1) % all.length]
  useEffect(() => {
    document.title = `${post.title} | Aaron Grace`
    window.scrollTo(0, 0)
  }, [post])
  return (
    <article className="article">
      <div className="wrap article__wrap">
        <a className="article__back" href="/blog/">
          ← All posts
        </a>
        <p className="post-meta">
          <span className="post-tag">{post.tag}</span>
          <span>{formatDate(post.date)}</span>
        </p>
        <h1>{post.title}</h1>
        <p className="article__lede">{post.excerpt}</p>
        <Byline />
        <figure className="article__hero">
          <img src={post.image} alt="" />
        </figure>
        <div className="article__body">
          {post.body.map((b, k) =>
            typeof b === 'string' ? (
              <p key={k}>{b}</p>
            ) : 'h' in b ? (
              <h2 key={k}>{b.h}</h2>
            ) : 'quote' in b ? (
              <blockquote key={k}>{b.quote}</blockquote>
            ) : (
              <ul key={k}>
                {b.list.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ),
          )}
        </div>
        <div className="article__foot">
          <Byline />
          <a className="next-post" href={`/blog/#${next.slug}`}>
            <small>Next post</small>
            <b>{next.title} →</b>
          </a>
        </div>
      </div>
    </article>
  )
}

export function BlogPage() {
  const read = () => POSTS.find(p => p.slug === window.location.hash.slice(1))
  const [post, setPost] = useState(read)
  useEffect(() => {
    const on = () => setPost(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (!post) document.title = 'Blog | Aaron Grace, BostonAI'
    requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in')))
  }, [post])
  const [first, ...rest] = sortedPosts()
  return (
    <Shell page="blog">
      {post ? (
        <Article post={post} />
      ) : (
        <>
          <section className="hero hero--blog">
            <div className="hero__bg" aria-hidden />
            <div className="wrap hero__inner">
              <p className="eyebrow">The Aaron Grace Blog</p>
              <h1>
                Notes from building <em>BostonAI</em>.
              </h1>
              <p className="hero__lede">
                Release stories, demos and research behind WorkBot, DinoClaw and DinoBuddy, written by founder Aaron Grace.
              </p>
            </div>
          </section>
          <section className="section section--blog-list">
            <div className="wrap">
              <PostCard post={first} big />
              <div className="post-grid">
                {rest.map(p => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      <InvestorBand />
    </Shell>
  )
}

/* ───────────────────────── Frustum ───────────────────────── */

export function FrustumPage() {
  const f = FRUSTUM
  return (
    <Shell page="frustum">
      <section className="hero hero--product hero--frustum">
        <div className="hero__bg" aria-hidden />
        <div className="wrap hero__split">
          <div className="hero__copy">
            <p className="eyebrow">Research · Frustum · open source (AGPL-3.0)</p>
            <h1>
              A 510 GB model on a <em>16 GB</em> GPU.
            </h1>
            <p className="hero__lede">
              Frustum streams giant mixture-of-experts models from a plain USB SSD through one consumer graphics card. DeepSeek
              V4.1 Flash, Qwen3-Next 80B, GLM and Phi-4 all chat locally, with no data center and nothing leaving the machine.
            </p>
            <div className="hero__actions">
              <a className="btn btn--accent btn--lg" href={f.paper} target="_blank" rel="noreferrer">
                Read the white paper
              </a>
              <a className="btn btn--ghost btn--lg" href={f.repo} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </div>
          </div>
          <figure className="hero__shot">
            <img src="/img/frustum-activateprime.webp" alt="ActivatePrime running Qwen3-Next 80B on Frustum, with its run inspector showing VRAM, RAM and SSD placement" />
          </figure>
        </div>
        <div className="wrap">
          <dl className="stats">
            {f.stats.map(s => (
              <div key={s.k}>
                <dt>{s.v}</dt>
                <dd>{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap frustum-why">
          <div>
            <p className="eyebrow">Why “Frustum”</p>
            <h2>Only what is in view.</h2>
          </div>
          <p>
            A game engine never draws the whole world. It streams and renders what sits inside the camera’s frustum. Frustum
            treats a giant model the same way: for each token, only the experts the router actually picks are brought onto
            the GPU, and everything else waits on the SSD. That is how a checkpoint 30 times larger than the card’s memory
            can still talk back.
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="Engineering for the drive, not the data center" />
          <FeatureGrid features={f.how} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow="Results"
            title={
              <>
                From 186 seconds a token to <em>about four</em>.
              </>
            }
            sub="Measured on one RTX 5060 Ti 16 GB with the checkpoint on a Samsung T7 SSD. From v0.8 on, every number is a median of repeated fresh runs with identical token ids."
          />
          <figure className="frustum-chart reveal">
            <img src="/img/frustum-progress.webp" alt="Bar chart: DeepSeek V4.1 Flash seconds per token fell from 186.3 s in v0.3.8 to 8.0 s in v0.5.1" loading="lazy" />
            <figcaption>
              Whitepaper Figure 1. v0.8 then took decode from 5.69 to 4.06 s/token with unbuffered reads.
            </figcaption>
          </figure>
          <div className="model-table reveal">
            {f.models.map(m => (
              <div key={m.name} className="model-row">
                <b>{m.name}</b>
                <span>{m.size}</span>
                <span className="model-row__result">{m.result}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap shot-band reveal">
          <div>
            <p className="eyebrow">ActivatePrime</p>
            <h2>A desktop chat app on top.</h2>
            <p>
              ActivatePrime, a local model workbench, runs every Frustum backend with a live run inspector: load, prefill and
              decode progress, layer by layer, and exactly how much of the model sits in VRAM, RAM and on the SSD.
            </p>
          </div>
          <img src="/img/frustum-deepseek-chat.webp" alt="DeepSeek V4.1 Flash replying in ActivatePrime: running on consumer hardware, no data center required" loading="lazy" />
        </div>
      </section>

      <section id="whitepaper" className="section paper">
        <div className="wrap paper__inner">
          <a className="paper__cover reveal" href={f.paper} target="_blank" rel="noreferrer">
            <img src="/img/frustum-whitepaper-cover.webp" alt="First page of the Frustum_loader technical whitepaper, version 0.11.0" loading="lazy" />
          </a>
          <div className="paper__copy">
            <p className="eyebrow">The white paper</p>
            <h2>Frustum_loader technical whitepaper</h2>
            <p className="paper__meta">
              Version {f.paperVersion} · {f.paperDate} · {f.paperPages} pages · PDF
            </p>
            <p>
              The full engineering record: design, numerical validation, every benchmark from the first six tokens to Qwen3-Next
              80B, the ideas that measured slower and were turned off, and how to reproduce it all.
            </p>
            <ol className="paper__toc">
              {f.contents.map(c => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <div className="hero__actions">
              <a className="btn btn--accent btn--lg" href={f.paper} target="_blank" rel="noreferrer">
                Read the white paper (PDF)
              </a>
              <a className="btn btn--ghost btn--lg" href={f.paper} download>
                Download
              </a>
            </div>
            <p className="paper__fine">
              Earlier editions are on <a href={f.archive} target="_blank" rel="noreferrer">GitHub</a>. Experimental engineering report; not peer reviewed.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap frustum-honest">
          <div>
            <p className="eyebrow">Honest limits</p>
            <h2>What is not proven yet</h2>
          </div>
          <ul className="checks checks--muted">
            {f.limits.map(l => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="frustum-credits">{f.credits}</p>
        </div>
      </section>

      <InvestorBand />
    </Shell>
  )
}

/* ───────────────────────── ChronoSoul ───────────────────────── */

export function ChronoSoulPage() {
  const f = FEATURED_RESEARCH
  const c = CHRONOSOUL
  return (
    <Shell page="chronosoul">
      <section className="hero hero--product hero--chronosoul">
        <div className="hero__bg" aria-hidden />
        <div className="wrap hero__split">
          <div className="hero__copy">
            <p className="eyebrow">Research · ChronoSoul · open source</p>
            <h1>
              A mind that keeps running <em>between messages</em>.
            </h1>
            <p className="hero__lede">
              Every chatbot you have used is a cold start: it exists only when a message arrives and vanishes when it replies.
              ChronoSoul gives an AI a continuous emotional and memory life that keeps moving whether you are talking or not.
            </p>
            <div className="hero__actions">
              <a className="btn btn--accent btn--lg" href={f.colab} target="_blank" rel="noreferrer">
                Run it in Colab
              </a>
              <a className="btn btn--ghost btn--lg" href={f.href} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </div>
            <a className="xerj-badge" href={f.xerj} target="_blank" rel="noreferrer">
              <span className="xerj-badge__mark" aria-hidden>
                ✦
              </span>
              <span>
                <b>Contributed to the Xerj Hub corpus</b>
                <small>hub.xerj.org · view the entry ↗</small>
              </span>
            </a>
          </div>
          <figure className="hero__shot">
            <img src={f.image} alt="ChronoSoul: a glowing mind suspended in a glass chamber surrounded by drifting memories" />
          </figure>
        </div>
        <div className="wrap">
          <dl className="stats">
            {c.stats.map(s => (
              <div key={s.k}>
                <dt>{s.v}</dt>
                <dd>{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="wrap frustum-why">
          <div>
            <p className="eyebrow">The idea</p>
            <h2>AI shouldn’t freeze between turns.</h2>
          </div>
          <p>
            People don’t stop existing when the conversation pauses. We drift, remember, forget and feel time pass. ChronoSoul
            runs a living substrate in the background, with a mood, memories and a sense of time, and lets the model speak from
            inside it. The result is an AI that picks up where you left off, because in a real sense it never left.
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap">
          <SectionHead eyebrow="What it does" title="Continuity, built in" />
          <FeatureGrid features={c.how} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow="Mood steering"
            title={
              <>
                Same question. <em>Different mood.</em>
              </>
            }
            sub={c.steering.caption}
          />
          <div className="model-table reveal">
            {c.steering.rows.map(r => (
              <div key={r.mood} className="model-row model-row--two">
                <b>{r.mood}</b>
                <span className="model-row__result">{r.reply}</span>
              </div>
            ))}
          </div>
          <p className="compare__foot">
            “How has your day been?” with mood steering at the default strength. The full evaluation, including how fluency
            changes, is in the repository.
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="wrap shot-band reveal">
          <div>
            <p className="eyebrow">Where it lives on</p>
            <h2>The heartbeat behind our companions.</h2>
            <p>
              The same idea runs through BostonAI’s products. DinoClaw’s Temporal Continuity lets DinoBuddy wake up carrying
              how things have been going, instead of booting fresh every time. ChronoSoul is where that thinking started.
            </p>
            <div className="hero__actions">
              <a className="btn btn--ghost" href="/dinoclaw/">
                Meet DinoBuddy
              </a>
            </div>
          </div>
          <img src="/img/dinobuddy.webp" alt="DinoBuddy, BostonAI's 3D dinosaur companion" loading="lazy" />
        </div>
      </section>

      <section className="section">
        <div className="wrap frustum-honest">
          <div>
            <p className="eyebrow">Open source</p>
            <h2>Try it yourself</h2>
          </div>
          <ul className="checks checks--muted">
            <li>One-click Google Colab notebook, no setup required.</li>
            <li>A desktop “chamber” app, with 20 voice providers or fully local models from 1.5B to 14B parameters.</li>
            <li>Keys stay on your machine and are never sent back to the interface.</li>
            <li>Released under the GPL-3.0 license.</li>
          </ul>
          <div className="hero__actions">
            <a className="btn btn--accent btn--lg" href={f.colab} target="_blank" rel="noreferrer">
              Open in Colab
            </a>
            <a className="btn btn--ghost btn--lg" href={f.xerj} target="_blank" rel="noreferrer">
              See it on Xerj Hub
            </a>
          </div>
        </div>
      </section>

      <InvestorBand />
    </Shell>
  )
}
