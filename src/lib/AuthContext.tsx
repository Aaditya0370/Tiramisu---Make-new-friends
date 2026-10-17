import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigMessage, supabaseConfigured } from './supabase'

type AuthResult = { error?: string; message?: string }

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  if (/invalid login credentials/i.test(message)) return 'That email or password did not match. Try again or reset your password.'
  if (/already registered|already exists/i.test(message)) return 'That email is already registered. Try logging in instead.'
  if (/password/i.test(message) && /6|characters|short/i.test(message)) return 'Use a password with at least 6 characters.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (!supabase) {
      setLoading(false)
      return () => { mounted = false }
    }
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    }).catch(() => mounted && setLoading(false))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    configured: supabaseConfigured,
    signIn: async (email, password) => {
      if (!supabase) return { error: supabaseConfigMessage }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { error: friendlyError(error) } : {}
    },
    signUp: async (email, password, name) => {
      if (!supabase) return { error: supabaseConfigMessage }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } },
      })
      if (error) return { error: friendlyError(error) }
      if (!data.session) return { message: 'Check your inbox to confirm your email, then come back to Tiramisu.' }
      return { message: 'You are in. Let’s find your people.' }
    },
    resetPassword: async (email) => {
      if (!supabase) return { error: supabaseConfigMessage }
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
      return error ? { error: friendlyError(error) } : { message: 'If that email is registered, a reset link is on its way.' }
    },
    signOut: async () => {
      if (!supabase) return {}
      const { error } = await supabase.auth.signOut()
      return error ? { error: friendlyError(error) } : {}
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
