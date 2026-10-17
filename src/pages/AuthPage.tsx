import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, User as UserIcon, Sparkles } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { navigateTo } from '../lib/utils'

export function AuthPage({ mode = 'login' }: { mode?: string }) {
  const { signIn, signUp, signInGuest } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(
    mode === 'signup' ? 'signup' : 'login'
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return setError('Enter a valid email address.')
    }
    if (password.length < 6) {
      return setError('Use a password with at least 6 characters.')
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        return setError('Please enter your name or nickname.')
      }
      if (password !== confirmPassword) {
        return setError('Passwords do not match.')
      }
      setBusy(true)
      const result = await signUp(cleanEmail, password, name.trim())
      setBusy(false)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Account created! Welcome to Tiramisu.')
        sessionStorage.setItem('tiramisu-demo-mode', 'true')
        window.setTimeout(() => navigateTo('/discover'), 600)
      }
    } else {
      setBusy(true)
      const result = await signIn(cleanEmail, password)
      setBusy(false)
      if (result.error) {
        setError(result.error)
      } else {
        sessionStorage.setItem('tiramisu-demo-mode', 'true')
        navigateTo('/discover')
      }
    }
  }

  async function handleGuestMode() {
    sessionStorage.setItem('tiramisu-demo-mode', 'true')
    try {
      await signInGuest()
    } catch {
      // Allow guest demo navigation
    }
    navigateTo('/discover?demo=1')
  }

  return (
    <div className="auth-page">
      {/* Left Column / Editorial Side Panel: Warm Cream Brown */}
      <div
        className="auth-art auth-art-minimal"
        style={{
          background: '#f6efe6',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 7vw',
          borderRight: '1px solid #e8dbce',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '440px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '99px',
              background: 'rgba(101, 67, 33, 0.08)',
              color: '#654321',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <Sparkles size={12} />
            <span>Low-pressure social club</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 5.2vw, 64px)',
              fontWeight: 900,
              color: '#654321',
              letterSpacing: '-0.04em',
              margin: '0 0 12px 0',
              lineHeight: 1,
            }}
          >
            Tiramisu
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: '#82664c',
              lineHeight: 1.5,
              margin: '0 0 24px',
            }}
          >
            A calm, low-pressure way to discover neighborhood friends, play quick games, and meet
            your next favorite person.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#654321',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <span>✦ Discovery</span>
            <span>✦ 4 Bot Games</span>
            <span>✦ Real-Time Chat</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Card with Login & Create Account */}
      <main
        className="auth-card-wrap"
        style={{
          background: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          padding: '40px 6vw',
        }}
      >
        <div className="auth-card" style={{ width: '100%', maxWidth: '390px' }}>
          {/* Auth Mode Segmented Control: Log In / Create Account */}
          <div
            style={{
              display: 'flex',
              background: '#f4ede4',
              borderRadius: '8px',
              padding: '3px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setError('')
                setSuccess('')
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                background: authMode === 'login' ? '#654321' : 'transparent',
                color: authMode === 'login' ? '#ffffff' : '#654321',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup')
                setError('')
                setSuccess('')
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '6px',
                background: authMode === 'signup' ? '#654321' : 'transparent',
                color: authMode === 'signup' ? '#ffffff' : '#654321',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#654321',
                letterSpacing: '-0.03em',
                margin: '0 0 4px',
                lineHeight: 1.2,
              }}
            >
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#82664c' }}>
              {authMode === 'signup'
                ? 'Join Tiramisu and start meeting friendly neighbors'
                : 'Enter your credentials to access your conversations'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            {/* Name Field (Only for Signup) */}
            {authMode === 'signup' && (
              <label style={{ display: 'block' }}>
                <span
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#654321',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Your Name or Nickname
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '44px',
                    padding: '0 12px',
                    border: '1px solid #C4A484',
                    background: '#ffffff',
                  }}
                >
                  <UserIcon size={16} style={{ color: '#82664c', flexShrink: 0 }} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    type="text"
                    autoComplete="name"
                    style={{
                      flex: 1,
                      border: 0,
                      outline: 0,
                      color: '#654321',
                      background: 'transparent',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </label>
            )}

            {/* Email Field */}
            <label style={{ display: 'block' }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#654321',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Email address
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minHeight: '44px',
                  padding: '0 12px',
                  border: '1px solid #C4A484',
                  background: '#ffffff',
                }}
              >
                <Mail size={16} style={{ color: '#82664c', flexShrink: 0 }} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  style={{
                    flex: 1,
                    border: 0,
                    outline: 0,
                    color: '#654321',
                    background: 'transparent',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </label>

            {/* Password Field */}
            <label style={{ display: 'block' }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#654321',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Password
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minHeight: '44px',
                  padding: '0 12px',
                  border: '1px solid #C4A484',
                  background: '#ffffff',
                }}
              >
                <LockKeyhole size={16} style={{ color: '#82664c', flexShrink: 0 }} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'signup' ? 'Min 6 characters' : 'Enter password'}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  style={{
                    flex: 1,
                    border: 0,
                    outline: 0,
                    color: '#654321',
                    background: 'transparent',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: '#82664c',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '2px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {/* Confirm Password Field (Only for Signup) */}
            {authMode === 'signup' && (
              <label style={{ display: 'block' }}>
                <span
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    color: '#654321',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Confirm Password
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '44px',
                    padding: '0 12px',
                    border: '1px solid #C4A484',
                    background: '#ffffff',
                  }}
                >
                  <LockKeyhole size={16} style={{ color: '#82664c', flexShrink: 0 }} />
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    style={{
                      flex: 1,
                      border: 0,
                      outline: 0,
                      color: '#654321',
                      background: 'transparent',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </label>
            )}

            {/* Error banner */}
            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#8e3d29',
                  background: '#fdf5f2',
                  border: '1px solid rgba(142,61,41,0.25)',
                }}
              >
                {error}
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div
                style={{
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#15803d',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                }}
              >
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                minHeight: '44px',
                marginTop: '4px',
                background: '#654321',
                color: '#ffffff',
                border: '1px solid #654321',
                fontSize: '13px',
                fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!busy) e.currentTarget.style.background = '#4e3215'
              }}
              onMouseLeave={(e) => {
                if (!busy) e.currentTarget.style.background = '#654321'
              }}
            >
              {busy
                ? authMode === 'signup'
                  ? 'Creating account…'
                  : 'Logging in…'
                : authMode === 'signup'
                ? 'Create Account'
                : 'Log In'}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
                setError('')
                setSuccess('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#654321',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {authMode === 'login'
                ? "Don't have an account? Create one"
                : 'Already have an account? Log in'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '18px 0',
              color: '#c4a484',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#ebd9c8' }} />
            <span>or explore</span>
            <div style={{ flex: 1, height: '1px', background: '#ebd9c8' }} />
          </div>

          {/* Guest mode button */}
          <div>
            <button
              type="button"
              onClick={handleGuestMode}
              style={{
                width: '100%',
                minHeight: '44px',
                background: '#ffffff',
                color: '#654321',
                border: '1px solid #C4A484',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fcfaf7'
                e.currentTarget.style.borderColor = '#654321'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#C4A484'
              }}
            >
              Continue in Guest Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
