export default function BrandsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Brands
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
        Manage your brands and their configurations.
      </p>
      <div
        className="glass-card animate-in"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          Brand management coming in Phase 3.
        </p>
      </div>
    </div>
  )
}
