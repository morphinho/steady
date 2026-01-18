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

const PROFILE_CACHE_KEY = 'steady_profile_cache'
const PROFILE_CACHE_TIMESTAMP_KEY = 'steady_profile_cache_timestamp'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

export function getCachedProfile(): Profile | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    const timestamp = localStorage.getItem(PROFILE_CACHE_TIMESTAMP_KEY)
    
    if (!cached || !timestamp) return null

    const cacheAge = Date.now() - parseInt(timestamp, 10)
    if (cacheAge > CACHE_DURATION) {
      // Cache expirado, limpar
      clearProfileCache()
      return null
    }

    return JSON.parse(cached) as Profile
  } catch (error) {
    console.error('Erro ao ler cache do perfil:', error)
    return null
  }
}

export function setCachedProfile(profile: Profile | null): void {
  if (typeof window === 'undefined') return

  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
      localStorage.setItem(PROFILE_CACHE_TIMESTAMP_KEY, Date.now().toString())
    } else {
      clearProfileCache()
    }
  } catch (error) {
    console.error('Erro ao salvar cache do perfil:', error)
  }
}

export function clearProfileCache(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(PROFILE_CACHE_KEY)
    localStorage.removeItem(PROFILE_CACHE_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Erro ao limpar cache do perfil:', error)
  }
}

export function updateCachedProfile(updates: Partial<Profile>): void {
  const cached = getCachedProfile()
  if (cached) {
    setCachedProfile({ ...cached, ...updates })
  }
}

