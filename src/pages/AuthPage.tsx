import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import { BrandMark } from '../components/Brand'
import { PrimaryButton } from '../components/UI'
import { useAuth } from '../lib/AuthContext'
import { supabaseConfigMessage } from '../lib/supabase'
import { navigateTo } from '../lib/utils'

type AuthMode = 'login' | 'signup' | 'forgot'

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { configured, signIn, signUp, resetPassword } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'
  const title = isForgot ? 'A fresh start is close.' : isSignup ? 'Make room for new people.' : 'Come find your people.'
  const subcopy = isForgot ? 'Enter your email and we’ll send a gentle nudge back in.' : isSignup ? 'Create your Tiramisu account and make your social orbit a little brighter.' : 'The low-pressure way to meet someone who gets it.'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!email.trim() || !email.includes('@')) return setError('Enter a valid email address.')
    if (!isForgot && password.length < 6) return setError('Use a password with at least 6 characters.')
    if (isSignup && name.trim().length < 2) return setError('Tell us your name so people know who they’re meeting.')
    setBusy(true)
    const result = isForgot ? await resetPassword(email.trim()) : isSignup ? await signUp(email.trim(), password, name.trim()) : await signIn(email.trim(), password)
    setBusy(false)
    if (result.error) setError(result.error)
    if (result.message) setNotice(result.message)
  }

  return <div className="auth-page">
    <div className="auth-art" aria-hidden="true"><div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><div className="auth-grid" /><div className="auth-art-copy"><span className="auth-art-kicker"><Sparkles size={14} /> A little more human</span><h2>Good conversations are closer than you think.</h2><p>Find your kind of curious, one low-pressure hello at a time.</p><div className="auth-quote"><span>“</span><p>The best plans are the ones you almost didn’t make.</p><small>— a very good friend</small></div></div><div className="auth-art-footer"><span className="tiny-pulse" /> Real people. Fictional map pins. Better hellos.</div></div>
    <main className="auth-card-wrap"><div className="auth-card">
      <div className="auth-brand"><BrandMark /></div>
      <div className="auth-header"><div className="eyebrow"><Sparkles size={13} /> Find your people</div><h1>{title}</h1><p>{subcopy}</p></div>
      {!configured && <div className="config-callout"><div className="config-icon"><LockKeyhole size={17} /></div><div><strong>Supabase is not connected yet</strong><p>{supabaseConfigMessage}</p></div></div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignup && <label className="field"><span>Your name</span><div className="input-wrap"><UserRound size={17} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" autoComplete="name" /></div></label>}
        <label className="field"><span>Email address</span><div className="input-wrap"><Mail size={17} /><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></div></label>
        {!isForgot && <label className="field"><span>Password</span><div className="input-wrap"><LockKeyhole size={17} /><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} /><button type="button" className="input-action" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
        {error && <div className="form-message form-error">{error}</div>}
        {notice && <div className="form-message form-success">{notice}</div>}
        <PrimaryButton type="submit" loading={busy} className="auth-submit">{isForgot ? 'Send reset link' : isSignup ? 'Create my account' : 'Log in to Tiramisu'}</PrimaryButton>
      </form>
      <div className="auth-links">{mode === 'login' && <button onClick={() => navigateTo('/forgot-password')}>Forgot your password?</button>}<button onClick={() => navigateTo(isSignup ? '/login' : '/signup')}>{isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}</button></div>
      {!configured && <button className="demo-preview-button" onClick={() => { sessionStorage.setItem('tiramisu-demo-mode', 'true'); navigateTo('/discover?demo=1') }}><Sparkles size={14} /> Preview the demo in read-only mode</button>}
      <button className="auth-back" onClick={() => navigateTo('/login')}><ArrowLeft size={15} /> Back to login</button>
      <p className="auth-legal">By continuing, you agree to be kind, curious, and respect everyone’s boundaries.</p>
    </div></main>
  </div>
}
