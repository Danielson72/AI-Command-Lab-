'use client'

interface DashboardContentProps {
  currentDate: string
  todayLeads: number | null
}

export default function DashboardContent({ currentDate, todayLeads }: DashboardContentProps) {
  return (
    <>
      <style jsx>{`
        @keyframes heartbeat-glow {
          0%, 100% { box-shadow: 0 0 0px transparent; }
          50% { box-shadow: 0 0 20px rgba(0,229,255,0.12); }
        }
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
        .card-animate-3 { animation-delay: 160ms; }
        .card-animate-4 { animation-delay: 240ms; }
        .card-animate-5 { animation-delay: 320ms; }
        .card-animate-6 { animation-delay: 400ms; }
        .card-animate-7 { animation-delay: 480ms; }
        .heartbeat-card {
          animation: heartbeat-glow 4s ease-in-out infinite, card-enter 0.3s ease-out forwards;
        }
        .brand-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (max-width: 639px) {
          .brand-pills {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.5rem;
          }
          .hide-mobile-date { display: none; }
        }
      `}</style>

      <div>
        {/* Dashboard Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.125rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
                letterSpacing: '0.02em',
              }}>
                COMMAND CENTER
              </h1>
              <p className="hide-mobile-date" style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6875rem',
                color: 'var(--acl-text-dim)',
              }}>
                {currentDate}
              </p>
            </div>

            {/* Brand Switcher Pills */}
            <div className="brand-pills">
              <BrandPill name="SOTSVC" color="cyan" active />
              <BrandPill name="Boss of Clean" color="green" />
              <BrandPill name="Trusted Expert" color="gold" />
              <BrandPill name="BeatSlave" color="purple" />
              <BrandPill name="DLD-Online" color="orange" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          <StatCard
            label="LEADS TODAY"
            value={todayLeads?.toString() || '0'}
            change="+12%"
            changeUp={true}
            accent="cyan"
            heartbeat
            delay={1}
          />
          <StatCard
            label="REVENUE MTD"
            value="$2.4K"
            change="+8%"
            changeUp={true}
            accent="green"
            delay={2}
          />
          <StatCard
            label="ACTIVE AGENTS"
            value="7"
            accent="purple"
            delay={3}
          />
          <StatCard
            label="CONTENT QUEUE"
            value="14"
            change="-3%"
            changeUp={false}
            accent="gold"
            delay={4}
          />
        </div>

        {/* Quick Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          <QuickActionButton
            title="Capture More Leads"
            subtitle="Launch a lead form on your website"
            icon="crosshair"
            accent="cyan"
            delay={5}
          />
          <QuickActionButton
            title="Scan My Website"
            subtitle="Get SEO & performance insights"
            icon="search"
            accent="purple"
            delay={6}
          />
          <QuickActionButton
            title="Create Content"
            subtitle="AI-generated posts & articles"
            icon="pen"
            accent="gold"
            delay={7}
          />
        </div>
      </div>
    </>
  )
}

interface BrandPillProps {
  name: string
  color: 'cyan' | 'green' | 'gold' | 'purple' | 'orange'
  active?: boolean
}

function BrandPill({ name, color, active }: BrandPillProps) {
  const colors = {
    cyan: { border: 'var(--acl-cyan)', bg: 'rgba(0,229,255,0.08)', text: 'var(--acl-cyan)' },
    green: { border: 'var(--acl-green)', bg: 'rgba(0,230,118,0.08)', text: 'var(--acl-green)' },
    gold: { border: 'var(--acl-gold)', bg: 'rgba(245,166,35,0.08)', text: 'var(--acl-gold)' },
    purple: { border: 'var(--acl-purple)', bg: 'rgba(179,136,255,0.08)', text: 'var(--acl-purple)' },
    orange: { border: 'var(--acl-orange)', bg: 'rgba(255,145,0,0.08)', text: 'var(--acl-orange)' },
  }

  const style = colors[color]

  return (
    <button style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.6875rem',
      padding: '0.4rem 0.85rem',
      borderRadius: '16px',
      border: `1px solid ${active ? style.border : 'var(--acl-border)'}`,
      background: active ? style.bg : 'transparent',
      color: active ? style.text : 'var(--acl-text-dim)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    }}>
      {name}
    </button>
  )
}

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeUp?: boolean
  accent: 'cyan' | 'green' | 'purple' | 'gold'
  heartbeat?: boolean
  delay: number
}

function StatCard({ label, value, change, changeUp, accent, heartbeat, delay }: StatCardProps) {
  const accentColors = {
    cyan: 'var(--acl-cyan)',
    green: 'var(--acl-green)',
    purple: 'var(--acl-purple)',
    gold: 'var(--acl-gold)',
  }

  return (
    <div
      className={`glass-card glass-card-${accent} ${heartbeat ? 'heartbeat-card' : `card-animate card-animate-${delay}`}`}
      style={{
        flex: '1 1 calc(50% - 0.5rem)',
        minWidth: '140px',
        padding: '1.25rem 1rem',
      }}
    >
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.625rem',
        color: 'var(--acl-text-dim)',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1.625rem',
        fontWeight: 700,
        color: 'var(--acl-text)',
        marginBottom: '0.25rem',
      }}>
        {value}
      </div>
      {change && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6875rem',
          color: changeUp ? 'var(--acl-green)' : 'var(--acl-pink)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}>
          <span>{changeUp ? '▲' : '▼'}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}

interface QuickActionButtonProps {
  title: string
  subtitle: string
  icon: 'crosshair' | 'search' | 'pen'
  accent: 'cyan' | 'purple' | 'gold'
  delay: number
}

function QuickActionButton({ title, subtitle, icon, accent, delay }: QuickActionButtonProps) {
  const icons = {
    crosshair: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    search: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    pen: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    ),
  }

  return (
    <button
      className={`glass-card glass-card-${accent} card-animate card-animate-${delay}`}
      style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        border: '1px solid var(--acl-border)',
        background: 'var(--acl-surface-glass)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent === 'cyan' ? 'var(--acl-cyan)' : accent === 'purple' ? 'var(--acl-purple)' : 'var(--acl-gold)',
        flexShrink: 0,
      }}>
        {icons[icon]}
      </div>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--acl-text)',
          marginBottom: '0.25rem',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: '0.6875rem',
          color: 'var(--acl-text-mid)',
        }}>
          {subtitle}
        </div>
      </div>
    </button>
  )
}
