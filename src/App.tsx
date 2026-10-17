import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AuthPage } from './pages/AuthPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { JoyPage } from './pages/JoyPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProfilePage } from './pages/ProfilePage'
import { useAuth } from './lib/AuthContext'
import { navigateTo } from './lib/utils'

const publicPaths = ['/login', '/signup', '/forgot-password']
const appPaths = ['/discover', '/messages', '/joy', '/profile']
const readDemoMode = () =>
  sessionStorage.getItem('tiramisu-demo-mode') === 'true' ||
  sessionStorage.getItem('vibe-demo-mode') === 'true' ||
  new URLSearchParams(window.location.search).get('demo') === '1'

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/discover')
  const [demoMode, setDemoMode] = useState(readDemoMode)
  const { user, loading } = useAuth()

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname || '/discover')
      setDemoMode(readDemoMode())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (loading) return
    if (user && (publicPaths.includes(path) || path === '/')) {
      navigateTo('/discover')
    }
    if (!user && !demoMode && !publicPaths.includes(path)) {
      navigateTo('/login')
    }
  }, [demoMode, loading, path, user])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">
          T<span>✦</span>
        </div>
        <p>Finding your way in…</p>
      </div>
    )
  }

  if ((!user && !demoMode) || publicPaths.includes(path)) {
    return (
      <AuthPage
        mode={path === '/signup' ? 'signup' : path === '/forgot-password' ? 'forgot' : 'login'}
      />
    )
  }

  const activePath = appPaths.includes(path) ? path : '/discover'
  const screen =
    activePath === '/messages' ? (
      <MessagesPage />
    ) : activePath === '/joy' ? (
      <JoyPage />
    ) : activePath === '/profile' ? (
      <ProfilePage />
    ) : (
      <DiscoverPage />
    )

  return (
    <AppShell path={activePath} demoMode={demoMode && !user}>
      {screen}
    </AppShell>
  )
}
