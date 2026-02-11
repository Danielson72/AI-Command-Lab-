'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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

  const logoSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 88 : 108

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Login card */}
      <div className="glass-card glass-card-cyan" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        animation: mounted ? 'fadeInUp 0.5s ease-out' : 'none',
        opacity: mounted ? 1 : 0,
      }}>
        {/* Transparent logo with cyan glow */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Image
            src="/images/acl-logo.png"
            alt="AI Command Lab"
            width={logoSize}
            height={logoSize}
            className="logo-glow"
            priority
            style={{ margin: '0 auto' }}
          />
        </div>

        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 800,
          textAlign: 'center',
          marginBottom: '0.5rem',
          color: 'var(--acl-text)',
        }}>AI COMMAND LAB</h1>

        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--acl-text-dim)',
          fontSize: '0.7rem',
          textAlign: 'center',
          marginBottom: '2rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          {isSignUp ? 'Create Your Account' : 'Sign In To Continue'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,64,129,0.15)',
            border: '1px solid rgba(255,64,129,0.3)',
            color: 'var(--acl-pink)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--acl-radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            fontFamily: 'Sora, sans-serif',
          }}>{error}</div>
        )}

        {message && (
          <div style={{
            background: 'rgba(0,230,118,0.15)',
            border: '1px solid rgba(0,230,118,0.3)',
            color: 'var(--acl-green)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--acl-radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            fontFamily: 'Sora, sans-serif',
          }}>{message}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="acl-label">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="acl-input"
            />
          </div>

          <div>
            <label className="acl-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="acl-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--acl-cyan)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--acl-gold)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--acl-cyan)'}
          >
            {isSignUp ? '← Back to Sign In' : 'Create New Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}
