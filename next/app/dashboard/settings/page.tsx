'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [flags, setFlags] = useState({
    leadCapture: true,
    websiteHealth: true,
    contentStudio: true,
    aiAssistants: false,
    socialPublisher: false,
    whiteLabel: false,
  })

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('acl-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('acl-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <>
      <style jsx>{`
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-animate {
          animation: card-enter 0.3s ease-out forwards;
          opacity: 0;
        }
        .card-animate-1 { animation-delay: 0ms; }
        .card-animate-2 { animation-delay: 80ms; }

        .toggle-switch {
          position: relative;
          width: 36px;
          height: 20px;
          background: var(--acl-text-dim);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .toggle-switch.active {
          background: var(--acl-cyan);
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .toggle-switch.active::after {
          transform: translateX(16px);
        }
      `}</style>

      <div>
        {/* Page Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
            letterSpacing: '0.02em',
          }}>
            SETTINGS
          </h1>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6875rem',
            color: 'var(--acl-text-dim)',
          }}>
            Account & feature configuration
          </p>
        </div>

        {/* Settings Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.125rem',
        }}>
          {/* Account Card */}
          <div className="glass-card glass-card-cyan card-animate card-animate-1" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--acl-text)',
              marginBottom: '1.25rem',
            }}>
              ACCOUNT
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <AccountRow label="Email" value="dalvarez@sotsvc.com" />
              <AccountRow label="User ID" value="50a2d0d3..." />
              <AccountRow label="Joined" value="2/4/2026" />
              <AccountRow label="Tier" value="Pro" />

              {/* Theme Toggle */}
              {mounted && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'rgba(13,19,32,0.4)',
                  borderRadius: '6px',
                  border: '1px solid rgba(0,229,255,0.1)',
                }}>
                  <span style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '0.75rem',
                    color: 'var(--acl-text-mid)',
                  }}>
                    Theme
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.625rem',
                      color: 'var(--acl-text-dim)',
                      textTransform: 'uppercase',
                    }}>
                      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </span>
                    <div
                      className={`toggle-switch ${theme === 'light' ? 'active' : ''}`}
                      onClick={toggleTheme}
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Flags Card */}
          <div className="glass-card glass-card-gold card-animate card-animate-2" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--acl-text)',
              }}>
                FEATURE FLAGS
              </h3>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.625rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '12px',
                background: 'rgba(245,166,35,0.15)',
                color: 'var(--acl-gold)',
                border: '1px solid rgba(245,166,35,0.3)',
              }}>3 of 6</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FeatureFlag
                name="Lead Capture"
                description="Capture & qualify leads"
                phase="P2"
                active={flags.leadCapture}
                onToggle={() => toggleFlag('leadCapture')}
              />
              <FeatureFlag
                name="Website Health"
                description="SEO & performance audits"
                phase="P3"
                active={flags.websiteHealth}
                onToggle={() => toggleFlag('websiteHealth')}
              />
              <FeatureFlag
                name="Content Studio"
                description="AI content generation"
                phase="P3"
                active={flags.contentStudio}
                onToggle={() => toggleFlag('contentStudio')}
              />
              <FeatureFlag
                name="AI Assistants"
                description="Agent approval & monitoring"
                phase="P5"
                active={flags.aiAssistants}
                onToggle={() => toggleFlag('aiAssistants')}
                benefit="Save 6-10 hours/week"
              />
              <FeatureFlag
                name="Social Publisher"
                description="Multi-platform posting"
                phase="P6"
                active={flags.socialPublisher}
                onToggle={() => toggleFlag('socialPublisher')}
                benefit="3x engagement boost"
              />
              <FeatureFlag
                name="White Label"
                description="Agency re-branding"
                phase="P9"
                active={flags.whiteLabel}
                onToggle={() => toggleFlag('whiteLabel')}
                benefit="Client-ready platform"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: 'rgba(13,19,32,0.4)',
      borderRadius: '6px',
      border: '1px solid rgba(0,229,255,0.1)',
    }}>
      <span style={{
        fontFamily: 'Sora, sans-serif',
        fontSize: '0.75rem',
        color: 'var(--acl-text-mid)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        color: 'var(--acl-text)',
      }}>
        {value}
      </span>
    </div>
  )
}

interface FeatureFlagProps {
  name: string
  description: string
  phase: string
  active: boolean
  onToggle: () => void
  benefit?: string
}

function FeatureFlag({ name, description, phase, active, onToggle, benefit }: FeatureFlagProps) {
  return (
    <div style={{
      padding: '0.875rem',
      background: 'rgba(13,19,32,0.4)',
      borderRadius: '6px',
      border: '1px solid rgba(245,166,35,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--acl-text)',
            }}>
              {name}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5625rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '8px',
              background: 'rgba(245,166,35,0.1)',
              color: 'var(--acl-gold)',
              border: '1px solid rgba(245,166,35,0.2)',
            }}>
              {phase}
            </span>
          </div>
          <div style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '0.625rem',
            color: 'var(--acl-text-dim)',
          }}>
            {description}
          </div>
        </div>

        <div
          className={`toggle-switch ${active ? 'active' : ''}`}
          onClick={onToggle}
          style={{ flexShrink: 0, marginLeft: '1rem' }}
        />
      </div>

      {!active && benefit && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '0.625rem',
            color: 'var(--acl-text-dim)',
          }}>
            {benefit}
          </span>
          <button style={{
            background: 'none',
            border: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.625rem',
            color: 'var(--acl-gold)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Upgrade →
          </button>
        </div>
      )}
    </div>
  )
}
