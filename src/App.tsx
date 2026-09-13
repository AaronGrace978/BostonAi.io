import { useCallback, useEffect, useState } from 'react'
import { LabHome } from './components/LabHome'
import { Workbench } from './Workbench'

type View = 'lab' | 'console'

function readView(): View {
  const h = window.location.hash.replace(/^#/, '')
  if (h === 'console' || h === '/console') return 'console'
  return 'lab'
}

export default function App() {
  const [view, setView] = useState<View>(readView)

  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.body.dataset.view = view
  }, [view])

  const goConsole = useCallback(() => {
    window.location.hash = 'console'
    setView('console')
  }, [])

  const goLab = useCallback(() => {
    window.location.hash = ''
    setView('lab')
  }, [])

  if (view === 'console') return <Workbench onBackToLab={goLab} />
  return <LabHome onEnterConsole={goConsole} />
}
