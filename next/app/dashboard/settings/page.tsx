export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Settings
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
        Account and platform configuration.
      </p>
      <div
        className="glass-card animate-in"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          Settings panel coming in Phase 3.
        </p>
      </div>
    </div>
  )
}
