'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import AddIncomeForm from '@/components/dashboard/add-income-form'

export default function AddIncomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUserId(session.user.id)
      setLoading(false)
    }
    checkSession()
  }, [router, supabase])

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brandPrimary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-surface">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast"
            >
              <ArrowLeft className="w-5 h-5 text-textPrimary" />
            </button>
            <h1 className="text-lg font-semibold text-textPrimary">Nova Entrada</h1>
            <div className="w-9" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-16 pb-4">
        <div className="bg-surface rounded-2xl p-5">
          <AddIncomeForm userId={userId} isPage={true} />
        </div>
      </main>
    </div>
  )
}

