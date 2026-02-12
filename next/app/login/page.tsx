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

  // Signup-specific fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  // Password validation
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordValid = password.length >= 8
  const confirmPasswordValid = confirmPassword.length >= 8
  const showPasswordMatch = confirmPassword.length > 0
  const formValid = isSignUp
    ? fullName.trim() && email && passwordValid && passwordsMatch
    : email && password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      if (!passwordsMatch) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            phone: phone || null,
            company: company || null
          }
        },
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

  function resetSignupFields() {
    setFullName('')
    setPhone('')
    setCompany('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
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
          {/* Signup-only fields */}
          {isSignUp && (
            <div>
              <label className="acl-label">FULL NAME</label>
              <input
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="acl-input"
              />
            </div>
          )}

          <div>
            <label className="acl-label">{isSignUp ? 'EMAIL' : 'Email Address'}</label>
            <input
              type="email"
              placeholder={isSignUp ? 'you@example.com' : 'your@email.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="acl-input"
            />
          </div>

          {/* Signup-only fields */}
          {isSignUp && (
            <>
              <div>
                <label className="acl-label">PHONE (OPTIONAL)</label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="acl-input"
                />
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.5625rem',
                  color: 'var(--acl-text-dim)',
                  marginTop: '0.375rem',
                  letterSpacing: '0.02em',
                }}>
                  For lead alerts via SMS
                </div>
              </div>

              <div>
                <label className="acl-label">COMPANY (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="Your business name"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="acl-input"
                />
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.5625rem',
                  color: 'var(--acl-text-dim)',
                  marginTop: '0.375rem',
                  letterSpacing: '0.02em',
                }}>
                  Helps us customize your experience
                </div>
              </div>
            </>
          )}

          <div>
            <label className="acl-label">PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 8 : 6}
                className="acl-input"
                style={{ paddingRight: '2.5rem' }}
              />
              {isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--acl-text-dim)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              )}
            </div>
            {isSignUp && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.5625rem',
                color: 'var(--acl-text-dim)',
                marginTop: '0.375rem',
                letterSpacing: '0.02em',
              }}>
                Minimum 8 characters
              </div>
            )}
          </div>

          {/* Confirm Password - Signup only */}
          {isSignUp && (
            <div>
              <label className="acl-label">CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="acl-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--acl-text-dim)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {showPasswordMatch && (
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.5625rem',
                  color: passwordsMatch && confirmPasswordValid ? 'var(--acl-green)' : 'var(--acl-pink)',
                  marginTop: '0.375rem',
                  letterSpacing: '0.02em',
                }}>
                  {passwordsMatch && confirmPasswordValid ? 'Passwords match ✓' : 'Passwords do not match'}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignUp && !formValid)}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '0.5rem',
              background: isSignUp
                ? 'linear-gradient(135deg, var(--acl-gold), #F5A623)'
                : 'linear-gradient(135deg, var(--acl-cyan), #0EA5E9)',
              opacity: (loading || (isSignUp && !formValid)) ? 0.5 : 1,
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
              if (!isSignUp) {
                // Switching to signup - keep email/password
              } else {
                // Switching to login - clear signup fields
                resetSignupFields()
              }
            }}
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
            {isSignUp ? 'Already have an account? Sign in' : 'Create New Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}
