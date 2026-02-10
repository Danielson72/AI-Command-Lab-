import { createClient } from '../../../lib/supabase/server'

interface FeatureFlag {
  id: string
  name: string
  enabled: boolean
  description: string | null
  created_at: string
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: featureFlags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('name', { ascending: true })

  const flags: FeatureFlag[] = featureFlags ?? []
  const enabledCount = flags.filter((f) => f.enabled).length

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Settings
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
        Account and platform configuration.
      </p>

      {/* Account Section */}
      <div className="glass-card animate-in animate-in-delay-1" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Account
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>Email</span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>{user?.email || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>User ID</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              {user?.id?.slice(0, 8)}...
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>Joined</span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Feature Flags Section */}
      <div className="glass-card animate-in animate-in-delay-2" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Feature Flags
          </h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'DM Sans, sans-serif' }}>
            {enabledCount} of {flags.length} enabled
          </span>
        </div>

        {flags.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
            No feature flags configured.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {flags.map((flag) => (
              <FlagRow key={flag.id} flag={flag} />
            ))}
          </div>
        )}
      </div>

      {/* Phase 3 Notice */}
      <div className="glass-card stat-card animate-in animate-in-delay-3" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Coming in Phase 3
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
          Brand configurations, notification preferences, API key management, and team settings will be available in Phase 3.
        </p>
      </div>
    </div>
  )
}

function FlagRow({ flag }: { flag: FeatureFlag }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--border-glass)',
    }}>
      <div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          {formatFlagName(flag.name)}
        </div>
        {flag.description && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>
            {flag.description}
          </div>
        )}
      </div>
      <span className={flag.enabled ? 'badge badge-green' : 'badge badge-amber'}>
        {flag.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  )
}

function formatFlagName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
