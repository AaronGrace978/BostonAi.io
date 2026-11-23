import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

const page = document.body.dataset.page ?? 'home'
const isConsole = page === 'home' && /^#\/?console$/.test(window.location.hash)

// Marketing pages and the builder console use separate global stylesheets, so
// load exactly one and do a full reload when switching between them.
window.addEventListener('hashchange', () => {
  const next = page === 'home' && /^#\/?console$/.test(window.location.hash)
  if (next !== isConsole) window.location.reload()
})

async function boot() {
  let view: ReactNode
  if (page === 'entity') {
    await import('./entity/entity.css')
    const { default: EntityApp } = await import('./entity/EntityApp')
    view = <EntityApp />
  } else if (isConsole) {
    await import('./index.css')
    const { Workbench } = await import('./Workbench')
    view = <Workbench onBackToLab={() => (window.location.hash = '')} />
  } else {
    await import('./site/site.css')
    const { HomePage, WorkBotPage, DinoClawPage, BlogPage, FrustumPage } = await import('./site/pages')
    view =
      page === 'workbot' ? <WorkBotPage /> : page === 'dinoclaw' ? <DinoClawPage /> : page === 'blog' ? <BlogPage /> : page === 'frustum' ? <FrustumPage /> : <HomePage />
  }
  createRoot(document.getElementById('root')!).render(<StrictMode>{view}</StrictMode>)
}

void boot()
