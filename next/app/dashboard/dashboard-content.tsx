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
        .card-animate-8 { animation-delay: 560ms; }
        .card-animate-9 { animation-delay: 640ms; }
        .card-animate-10 { animation-delay: 720ms; }
        .card-animate-11 { animation-delay: 800ms; }
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
          marginBottom: '1.5rem',
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

        {/* Dashboard Panels - 2 column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.125rem',
        }}>
          <LeadCapturePanel delay={8} />
          <AIAssistantsPanel delay={9} />
          <ActivityFeedPanel delay={10} />
          <SubscriptionTiersPanel delay={11} />
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

// PANEL 1: Lead Capture
function LeadCapturePanel({ delay }: { delay: number }) {
  const weekData = [
    { day: 'M', count: 12 },
    { day: 'T', count: 18 },
    { day: 'W', count: 9 },
    { day: 'T', count: 24 },
    { day: 'F', count: 16 },
    { day: 'S', count: 31 },
    { day: 'S', count: 22 },
  ]
  const maxCount = Math.max(...weekData.map(d => d.count))

  return (
    <div className={`glass-card glass-card-cyan card-animate card-animate-${delay}`} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acl-cyan)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--acl-text)' }}>
          LEAD CAPTURE
        </h3>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.625rem',
          padding: '0.2rem 0.5rem',
          borderRadius: '12px',
          background: 'rgba(0,230,118,0.15)',
          color: 'var(--acl-green)',
          border: '1px solid rgba(0,230,118,0.3)',
        }}>LIVE</span>
      </div>

      {/* This week summary */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: 'var(--acl-text-dim)', marginBottom: '0.25rem' }}>
          This week
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: 'var(--acl-cyan)' }}>
          142 leads
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '80px', marginBottom: '1.25rem' }}>
        {weekData.map((item, idx) => {
          const isLast = idx === weekData.length - 1
          const height = (item.count / maxCount) * 100
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{
                width: '100%',
                height: `${height}%`,
                background: isLast
                  ? 'linear-gradient(180deg, var(--acl-cyan), rgba(0,229,255,0.44))'
                  : 'linear-gradient(180deg, rgba(0,229,255,0.44), rgba(0,229,255,0.2))',
                borderRadius: '3px',
                transition: 'all 0.3s ease',
              }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: 'var(--acl-text-dim)' }}>
                {item.day}
              </span>
            </div>
          )
        })}
      </div>

      {/* Brand breakdown */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{
          flex: 1,
          padding: '0.75rem',
          background: 'rgba(0,229,255,0.06)',
          border: '1px solid rgba(0,229,255,0.15)',
          borderRadius: '6px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5625rem', color: 'var(--acl-cyan)', marginBottom: '0.25rem' }}>SOTSVC</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: 'var(--acl-text)' }}>68</div>
        </div>
        <div style={{
          flex: 1,
          padding: '0.75rem',
          background: 'rgba(0,230,118,0.06)',
          border: '1px solid rgba(0,230,118,0.15)',
          borderRadius: '6px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5625rem', color: 'var(--acl-green)', marginBottom: '0.25rem' }}>BoC</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: 'var(--acl-text)' }}>41</div>
        </div>
        <div style={{
          flex: 1,
          padding: '0.75rem',
          background: 'rgba(245,166,35,0.06)',
          border: '1px solid rgba(245,166,35,0.15)',
          borderRadius: '6px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5625rem', color: 'var(--acl-gold)', marginBottom: '0.25rem' }}>TCE</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: 'var(--acl-text)' }}>33</div>
        </div>
      </div>
    </div>
  )
}

