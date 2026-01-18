import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/profile-client'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <ProfileClient
      user={session.user}
      profile={profile}
    />
  )
}


