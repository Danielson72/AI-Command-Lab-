import { createClient } from '../../../lib/supabase/server'

interface Lead {
  id: string
  brand_id: string | null
  brand_name: string | null
  name: string
  email: string | null
  phone: string | null
  source: string | null
  message: string | null
  status: string | null
  score: number | null
  contacted: boolean
  created_at: string
}

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leads, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const leadsData: Lead[] = leads ?? []
  const totalCount = count ?? 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>Leads</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
          {totalCount} lead{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      {leadsData.length === 0 ? (
        <div className="glass-card animate-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>No leads yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
            Leads from your contact forms will appear here once connected.
          </p>
        </div>
      ) : (
        <div className="glass-card animate-in" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Brand</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {leadsData.map((lead) => (
                <tr key={lead.id} style={styles.tr}>
                  <td style={styles.td}>{lead.name || '—'}</td>
                  <td style={styles.td}>{lead.brand_name || '—'}</td>
                  <td style={styles.td}>{lead.email || '—'}</td>
                  <td style={styles.td}>{lead.phone || '—'}</td>
                  <td style={styles.td}>
                    <span className="badge badge-blue">{lead.source || 'web'}</span>
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td style={styles.td}>
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td style={styles.td}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
    fontFamily: 'DM Sans, sans-serif',
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-glass)',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    background: 'var(--bg-card)',
  },
  tr: {
    borderBottom: '1px solid var(--border-glass)',
  },
  td: {
    padding: '0.75rem 1rem',
    color: 'var(--text-secondary)',
  },
}
