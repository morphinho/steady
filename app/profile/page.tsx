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

  // Buscar apenas campos necessários para melhor performance
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name, phone, avatar_url, bio, created_at, updated_at')
    .eq('id', session.user.id)
    .maybeSingle()

  return (
    <ProfileClient
      user={session.user}
      profile={profile}
    />
  )
}


