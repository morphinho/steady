'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProfileClient from '@/components/profile/profile-client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          router.push('/login')
          return
        }

        // Buscar perfil em paralelo
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, phone, avatar_url, bio, created_at, updated_at')
          .eq('id', session.user.id)
          .maybeSingle()

        setUser(session.user)
        setProfile(profileData)
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brandPrimary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <ProfileClient user={user} profile={profile} />
}


