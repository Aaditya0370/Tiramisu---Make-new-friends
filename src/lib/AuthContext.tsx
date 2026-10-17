import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as fbSignOut,
  type User
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, handleFirestoreError, OperationType } from './firebase'

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
  user: User | null
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

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'An error occurred. Please try again.'
  if (/user-not-found|wrong-password|invalid-credential/i.test(message)) {
    return 'Invalid email or password. Please try again.'
  }
  if (/email-already-in-use/i.test(message)) {
    return 'That email is already registered. Try logging in.'
  }
  if (/weak-password/i.test(message)) {
    return 'Password should be at least 6 characters.'
  }
  if (/popup-closed-by-user/i.test(message)) {
    return 'Sign-in popup closed before completing.'
  }
  return message
}

const LOCAL_PROFILE_KEY = 'tiramisu_user_profile'

function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch (e) {
    console.warn('Failed to parse local profile:', e)
  }
  return null
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-local-user',
  displayName: 'Adi Gamerz',
  email: 'adi@tiramisu.club',
  location: 'New York, NY',
  bio: 'Collecting quiet joys, design experiments, and thoughtful people who make ordinary plans feel worth showing up for.',
  linkedin: 'linkedin.com/in/adigamerz',
  instagram: '@adi.creatives',
  facebook: 'facebook.com/adigamerz',
  x: '@adigamerz',
  initials: 'AG',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile() || DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid)
        const path = `users/${currentUser.uid}`

        // Listen to profile changes in real time
        unsubscribeProfile = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const remoteProfile = snapshot.data() as UserProfile
              setProfile(remoteProfile)
              localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(remoteProfile))
            } else {
              // Create initial profile
              const fallbackName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Guest Friend')
              const initialProfile: UserProfile = {
                id: currentUser.uid,
                displayName: fallbackName,
                email: currentUser.email || '',
                location: 'New York, NY',
                bio: 'Collecting quiet joys, design experiments, and thoughtful people who make ordinary plans feel worth showing up for.',
                linkedin: 'linkedin.com/in/tiramisu',
                instagram: '@tiramisu.club',
                facebook: 'facebook.com/tiramisu',
                x: '@tiramisu_social',
                initials: fallbackName.slice(0, 2).toUpperCase(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              try {
                await setDoc(userDocRef, initialProfile)
                setProfile(initialProfile)
                localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(initialProfile))
              } catch (err) {
                console.warn('Initial profile creation note:', err)
              }
            }
            setLoading(false)
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, path)
            setLoading(false)
          }
        )
      } else {
        // In guest or local mode, keep stored profile
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured: true,
      signIn: async (email, password) => {
        try {
          await signInWithEmailAndPassword(auth, email, password)
          return {}
        } catch (err: unknown) {
          // If user not found, try creating account automatically for smooth UX
          const errMsg = err instanceof Error ? err.message : ''
          if (/user-not-found|invalid-credential/i.test(errMsg)) {
            try {
              await createUserWithEmailAndPassword(auth, email, password)
              return {}
            } catch (createErr) {
              return { error: friendlyError(createErr) }
            }
          }
          return { error: friendlyError(err) }
        }
      },
      signUp: async (email, password, displayName) => {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          const fallbackName = (displayName && displayName.trim()) || email.split('@')[0]
          const newProfileData: UserProfile = {
            id: cred.user?.uid || 'user-' + Date.now(),
            displayName: fallbackName,
            email: email,
            location: 'New York, NY',
            bio: 'Connecting, exploring neighborhoods, and making real-world memories with new friends on Tiramisu.',
            initials: fallbackName.slice(0, 2).toUpperCase(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setProfile(newProfileData)
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProfileData))

          if (cred.user) {
            const userDocRef = doc(db, 'users', cred.user.uid)
            await setDoc(userDocRef, newProfileData, { merge: true })
          }
          return {}
        } catch (err) {
          return { error: friendlyError(err) }
        }
      },
      signInWithGoogle: async () => {
        try {
          const provider = new GoogleAuthProvider()
          await signInWithPopup(auth, provider)
          return {}
        } catch (err) {
          return { error: friendlyError(err) }
        }
      },
      signInGuest: async () => {
        try {
          await signInAnonymously(auth)
          return {}
        } catch (err) {
          return { error: friendlyError(err) }
        }
      },
      signOut: async () => {
        try {
          await fbSignOut(auth)
          return {}
        } catch (err) {
          return { error: friendlyError(err) }
        }
      },
      updateProfile: async (updates: Partial<UserProfile>) => {
        setProfile((prev) => {
          const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next))
          return next
        })
        if (!auth.currentUser) return
        const path = `users/${auth.currentUser.uid}`
        try {
          const userDocRef = doc(db, 'users', auth.currentUser.uid)
          const merged = {
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          await setDoc(userDocRef, merged, { merge: true })
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, path)
        }
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
