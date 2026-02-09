import { createClient } from '../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Welcome back, {user?.email?.split('@')[0]}.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        <StatCard label="Total Leads" value="—" />
        <StatCard label="This Week" value="—" />
        <StatCard label="Contacted" value="—" />
        <StatCard label="Active Brands" value="—" />
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#141414',
        borderRadius: '8px',
        border: '1px solid #222',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Phase 2: Lead Engine
        </h2>
        <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Your lead capture workflows are active. The Lead Dashboard is loading 
          data from your n8n workflows via Supabase. Navigate to Leads to see 
          incoming leads across all your brands.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '1.25rem',
      background: '#141414',
      borderRadius: '8px',
      border: '1px solid #222',
    }}>
      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.35rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        {value}
      </div>
    </div>
  )
}
