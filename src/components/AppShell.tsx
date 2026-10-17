import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { Navigation } from './Navigation'
import { useAuth } from '../lib/AuthContext'
import { cn } from '../lib/utils'

export function AppShell({ path, children, demoMode = false }: { path: string; children: ReactNode; demoMode?: boolean }) {
  const { user, profile } = useAuth()
  const isMessages = path === '/messages'
  return (
    <div className={cn('app-frame', isMessages && 'app-frame-messages')}>
      <Navigation path={path} userEmail={user?.email || undefined} userName={profile?.displayName} />
      <main className={cn('app-main', isMessages && 'app-main-fullscreen')}>
        {demoMode && !isMessages && (
          <div className="demo-mode-strip">
            <span><Sparkles size={14} /> Guest demo preview</span>
            <small>Explore the experience freely with real-time features enabled.</small>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

