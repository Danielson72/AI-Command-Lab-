'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import AclShieldIcon from '../../src/components/ui/AclShieldIcon'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
      else setMessage('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push('/dashboard'); router.refresh() }
    }
    setLoading(false)
  }

  return (
    <div className="silk-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1.5rem',
    }}>
      {/* Login card */}
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem 2rem',
        animation: mounted ? 'fadeInUp 0.5s ease-out' : 'none',
        opacity: mounted ? 1 : 0,
      }}>
        {/* Shield logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <AclShieldIcon size={100} variant="login" />
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.25rem',
        }}>AI Command Lab</h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </p>

        {error && (
          <div style={{
            background: 'var(--accent-danger-bg)',
            color: 'var(--accent-danger)',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1rem',
          }}>{error}</div>
        )}

        {message && (
          <div style={{
            background: 'var(--accent-success-bg)',
            color: 'var(--accent-success)',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1rem',
          }}>{message}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="acl-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="acl-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            {loading ? '...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-accent)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
