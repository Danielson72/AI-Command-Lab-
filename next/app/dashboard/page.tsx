import { createClient } from '../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch stats
  const [totalLeadsRes, weekLeadsRes, contactedRes, activeBrandsRes, recentLeadsRes] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('contacted', true),
    supabase.from('brands').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('leads').select('id, name, brand_name, status, score, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const totalLeads = totalLeadsRes.count ?? 0
  const weekLeads = weekLeadsRes.count ?? 0
  const contacted = contactedRes.count ?? 0
  const activeBrands = activeBrandsRes.count ?? 0
  const recentLeads = recentLeadsRes.data ?? []

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
        <StatCard label="Total Leads" value={totalLeads.toString()} delay={1} />
        <StatCard label="This Week" value={weekLeads.toString()} delay={2} />
        <StatCard label="Contacted" value={contacted.toString()} delay={3} />
        <StatCard label="Active Brands" value={activeBrands.toString()} delay={4} />
      </div>

      {/* Recent Leads */}
      <div
        className="glass-card animate-in animate-in-delay-5"
        style={{ marginTop: '2rem', padding: '0', overflow: 'hidden' }}
      >
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Recent Leads
          </h2>
        </div>
        {recentLeads.length === 0 ? (
          <p style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
            No leads yet
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Brand</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={tdStyle}>{lead.name || '—'}</td>
                  <td style={tdStyle}>{lead.brand_name || '—'}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td style={tdStyle}>
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td style={tdStyle}>{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="glass-card stat-card animate-in animate-in-delay-6"
        style={{ marginTop: '1.5rem', padding: '1.5rem' }}
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

function StatusBadge({ status }: { status: string | null }) {
  const s = status?.toLowerCase() || 'new'
  let className = 'badge badge-blue'
  if (s === 'contacted') className = 'badge badge-amber'
  if (s === 'qualified') className = 'badge badge-green'
  return <span className={className}>{status || 'new'}</span>
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  let color = 'var(--text-secondary)'
  if (score >= 80) color = 'var(--accent-success)'
  else if (score >= 60) color = 'var(--accent-warning)'
  return <span style={{ color, fontWeight: 600 }}>{score}</span>
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--border-glass)',
  color: 'var(--text-muted)',
  fontWeight: 500,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: 'var(--bg-card)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: 'var(--text-secondary)',
}
