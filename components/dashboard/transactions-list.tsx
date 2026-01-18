'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

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

interface TransactionsListProps {
  incomes: Income[]
  expenses: Expense[]
  debts: Debt[]
  accountFilter: 'all' | 'pessoal' | 'negocio'
  onRefresh: () => void
  currentMonth: number
  currentYear: number
}

type Transaction = {
  id: string
  type: 'income' | 'expense' | 'debt'
  valor: number
  data: string
  description: string
  badge: string
  conta: string
  status?: string
  isDebt?: boolean
}

export default function TransactionsList({
  incomes,
  expenses,
  debts,
  accountFilter,
  onRefresh,
  currentMonth,
  currentYear,
}: TransactionsListProps) {
  const { toast } = useToast()
  const supabase = createClient()

  const transactions = useMemo(() => {
    const filteredIncomes = incomes
      .filter((i) => (accountFilter === 'all' ? true : i.conta === accountFilter))
      .map((i): Transaction => ({
        id: i.id,
        type: 'income',
        valor: Number(i.valor),
        data: i.data,
        description: `${i.fonte}${i.projeto ? ` - ${i.projeto}` : ''}`,
        badge: i.tipo,
        conta: i.conta,
      }))

    const filteredExpenses = expenses
      .filter((e) => (accountFilter === 'all' ? true : e.conta === accountFilter))
      .map((e): Transaction => ({
        id: e.id,
        type: 'expense',
        valor: Number(e.valor),
        data: e.data,
        description: `${e.categoria}${e.descricao ? ` - ${e.descricao}` : ''}`,
        badge: e.tipo,
        conta: e.conta,
        status: e.status,
      }))

    // Adicionar dívidas como transações mensais
    const filteredDebts = debts
      .filter((d) => {
        if (accountFilter !== 'all' && d.conta !== accountFilter) return false
        if (d.status === 'paga') return false
        
        const valorTotal = Number(d.valor_total)
        const valorPago = Number(d.valor_pago)
        const valorRestante = valorTotal - valorPago
        
        if (valorRestante <= 0) return false
        
        // Verificar se a dívida tem vencimento no mês atual ou se está ativa
        const vencimento = d.data_vencimento ? new Date(d.data_vencimento) : null
        const inicio = new Date(d.data_inicio)
        
        if (vencimento) {
          const vencimentoMonth = vencimento.getMonth()
          const vencimentoYear = vencimento.getFullYear()
          // Incluir se vencimento é no mês atual ou futuro
          return vencimentoYear > currentYear || 
                 (vencimentoYear === currentYear && vencimentoMonth >= currentMonth)
        }
        
        // Se não tem vencimento, verificar se começou no mês atual ou antes
        const inicioMonth = inicio.getMonth()
        const inicioYear = inicio.getFullYear()
        return inicioYear < currentYear || 
               (inicioYear === currentYear && inicioMonth <= currentMonth)
      })
      .map((d): Transaction => {
        const valorTotal = Number(d.valor_total)
        const valorPago = Number(d.valor_pago)
        const valorRestante = valorTotal - valorPago
        
        let valorMensal = valorRestante
        
        // Se tem parcelas, calcular valor mensal
        if (d.parcelas_total && d.parcelas_total > 0) {
          const parcelasPagas = d.parcelas_pagas || 0
          const parcelasRestantes = d.parcelas_total - parcelasPagas
          
          if (parcelasRestantes > 0) {
            valorMensal = valorRestante / parcelasRestantes
          }
        }
        
        // Usar data de vencimento se disponível, senão usar data de início
        const dataTransacao = d.data_vencimento || d.data_inicio
        
        return {
          id: d.id,
          type: 'debt',
          valor: valorMensal,
          data: dataTransacao,
          description: `${d.nome}${d.credor ? ` - ${d.credor}` : ''}`,
          badge: d.parcelas_total ? `Parcela ${(d.parcelas_pagas || 0) + 1}/${d.parcelas_total}` : 'Dívida',
          conta: d.conta,
          status: d.status === 'atrasada' ? 'atrasada' : undefined,
          isDebt: true,
        }
      })

    return [...filteredIncomes, ...filteredExpenses, ...filteredDebts].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )
  }, [incomes, expenses, debts, accountFilter, currentMonth, currentYear])

  const handleDelete = async (id: string, type: 'income' | 'expense' | 'debt') => {
    try {
      if (type === 'debt') {
        const { error } = await supabase.from('debts').delete().eq('id', id)
        if (error) throw error
        
        toast({
          title: 'Excluído!',
          description: 'Dívida excluída com sucesso.',
        })
      } else {
        const table = type === 'income' ? 'incomes' : 'expenses'
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) throw error

        toast({
          title: 'Excluído!',
          description: `${type === 'income' ? 'Entrada' : 'Gasto'} excluído com sucesso.`,
        })
      }

      onRefresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-4">
        <div className="py-10 text-center text-textTertiary">
          Nenhuma transação encontrada.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl">
      <div className="pb-3 px-4 pt-4">
        <h3 className="text-base font-medium text-textPrimary">Transações</h3>
      </div>
      <div className="space-y-2 px-4 pb-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-surfaceMuted transition-fast"
          >
            {transaction.type === 'income' ? (
              <ArrowUpCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-textPrimary text-sm truncate flex-1">
                  {transaction.description}
                </p>
                <span className={`font-semibold text-sm whitespace-nowrap flex-shrink-0 ${
                  transaction.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.valor)}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-textTertiary">
                  {formatDate(transaction.data)}
                </span>
                <Badge variant="outline" className="text-xs border-0 text-textTertiary">
                  {transaction.badge}
                </Badge>
                <Badge variant="outline" className="text-xs border-0 text-textTertiary">
                  {transaction.conta}
                </Badge>
                {transaction.status === 'pendente' && (
                  <Badge variant="outline" className="text-xs border-0 text-warning">
                    Pendente
                  </Badge>
                )}
                {transaction.status === 'atrasada' && (
                  <Badge variant="outline" className="text-xs border-0 text-error">
                    Atrasada
                  </Badge>
                )}
                {transaction.isDebt && (
                  <Badge variant="outline" className="text-xs border-0 text-error">
                    Dívida
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id, transaction.type)}
                  className="h-7 w-7 hover:bg-surfaceElevated ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-textTertiary" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
