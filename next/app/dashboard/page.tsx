import { createClient } from '../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
        Welcome back, {user?.email?.split('@')[0]}.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <StatCard label="Total Leads" value="—" delay={1} />
        <StatCard label="This Week" value="—" delay={2} />
        <StatCard label="Contacted" value="—" delay={3} />
        <StatCard label="Active Brands" value="—" delay={4} />
      </div>

      <div
        className="glass-card stat-card animate-in animate-in-delay-5"
        style={{ marginTop: '2rem', padding: '1.5rem' }}
      >
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Phase 2: Lead Engine
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
          Your lead capture workflows are active. The Lead Dashboard is loading
          data from your n8n workflows via Supabase. Navigate to Leads to see
          incoming leads across all your brands.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className={`glass-card stat-card animate-in animate-in-delay-${delay}`}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}
