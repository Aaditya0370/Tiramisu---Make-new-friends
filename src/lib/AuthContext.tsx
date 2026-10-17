import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface SimulatedUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
  emailVerified: boolean
  isAnonymous: boolean
}

export interface UserProfile {
  id: string
  displayName: string
  email?: string
  location?: string
  bio?: string
  avatarUrl?: string
  initials?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  x?: string
  createdAt?: string
  updatedAt?: string
}

type AuthResult = { error?: string; message?: string }

type AuthContextValue = {
  user: SimulatedUser | null
  profile: UserProfile | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInGuest: () => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const LOCAL_USER_KEY = 'tiramisu_simulated_user'
const LOCAL_PROFILE_KEY = 'tiramisu_user_profile'

const DEFAULT_USER: SimulatedUser = {
  uid: 'usr_adi_gamerz',
  displayName: 'Adi Gamerz',
  email: 'adi@tiramisu.club',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_adi_gamerz',
  displayName: 'Adi Gamerz',
  email: 'adi@tiramisu.club',
  location: 'SoHo, New York',
  bio: 'Collecting quiet joys, design experiments, and thoughtful people who make ordinary plans feel worth showing up for.',
  linkedin: 'linkedin.com/in/adigamerz',
  instagram: '@adi.creatives',
  facebook: 'facebook.com/adigamerz',
  x: '@adigamerz',
  initials: 'AG',
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: new Date().toISOString(),
}

function getStoredUser(): SimulatedUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY)
    if (raw) return JSON.parse(raw) as SimulatedUser
  } catch (e) {
    console.warn('Failed to parse local user:', e)
  }
  return null
}

