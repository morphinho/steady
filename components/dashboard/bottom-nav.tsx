'use client'

import { Home, CreditCard, Plus, TrendingUp, Settings, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: 'transactions' | 'debts'
  onTabChange: (tab: 'transactions' | 'debts') => void
  onAddClick: () => void
  onAnalysisClick?: () => void
  onSettingsClick?: () => void
  onProfileClick?: () => void
}

export default function BottomNav({ 
  activeTab, 
  onTabChange, 
  onAddClick,
  onAnalysisClick,
  onSettingsClick,
  onProfileClick
}: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-surface pb-safe">
      <div className="grid grid-cols-5 h-16">
        <button
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center gap-1 transition-fast active:scale-95 ${
            activeTab === 'transactions' ? 'text-textPrimary' : 'text-textTertiary'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={() => onTabChange('debts')}
          className={`flex flex-col items-center justify-center gap-1 transition-fast active:scale-95 ${
            activeTab === 'debts' ? 'text-textPrimary' : 'text-textTertiary'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dívidas</span>
        </button>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center -mt-6 active:scale-95 transition-fast"
        >
          <div className="bg-brandPrimary w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all glow-primary">
            <Plus className="w-6 h-6 text-black" />
          </div>
        </button>

        <button 
          onClick={onAnalysisClick}
          className="flex flex-col items-center justify-center gap-1 text-textTertiary transition-fast active:scale-95"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium">Análise</span>
        </button>

        <button 
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1 text-textTertiary transition-fast active:scale-95"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  )
}