// PANEL 2: AI Assistants
function AIAssistantsPanel({ delay }: { delay: number }) {
  const agents = [
    { name: 'Willie (Life OS)', status: 'active' as const, tasks: 24, model: 'claude-sonnet-4.5' },
    { name: 'Lead Capture Bot', status: 'active' as const, tasks: 142, model: 'gpt-4o-mini' },
    { name: 'Content Writer', status: 'idle' as const, tasks: 8, model: 'claude-opus-4' },
    { name: 'Site Analyzer', status: 'active' as const, tasks: 3, model: 'gemini-flash' },
    { name: 'Social Publisher', status: 'pending' as const, tasks: 0, model: '—' },
  ]

  const statusConfig = {
    active: { color: 'var(--acl-green)', label: 'ACTIVE', bg: 'rgba(0,230,118,0.15)', border: 'rgba(0,230,118,0.3)' },
    idle: { color: 'var(--acl-gold)', label: 'IDLE', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.3)' },
    pending: { color: 'var(--acl-text-dim)', label: 'PENDING', bg: 'rgba(58,74,98,0.15)', border: 'rgba(58,74,98,0.3)' },
  }

  return (
    <div className={`glass-card glass-card-purple card-animate card-animate-${delay}`} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acl-purple)" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--acl-text)' }}>
          AI ASSISTANTS
        </h3>
      </div>

      {/* Agent rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {agents.map((agent, idx) => {
          const config = statusConfig[agent.status]
          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(13,19,32,0.4)',
              borderRadius: '6px',
              border: '1px solid rgba(179,136,255,0.1)',
            }}>
              {/* Status dot with glow */}
              <div style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: config.color,
                boxShadow: `0 0 8px ${config.color}`,
                flexShrink: 0,
              }} />

              {/* Name and model */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--acl-text)', marginBottom: '0.125rem' }}>
                  {agent.name}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: 'var(--acl-text-dim)' }}>
                  {agent.model}
                </div>
              </div>

              {/* Task count */}
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: 'var(--acl-cyan)', fontWeight: 600, marginRight: '0.5rem' }}>
                {agent.tasks}
              </div>

              {/* Status badge */}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.5625rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '10px',
                background: config.bg,
                color: config.color,
                border: `1px solid ${config.border}`,
                whiteSpace: 'nowrap',
              }}>
                {config.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// PANEL 3: Activity Feed
function ActivityFeedPanel({ delay }: { delay: number }) {
  const activities = [
    { color: 'var(--acl-cyan)', text: 'New lead captured: James R. — SOTSVC contact form', time: '2m ago' },
    { color: 'var(--acl-purple)', text: 'Willie processed 3 Gmail threads, flagged 1 invoice', time: '8m ago' },
    { color: 'var(--acl-green)', text: 'Stripe: $297 Pro subscription — Boss of Clean user', time: '14m ago' },
    { color: 'var(--acl-purple)', text: 'Content queue: 4 posts scheduled for tomorrow', time: '32m ago' },
  ]

  return (
    <div className={`glass-card glass-card-gold card-animate card-animate-${delay}`} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acl-gold)" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--acl-text)' }}>
          ACTIVITY FEED
        </h3>
      </div>

      {/* Activity items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {activities.map((activity, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
            {/* Left accent bar */}
            <div style={{
              width: '4px',
              background: activity.color,
              borderRadius: '2px',
              flexShrink: 0,
            }} />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '0.75rem',
                color: 'var(--acl-text-mid)',
                lineHeight: 1.5,
                marginBottom: '0.25rem',
              }}>
                {activity.text}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.5625rem',
                color: 'var(--acl-text-dim)',
              }}>
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// PANEL 4: Subscription Tiers
function SubscriptionTiersPanel({ delay }: { delay: number }) {
  const tiers = [
    { name: 'FREE', price: '$0/mo', users: 12, width: 15, color: 'var(--acl-text-dim)' },
    { name: 'STARTER', price: '$97/mo', users: 8, width: 40, color: 'var(--acl-cyan)' },
    { name: 'PRO', price: '$297/mo', users: 3, width: 70, color: 'var(--acl-gold)' },
    { name: 'ENTERPRISE', price: '$597/mo', users: 1, width: 95, color: 'var(--acl-green)' },
  ]

  return (
    <div className={`glass-card glass-card-green card-animate card-animate-${delay}`} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acl-green)" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--acl-text)' }}>
          SUBSCRIPTION TIERS
        </h3>
      </div>

      {/* Tier progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {tiers.map((tier, idx) => (
          <div key={idx}>
            {/* Tier info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.625rem', fontWeight: 700, color: tier.color }}>
                  {tier.name}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5625rem', color: 'var(--acl-text-dim)' }}>
                  {tier.price}
                </span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: 'var(--acl-text-mid)' }}>
                {tier.users} users
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '3px',
              background: 'rgba(13,19,32,0.6)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${tier.width}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`,
                boxShadow: `0 0 8px ${tier.color}44`,
                borderRadius: '2px',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* MRR total */}
      <div style={{
        padding: '1rem',
        background: 'rgba(0,230,118,0.08)',
        border: '1px solid rgba(0,230,118,0.2)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', color: 'var(--acl-text-dim)', marginBottom: '0.25rem' }}>
          MRR TOTAL
        </div>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.125rem', fontWeight: 700, color: 'var(--acl-green)' }}>
          $1,870
        </div>
      </div>
    </div>
  )
}
