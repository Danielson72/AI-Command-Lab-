'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../../lib/supabase/client'

interface Lead {
  id: string
  brand_id: string | null
  brand_name: string | null
  name: string
  email: string | null
  phone: string | null
  source: string | null
  message: string | null
  status: string
  contacted: boolean
  created_at: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (statusFilter === 'contacted') {
      query = query.eq('contacted', true)
    } else if (statusFilter === 'new') {
      query = query.eq('contacted', false)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data, error } = await query
    if (error) {
      console.error('Error fetching leads:', error.message)
      setLeads([])
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }, [search, statusFilter, supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function toggleContacted(id: string, current: boolean) {
    const { error } = await supabase
      .from('leads')
      .update({ contacted: !current })
      .eq('id', id)

    if (!error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, contacted: !current } : l
        )
      )
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>Leads</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="acl-input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="acl-select"
        >
          <option value="all">All Leads</option>
          <option value="new">New (Not Contacted)</option>
          <option value="contacted">Contacted</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>Loading leads...</p>
      ) : leads.length === 0 ? (
        <div className="glass-card animate-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>No leads yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
            Leads from your SOTSVC and TCE contact forms will appear here
            once the leads table is connected to your n8n workflows.
          </p>
        </div>
      ) : (
        <div className="glass-card animate-in" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Brand</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Contacted</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={styles.tr}>
                  <td style={styles.td}>{lead.name || '—'}</td>
                  <td style={styles.td}>{lead.email || '—'}</td>
                  <td style={styles.td}>{lead.phone || '—'}</td>
                  <td style={styles.td}>
                    <span className="badge badge-blue">{lead.source || 'web'}</span>
                  </td>
                  <td style={styles.td}>{lead.brand_name || '—'}</td>
                  <td style={styles.td}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleContacted(lead.id, lead.contacted)}
                      className={lead.contacted ? 'badge badge-green' : 'badge'}
                      style={{
                        background: lead.contacted ? 'var(--accent-success-bg)' : 'var(--bg-input)',
                        color: lead.contacted ? 'var(--accent-success)' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem 0.6rem',
                      }}
                    >
                      {lead.contacted ? '✓ Yes' : 'No'}
                    </button>
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
