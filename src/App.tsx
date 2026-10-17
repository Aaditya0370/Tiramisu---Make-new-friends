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
const readDemoMode = () => sessionStorage.getItem('tiramisu-demo-mode') === 'true' || sessionStorage.getItem('vibe-demo-mode') === 'true' || new URLSearchParams(window.location.search).get('demo') === '1'

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/discover')
  const [demoMode, setDemoMode] = useState(readDemoMode)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true)
    window.addEventListener('gmp-quota-exceeded', onQuota)
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota)
  }, [])

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
    if (user && (publicPaths.includes(path) || path === '/')) navigateTo('/discover')
    if (!user && !demoMode && !publicPaths.includes(path)) navigateTo('/login')
  }, [demoMode, loading, path, user])

  if (loading) return <div className="loading-screen"><div className="loading-mark">T<span>✦</span></div><p>Finding your way in…</p></div>
  if ((!user && !demoMode) || publicPaths.includes(path)) return <AuthPage mode={path === '/signup' ? 'signup' : path === '/forgot-password' ? 'forgot' : 'login'} />

  const activePath = appPaths.includes(path) ? path : '/discover'
  const screen = activePath === '/messages' ? <MessagesPage /> : activePath === '/joy' ? <JoyPage /> : activePath === '/profile' ? <ProfilePage /> : <DiscoverPage />
  return (
    <>
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <AppShell path={activePath} demoMode={demoMode && !user}>{screen}</AppShell>
    </>
  )
}
