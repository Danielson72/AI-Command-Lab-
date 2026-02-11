import { createClient } from '../../lib/supabase/server'
import DashboardContent from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch today's leads count
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: todayLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

  // Current date for header
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return <DashboardContent currentDate={currentDate} todayLeads={todayLeads} />
}
