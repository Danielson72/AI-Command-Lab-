import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome to AI Command Lab
      </h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Getting Started
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Create your first brand</li>
          <li>Set up your lead capture form</li>
          <li>Generate content with AI</li>
          <li>Connect integrations</li>
        </ol>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Your Brands
        </h2>
        {brands && brands.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {brands.map((brand) => (
              <li key={brand.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {brand.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {brand.domain || 'No domain set'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No brands yet. Create your first brand to get started.
          </p>
        )}
      </div>
    </div>
  )
}

