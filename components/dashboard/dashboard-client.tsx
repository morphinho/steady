'use client'

import { useState, useMemo, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Plus,
  CreditCard,
  Bell,
  Search,
  Menu,
  User,
  CircleDollarSign,
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AddIncomeModal from './add-income-modal'
import AddExpenseModal from './add-expense-modal'
import AddDebtModal from './add-debt-modal'
import TransactionsList from './transactions-list'
import DebtsList from './debts-list'
import BottomNav from './bottom-nav'
import { setCachedProfile } from '@/lib/profile-cache'
import ProfileClient from '@/components/profile/profile-client'

type Income = {
  id: string
  user_id: string
  valor: number
  data: string
  fonte: string
  tipo: 'recorrente' | 'pontual'
  projeto: string | null
  conta: 'pessoal' | 'negocio'
  created_at: string
}

type Expense = {
  id: string
  user_id: string
  valor: number
  data: string
  categoria: string
  descricao: string | null
  tipo: 'fixo' | 'variavel'
  status: 'pago' | 'pendente'
  conta: 'pessoal' | 'negocio'
  recorrente: boolean
  created_at: string
}

type Debt = {
  id: string
  nome: string
  credor: string
  valor_total: number
  valor_pago: number
  data_inicio: string
  data_vencimento: string | null
  taxa_juros: number
  status: 'aberta' | 'paga' | 'atrasada'
  conta: 'pessoal' | 'negocio'
  parcelas_total: number | null
  parcelas_pagas: number | null
  observacoes: string | null
}

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

interface DashboardClientProps {
  user: SupabaseUser
  profile: Profile | null
  incomes: Income[]
  expenses: Expense[]
}

export default function DashboardClient({
  user,
  profile,
  incomes: initialIncomes,
  expenses: initialExpenses,
}: DashboardClientProps) {
  const [incomes, setIncomes] = useState(initialIncomes)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [debts, setDebts] = useState<Debt[]>([])
  const [accountFilter, setAccountFilter] = useState<'all' | 'pessoal' | 'negocio'>('all')
  const [activeTab, setActiveTab] = useState<'transactions' | 'debts' | 'profile'>('transactions')
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const [incomesResult, expensesResult, debtsResult] = await Promise.all([
        supabase.from('incomes').select('*').order('data', { ascending: false }),
        supabase.from('expenses').select('*').order('data', { ascending: false }),
        supabase.from('debts').select('*').order('created_at', { ascending: false }),
      ])

      if (incomesResult.data) setIncomes(incomesResult.data)
      if (expensesResult.data) setExpenses(expensesResult.data)
      if (debtsResult.data) setDebts(debtsResult.data)
    }

    loadData()
    
    // Salvar perfil no cache quando disponível
    if (profile) {
      setCachedProfile(profile)
    }
  }, [profile, supabase])

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const metrics = useMemo(() => {
    const filteredIncomes = incomes.filter((i) =>
      accountFilter === 'all' ? true : i.conta === accountFilter
    )
    const filteredExpenses = expenses.filter((e) =>
      accountFilter === 'all' ? true : e.conta === accountFilter
    )

    const currentMonthIncomes = filteredIncomes.filter((i) => {
      const date = new Date(i.data)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const currentMonthExpenses = filteredExpenses.filter((e) => {
      const date = new Date(e.data)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const totalIncomes = currentMonthIncomes.reduce((sum, i) => sum + Number(i.valor), 0)
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + Number(e.valor), 0)
    const balance = totalIncomes - totalExpenses

    const recurringIncomes = filteredIncomes
      .filter((i) => i.tipo === 'recorrente')
      .reduce((sum, i) => sum + Number(i.valor), 0)

    const fixedExpenses = filteredExpenses
      .filter((e) => e.tipo === 'fixo' || e.recorrente)
      .reduce((sum, e) => sum + Number(e.valor), 0)

    const pendingExpenses = filteredExpenses
      .filter((e) => e.status === 'pendente')
      .reduce((sum, e) => sum + Number(e.valor), 0)

    const projectedBalance = balance + recurringIncomes - fixedExpenses - pendingExpenses

    return {
      totalIncomes,
      totalExpenses,
      balance,
      projectedBalance,
    }
  }, [incomes, expenses, accountFilter, currentMonth, currentYear])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const refreshData = async () => {
    const [incomesResult, expensesResult] = await Promise.all([
      supabase.from('incomes').select('*').order('data', { ascending: false }),
      supabase.from('expenses').select('*').order('data', { ascending: false }),
    ])

    if (incomesResult.data) setIncomes(incomesResult.data)
    if (expensesResult.data) setExpenses(expensesResult.data)
  }

  const refreshDebts = async () => {
    const { data } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setDebts(data)
  }

  const handleBottomNavAdd = () => {
    setShowAddChoiceModal(true)
  }

  const handleAddChoice = (type: 'income' | 'expense' | 'debt') => {
    setShowAddChoiceModal(false)
    if (type === 'income') {
      setShowIncomeModal(true)
    } else if (type === 'expense') {
      setShowExpenseModal(true)
    } else {
      setShowDebtModal(true)
    }
  }

  const handleAnalysisClick = () => {
    toast({
      title: 'Análise',
      description: 'Funcionalidade de análise em breve.',
    })
  }

  const handleSettingsClick = () => {
    toast({
      title: 'Configurações',
      description: 'Funcionalidade de configurações em breve.',
    })
  }

  const handleProfileClick = () => {
    setActiveTab('profile')
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 page-transition">
      {/* Header Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-surface">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-1.5 rounded-xl bg-surfaceMuted flex-shrink-0">
                <Image src="/steady fav.svg" alt="Logo" width={16} height={16} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-textPrimary tracking-tight truncate">
                  {profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name || 'Dashboard')}
                </h1>
                <p className="text-[9px] text-textTertiary truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast active:scale-95">
                <Search className="w-4 h-4 text-textSecondary" />
              </button>
              <button 
                onClick={handleProfileClick}
                className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast active:scale-95"
              >
                <User className="w-4 h-4 text-textSecondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden md:block sticky top-0 z-[100] bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-surfaceMuted">
                <Image src="/steady fav.svg" alt="Logo" width={16} height={16} className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-textPrimary tracking-tight">
                  {profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name || 'Dashboard')}
                </h1>
                <p className="text-[10px] text-textTertiary">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast">
                <Search className="w-4 h-4 text-textSecondary" />
              </button>
              <button className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast relative">
                <Bell className="w-4 h-4 text-textSecondary" />
              </button>
              <button 
                onClick={handleProfileClick}
                className="p-2 rounded-xl hover:bg-surfaceMuted transition-fast"
              >
                <User className="w-4 h-4 text-textSecondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 md:pt-6 pb-4 md:pb-8">
        <div className="mb-6 md:mb-8 animate-fade-in mt-4 md:mt-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-textPrimary mb-2">
            Olá, {profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name || 'Usuário')}!
          </h2>
        </div>
        <div className="mb-6 md:mb-8 animate-fade-in hidden md:block">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-surfaceMuted p-1 rounded-2xl border-0">
              <TabsTrigger
                value="transactions"
                className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary font-medium transition-fast"
              >
                Transações
              </TabsTrigger>
              <TabsTrigger
                value="debts"
                className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary font-medium transition-fast"
              >
                Dívidas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === 'transactions' && (
          <>
            <div className="mb-4 md:mb-6 animate-fade-in-up">
              <Tabs value={accountFilter} onValueChange={(v) => setAccountFilter(v as any)}>
                <TabsList className="bg-surfaceMuted p-1 rounded-2xl border-0 text-xs md:text-sm">
                  <TabsTrigger
                    value="all"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="pessoal"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Pessoal
                  </TabsTrigger>
                  <TabsTrigger
                    value="negocio"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Negócio
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 md:mb-8">
              <div className="stagger-item bg-surface rounded-2xl p-3 md:p-5">
                <div className="flex flex-row items-center justify-between pb-2 md:pb-3">
                  <p className="text-xs md:text-sm font-medium text-textSecondary">Saldo</p>
                  <CircleDollarSign className={`h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 ${
                    metrics.balance >= 0 ? 'text-success' : 'text-error'
                  }`} />
                </div>
                <div>
                  <div className={`text-base md:text-2xl font-semibold tracking-tight break-words ${
                    metrics.balance >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {formatCurrency(metrics.balance)}
                  </div>
                  <p className="text-[10px] md:text-xs text-textTertiary mt-1 md:mt-2">Mês atual</p>
                </div>
              </div>

              <div className="stagger-item bg-surface rounded-2xl p-3 md:p-5">
                <div className="flex flex-row items-center justify-between pb-2 md:pb-3">
                  <p className="text-xs md:text-sm font-medium text-textSecondary">Entradas</p>
                  <ArrowUpCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success flex-shrink-0" />
                </div>
                <div>
                  <div className="text-base md:text-2xl font-semibold text-success tracking-tight break-words">
                    {formatCurrency(metrics.totalIncomes)}
                  </div>
                  <p className="text-[10px] md:text-xs text-textTertiary mt-1 md:mt-2">Mês atual</p>
                </div>
              </div>

              <div className="stagger-item bg-surface rounded-2xl p-3 md:p-5">
                <div className="flex flex-row items-center justify-between pb-2 md:pb-3">
                  <p className="text-xs md:text-sm font-medium text-textSecondary">Saídas</p>
                  <ArrowDownCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-error flex-shrink-0" />
                </div>
                <div>
                  <div className="text-base md:text-2xl font-semibold text-error tracking-tight break-words">
                    {formatCurrency(metrics.totalExpenses)}
                  </div>
                  <p className="text-[10px] md:text-xs text-textTertiary mt-1 md:mt-2">Mês atual</p>
                </div>
              </div>

              <div className="stagger-item bg-surface rounded-2xl p-3 md:p-5">
                <div className="flex flex-row items-center justify-between pb-2 md:pb-3">
                  <p className="text-xs md:text-sm font-medium text-textSecondary">Projetado</p>
                  <TrendingUp className={`h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 ${
                    metrics.projectedBalance >= 0 ? 'text-success' : 'text-warning'
                  }`} />
                </div>
                <div>
                  <div className={`text-base md:text-2xl font-semibold tracking-tight break-words ${
                    metrics.projectedBalance >= 0 ? 'text-success' : 'text-warning'
                  }`}>
                    {formatCurrency(metrics.projectedBalance)}
                  </div>
                  <p className="text-[10px] md:text-xs text-textTertiary mt-1 md:mt-2">Fim do mês</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex gap-3 mb-8 animate-fade-in-up">
              <Button
                onClick={() => setShowIncomeModal(true)}
                className="flex-1 bg-transparent text-success font-medium py-5 rounded-2xl hover:bg-success/5 transition-fast"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Entrada
              </Button>
              <Button
                onClick={() => setShowExpenseModal(true)}
                className="flex-1 bg-transparent text-error font-medium py-5 rounded-2xl hover:bg-error/5 transition-fast"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Gasto
              </Button>
            </div>

            <TransactionsList
              incomes={incomes}
              expenses={expenses}
              accountFilter={accountFilter}
              onRefresh={refreshData}
            />
          </>
        )}

        {activeTab === 'debts' && (
          <>
            <div className="mb-4 md:mb-6 animate-fade-in-up">
              <Tabs value={accountFilter} onValueChange={(v) => setAccountFilter(v as any)}>
                <TabsList className="bg-surfaceMuted p-1 rounded-2xl border-0 text-xs md:text-sm">
                  <TabsTrigger
                    value="all"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Geral
                  </TabsTrigger>
                  <TabsTrigger
                    value="pessoal"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Pessoal
                  </TabsTrigger>
                  <TabsTrigger
                    value="negocio"
                    className="rounded-xl data-[state=active]:bg-surface data-[state=active]:text-textPrimary  font-medium transition-fast px-3 md:px-4"
                  >
                    Negócio
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mb-4 md:mb-8 animate-fade-in-up hidden md:block">
              <Button
                onClick={() => setShowDebtModal(true)}
                className="w-full bg-transparent text-textPrimary font-medium py-5 rounded-2xl hover:bg-surfaceMuted transition-fast"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Dívida
              </Button>
            </div>

            <DebtsList
              debts={debts}
              accountFilter={accountFilter}
              onRefresh={refreshDebts}
            />
          </>
        )}
      </main>

      <AddIncomeModal
        open={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSuccess={refreshData}
        userId={user.id}
      />

      <AddExpenseModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={refreshData}
        userId={user.id}
      />

      <AddDebtModal
        open={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        onSuccess={refreshDebts}
        userId={user.id}
      />

      {/* Modal de escolha de tipo */}
      <Dialog open={showAddChoiceModal} onOpenChange={setShowAddChoiceModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">O que deseja adicionar?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <button
              onClick={() => handleAddChoice('income')}
              className="flex items-center gap-3 p-3 rounded-xl bg-surfaceMuted hover:bg-surfaceElevated transition-fast text-left active:scale-[0.98]"
            >
              <div className="p-1.5 rounded-lg bg-success/10 flex-shrink-0">
                <ArrowUpCircle className="w-5 h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-textPrimary">Nova Entrada</p>
                <p className="text-xs text-textSecondary">Adicionar receita</p>
              </div>
            </button>

            <button
              onClick={() => handleAddChoice('expense')}
              className="flex items-center gap-3 p-3 rounded-xl bg-surfaceMuted hover:bg-surfaceElevated transition-fast text-left active:scale-[0.98]"
            >
              <div className="p-1.5 rounded-lg bg-error/10 flex-shrink-0">
                <ArrowDownCircle className="w-5 h-5 text-error" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-textPrimary">Novo Gasto</p>
                <p className="text-xs text-textSecondary">Adicionar despesa</p>
              </div>
            </button>

            <button
              onClick={() => handleAddChoice('debt')}
              className="flex items-center gap-3 p-3 rounded-xl bg-surfaceMuted hover:bg-surfaceElevated transition-fast text-left active:scale-[0.98]"
            >
              <div className="p-1.5 rounded-lg bg-warning/10 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-textPrimary">Nova Dívida</p>
                <p className="text-xs text-textSecondary">Adicionar dívida</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={handleBottomNavAdd}
        onAnalysisClick={handleAnalysisClick}
        onSettingsClick={handleSettingsClick}
        onProfileClick={handleProfileClick}
      />
    </div>
  )
}
