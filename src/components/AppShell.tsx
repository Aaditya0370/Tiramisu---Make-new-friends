import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { Navigation } from './Navigation'
import { useAuth } from '../lib/AuthContext'

export function AppShell({ path, children, demoMode = false }: { path: string; children: ReactNode; demoMode?: boolean }) {
  const { user } = useAuth()
  return <div className="app-frame"><Navigation path={path} userEmail={user?.email} /><main className="app-main">{demoMode && <div className="demo-mode-strip"><span><Sparkles size={14} /> Read-only demo mode</span><small>Explore the experience freely. Supabase account actions stay disabled until you connect your project.</small></div>}{children}</main></div>
}