function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch (e) {
    console.warn('Failed to parse local profile:', e)
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // If no user in storage yet, default to active test user so the app is immediately alive
  const [user, setUser] = useState<SimulatedUser | null>(() => {
    const stored = getStoredUser()
    if (stored) return stored
    // Check if user explicitly logged out previously
    if (sessionStorage.getItem('tiramisu_logged_out') === 'true') {
      return null
    }
    // Default active user
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_USER))
    return DEFAULT_USER
  })

  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = getStoredProfile()
    if (stored) return stored
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE))
    return DEFAULT_PROFILE
  })

  const [loading, setLoading] = useState(false)

  // Sync profile when user changes
  useEffect(() => {
    if (user && (!profile || profile.id !== user.uid)) {
      const stored = getStoredProfile()
      if (stored && stored.id === user.uid) {
        setProfile(stored)
      } else {
        const fallbackName = user.displayName || (user.email ? user.email.split('@')[0] : 'Tiramisu Friend')
        const newProf: UserProfile = {
          id: user.uid,
          displayName: fallbackName,
          email: user.email || '',
          location: 'SoHo, New York',
          bio: 'Exploring cozy local coffee spots, art exhibits, and low-pressure hangs.',
          initials: fallbackName.slice(0, 2).toUpperCase(),
          linkedin: 'linkedin.com/in/' + fallbackName.toLowerCase().replace(/\s+/g, ''),
          instagram: '@' + fallbackName.toLowerCase().replace(/\s+/g, ''),
          facebook: 'facebook.com/' + fallbackName.toLowerCase().replace(/\s+/g, ''),
          x: '@' + fallbackName.toLowerCase().replace(/\s+/g, ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setProfile(newProf)
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProf))
      }
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured: true,

      signIn: async (email: string, password: string) => {
        setLoading(true)
        // Realistic simulated latency (350ms)
        await new Promise((r) => setTimeout(r, 350))
        setLoading(false)

        if (!email || !email.includes('@')) {
          return { error: 'Please enter a valid email address.' }
        }
        if (!password || password.length < 4) {
          return { error: 'Please enter your password.' }
        }

        const namePart = email.split('@')[0]
        const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1)

        const simUser: SimulatedUser = {
          uid: 'usr_' + Math.abs(hashString(email)).toString(36),
          email,
          displayName: cleanName,
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
        }

        const simProfile: UserProfile = {
          id: simUser.uid,
          displayName: cleanName,
          email,
          location: 'SoHo, New York',
          bio: 'Always happy to grab a matcha latte or browse a local bookstore.',
          initials: cleanName.slice(0, 2).toUpperCase(),
          linkedin: `linkedin.com/in/${cleanName.toLowerCase()}`,
          instagram: `@${cleanName.toLowerCase()}`,
          facebook: `facebook.com/${cleanName.toLowerCase()}`,
          x: `@${cleanName.toLowerCase()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        sessionStorage.removeItem('tiramisu_logged_out')
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(simUser))
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(simProfile))
        setUser(simUser)
        setProfile(simProfile)
        return {}
      },

      signUp: async (email: string, password: string, displayName?: string) => {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 400))
        setLoading(false)

        if (!email || !email.includes('@')) {
          return { error: 'Please enter a valid email address.' }
        }
        if (!password || password.length < 6) {
          return { error: 'Password must be at least 6 characters.' }
        }

        const finalName = displayName?.trim() || email.split('@')[0]
        const simUser: SimulatedUser = {
          uid: 'usr_' + Date.now().toString(36),
          email,
          displayName: finalName,
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
        }

        const simProfile: UserProfile = {
          id: simUser.uid,
          displayName: finalName,
          email,
          location: 'SoHo, New York',
          bio: 'Excited to discover new favorite people and low-pressure neighborhood plans on Tiramisu.',
          initials: finalName.slice(0, 2).toUpperCase(),
          linkedin: `linkedin.com/in/${finalName.toLowerCase().replace(/\s+/g, '')}`,
          instagram: `@${finalName.toLowerCase().replace(/\s+/g, '')}`,
          facebook: `facebook.com/${finalName.toLowerCase().replace(/\s+/g, '')}`,
          x: `@${finalName.toLowerCase().replace(/\s+/g, '')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        sessionStorage.removeItem('tiramisu_logged_out')
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(simUser))
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(simProfile))
        setUser(simUser)
        setProfile(simProfile)
        return {}
      },

      signInWithGoogle: async () => {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 500))
        setLoading(false)

        const simUser: SimulatedUser = {
          uid: 'usr_google_rivera',
          email: 'alex.rivera@gmail.com',
          displayName: 'Alex Rivera',
          photoURL: null,
          emailVerified: true,
          isAnonymous: false,
        }

        const simProfile: UserProfile = {
          id: simUser.uid,
          displayName: 'Alex Rivera',
          email: 'alex.rivera@gmail.com',
          location: 'SoHo, New York',
          bio: 'Photographer and neighborhood explorer. Catch me reading in Washington Square or sampling bakeries.',
          initials: 'AR',
          linkedin: 'linkedin.com/in/alexrivera',
          instagram: '@alex.explores',
          facebook: 'facebook.com/alexrivera',
          x: '@alexrivera',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        sessionStorage.removeItem('tiramisu_logged_out')
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(simUser))
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(simProfile))
        setUser(simUser)
        setProfile(simProfile)
        return {}
      },

      signInGuest: async () => {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 200))
        setLoading(false)

        const simUser: SimulatedUser = {
          uid: 'usr_guest_' + Date.now().toString(36),
          email: null,
          displayName: 'Guest Explorer',
          photoURL: null,
          emailVerified: false,
          isAnonymous: true,
        }

        const simProfile: UserProfile = {
          id: simUser.uid,
          displayName: 'Guest Explorer',
          email: '',
          location: 'SoHo, New York',
          bio: 'Checking out Tiramisu neighborhood discovery & conversations.',
          initials: 'GE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        sessionStorage.removeItem('tiramisu_logged_out')
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(simUser))
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(simProfile))
        setUser(simUser)
        setProfile(simProfile)
        return {}
      },

      signOut: async () => {
        sessionStorage.setItem('tiramisu_logged_out', 'true')
        sessionStorage.removeItem('tiramisu-demo-mode')
        localStorage.removeItem(LOCAL_USER_KEY)
        setUser(null)
        return {}
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        setProfile((prev) => {
          const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next))
          return next
        })
      },
    }),
    [loading, profile, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
