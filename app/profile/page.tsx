'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProfileClient from '@/components/profile/profile-client'
import { getCachedProfile, setCachedProfile } from '@/lib/profile-cache'
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

        setUser(session.user)

        // Tentar carregar do cache primeiro
        const cachedProfile = getCachedProfile()
        if (cachedProfile && cachedProfile.id === session.user.id) {
          setProfile(cachedProfile)
        }

        // Buscar do servidor em background para atualizar se necessário
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, phone, avatar_url, bio, created_at, updated_at')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData)
          setCachedProfile(profileData)
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        // Se houver erro, tentar usar cache se disponível
        const cachedProfile = getCachedProfile()
        if (cachedProfile) {
          setProfile(cachedProfile)
        } else {
          router.push('/login')
        }
      }
    }

    loadProfile()
  }, [router, supabase])

  if (!user) {
    return null
  }

  return <ProfileClient user={user} profile={profile} />
}


