import { createClient } from '../../../lib/supabase/server'

interface Brand {
  id: string
  name: string
  slug: string
  domain: string | null
  active: boolean
  created_at: string
  lead_count: number
}

export default async function BrandsPage() {
  const supabase = await createClient()

  // Query brands with lead counts using a raw SQL query via RPC or manual join
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  const { data: leadCounts } = await supabase
    .from('leads')
    .select('brand_id')

  // Count leads per brand
  const leadCountMap: Record<string, number> = {}
  if (leadCounts) {
    leadCounts.forEach((lead) => {
      if (lead.brand_id) {
        leadCountMap[lead.brand_id] = (leadCountMap[lead.brand_id] || 0) + 1
      }
    })
  }

  const brandsWithCounts: Brand[] = (brands ?? []).map((brand) => ({
    ...brand,
    lead_count: leadCountMap[brand.id] || 0,
  }))

  const totalBrands = brandsWithCounts.length
  const activeBrands = brandsWithCounts.filter((b) => b.active).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>Brands</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
          {activeBrands} active / {totalBrands} total
        </span>
      </div>

      {brandsWithCounts.length === 0 ? (
        <div className="glass-card animate-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>No brands yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>
            Add your first brand to start tracking leads.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {brandsWithCounts.map((brand, index) => (
            <BrandCard key={brand.id} brand={brand} delay={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function BrandCard({ brand, delay }: { brand: Brand; delay: number }) {
  const delayClass = delay <= 6 ? `animate-in-delay-${delay}` : ''

  return (
    <div
      className={`glass-card stat-card animate-in ${delayClass}`}
      style={{ padding: '1.25rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
          {brand.name}
        </h3>
        <span className={brand.active ? 'badge badge-green' : 'badge badge-amber'}>
          {brand.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {brand.domain && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', fontFamily: 'DM Sans, sans-serif' }}>
          {brand.domain}
        </p>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            {brand.lead_count}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem', fontFamily: 'DM Sans, sans-serif' }}>
            lead{brand.lead_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          Added {new Date(brand.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
