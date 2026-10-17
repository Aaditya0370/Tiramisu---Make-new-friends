import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { navigateTo } from '../lib/utils'

export function AuthPage({ mode: _mode }: { mode?: string }) {
  const { signIn, signInGuest } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      return setError('Enter a valid email address.')
    }
    if (password.length < 6) {
      return setError('Use a password with at least 6 characters.')
    }
    setBusy(true)
    const result = await signIn(email.trim(), password)
    setBusy(false)
    if (result.error) setError(result.error)
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
      {/* Buffer Space / Editorial Side Panel: Cream Brown Background */}
      <div
        className="auth-art auth-art-minimal"
        style={{
          background: '#f6efe6', // Cream brown background
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 7vw',
          borderRight: '1px solid #e8dbce',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '440px' }}>
          <h1
            style={{
              fontSize: 'clamp(42px, 5.2vw, 64px)',
              fontWeight: 900,
              color: '#654321', // Dark cocoa brown
              letterSpacing: '-0.04em',
              margin: '0 0 10px 0',
              lineHeight: 1,
            }}
          >
            Tiramisu
          </h1>
          <p
            style={{
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              fontWeight: 700,
              color: '#82664c',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Connect Play Meet
          </p>
        </div>
      </div>

      {/* Right Column: Generous buffer spacing with pristine login form */}
      <main
        className="auth-card-wrap"
        style={{
          background: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          padding: '40px 6vw',
        }}
      >
        <div className="auth-card" style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#654321',
                letterSpacing: '-0.03em',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Log In
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'block' }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '6px',
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
                  borderRadius: 0,
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

            <label style={{ display: 'block' }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '6px',
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
                  borderRadius: 0,
                  background: '#ffffff',
                }}
              >
                <LockKeyhole size={16} style={{ color: '#82664c', flexShrink: 0 }} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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

            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 0,
                  fontSize: '12px',
                  color: '#8e3d29',
                  background: '#fdf5f2',
                  border: '1px solid rgba(142,61,41,0.25)',
                }}
              >
                {error}
              </div>
            )}

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
                borderRadius: 0,
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
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          {/* Guest mode button without logo */}
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleGuestMode}
              style={{
                width: '100%',
                minHeight: '44px',
                background: '#ffffff',
                color: '#654321',
                border: '1px solid #C4A484',
                borderRadius: 0,
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
              Guest mode
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
