import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/profile-client'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  
  // Buscar sessão e perfil em paralelo para melhor performance
  const [sessionResult, profileResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser().then(async (userResult) => {
      if (!userResult.data.user) return { data: null, error: null }
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', userResult.data.user.id)
        .maybeSingle()
    })
  ])

  const {
    data: { session },
  } = sessionResult

  if (!session) {
    redirect('/login')
  }

  return (
    <ProfileClient
      user={session.user}
      profile={profileResult.data}
    />
  )
}


