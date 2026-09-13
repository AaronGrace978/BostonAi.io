import { ABILITIES, BAYS, PROFILE, SIGNALS } from '../data/portfolio'

function LabParticles() {
  return (
    <>
      <div className="lab-grid" aria-hidden />
      <div className="lab-glow" aria-hidden />
    </>
  )
}

export function LabHome({ onEnterConsole }: { onEnterConsole: () => void }) {
  return (
    <div className="lab">
      <LabParticles />

      <header className="lab-bar">
        <div className="lab-bar__left">
          <div className="lab-mark" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div>
            <div className="lab-bar__facility">BOSTONAI LABORATORY</div>
            <div className="lab-bar__unit">
              UNIT 01 · {PROFILE.org} · <em>{PROFILE.name}</em>
            </div>
          </div>
        </div>
        <nav className="lab-bar__nav">
          <a href="#bays">Catalog</a>
          <a href="#abilities">Capabilities</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <button type="button" className="btn btn--primary lab-bar__cta" onClick={onEnterConsole}>
            Open console
          </button>
        </nav>
      </header>

      <main className="lab-main">
        <section className="lab-hero">
          <p className="lab-kicker">
            <span className="status-dot on" />
            LAB LIVE · {PROFILE.status}
          </p>
          <h1>
            An AI lab for honest builds.
            <span> Not a brochure. A working bench.</span>
          </h1>
          <p className="lab-lede">{PROFILE.summary}</p>
          <p className="lab-seeking">
            Seeking: {PROFILE.seeking}. Community: {PROFILE.community.label}.
          </p>
          <div className="lab-actions">
            <button type="button" className="btn btn--primary" onClick={onEnterConsole}>
              Enter the coding console
            </button>
            <a className="btn btn--ghost" href={PROFILE.github} target="_blank" rel="noreferrer">
              Scan all public repos
            </a>
            <a className="btn" href={PROFILE.community.href} target="_blank" rel="noreferrer">
              Cursor Boston
            </a>
          </div>
          <dl className="lab-signals">
            {SIGNALS.map(s => (
              <div key={s.k} className="lab-signal">
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="abilities" className="lab-section">
          <header className="lab-section__head">
            <span className="bay__label">Capability matrix</span>
            <span className="bay__sub">What this lab actually ships</span>
          </header>
          <div className="ability-grid">
            {ABILITIES.map(a => (
              <article key={a.code} className="ability">
                <div className="ability__code">{a.code}</div>
                <h2>{a.title}</h2>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="bays" className="lab-section">
          <header className="lab-section__head">
            <span className="bay__label">Specimen catalog</span>
            <span className="bay__sub">Drawn from github.com/{PROFILE.handle} — public work only</span>
          </header>
          {BAYS.map(bay => (
            <article key={bay.id} className="specimen-bay">
              <div className="specimen-bay__meta">
                <span className="specimen-bay__code">{bay.code}</span>
                <h2>{bay.title}</h2>
                <p>{bay.thesis}</p>
              </div>
              <div className="specimen-grid">
                {bay.specimens.map(s => (
                  <a key={s.name} className="specimen" href={s.href} target="_blank" rel="noreferrer">
                    <div className="specimen__top">
                      <span className="specimen__lang">{s.lang}</span>
                      <span className="specimen__arrow" aria-hidden>
                        ↗
                      </span>
                    </div>
                    <h3>{s.name}</h3>
                    <p>{s.blurb}</p>
                    <ul>
                      {s.tags.map(t => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="lab-section lab-close">
          <header className="lab-section__head">
            <span className="bay__label">Run a trial</span>
            <span className="bay__sub">Keys stay in this tab · sandbox preview</span>
          </header>
          <div className="lab-close__panel">
            <div>
              <h2>The console is the lab equipment.</h2>
              <p>
                Paste a key, name a goal, watch files and diffs appear. Same discipline as the rest of
                the catalog: honest finish, no fake “already done.”
              </p>
            </div>
            <button type="button" className="btn btn--primary" onClick={onEnterConsole}>
              Open Night Harbor console
            </button>
          </div>
        </section>
      </main>

      <footer className="lab-foot">
        <span>
          {PROFILE.name} · {PROFILE.org}
        </span>
        <a href="mailto:aarongrace978@gmail.com">aarongrace978@gmail.com</a>
        <a href="/almanac/">Almanac · old harbor</a>
      </footer>
    </div>
  )
}
