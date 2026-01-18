import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .order('data', { ascending: false })

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('data', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <DashboardClient
      user={session.user}
      profile={profile}
      incomes={incomes || []}
      expenses={expenses || []}
    />
  )
}
