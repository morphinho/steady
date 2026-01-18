'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, Trash2, Pencil } from 'lucide-react'
import UpdateDebtModal from './update-debt-modal'

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

interface TransactionDetailModalProps {
  open: boolean
  onClose: () => void
  transaction: {
    id: string
    type: 'income' | 'expense' | 'debt'
    valor: number
    data: string
    description: string
    badge: string
    conta: string
    status?: string
    isDebt?: boolean
  } | null
  income?: Income
  expense?: Expense
  debt?: Debt
  onRefresh: () => void
}

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
  income,
  expense,
  debt,
  onRefresh,
}: TransactionDetailModalProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showUpdateDebtModal, setShowUpdateDebtModal] = useState(false)

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

  const handleMarkAsPaid = async () => {
    if (!transaction) return

    setLoading(true)
    try {
      if (transaction.type === 'expense' && expense) {
        const { error } = await supabase
          .from('expenses')
          .update({ status: 'pago' })
          .eq('id', expense.id)

        if (error) throw error

        toast({
          title: 'Marcado como pago!',
          description: 'O gasto foi marcado como pago.',
        })
      } else if (transaction.type === 'debt' && debt) {
        // Para dívidas, atualizar valor pago e status
        const valorTotal = Number(debt.valor_total)
        const valorPago = Number(debt.valor_pago)
        const valorRestante = valorTotal - valorPago

        // Se tem parcelas, incrementar parcelas pagas
        let parcelasPagas = debt.parcelas_pagas || 0
        if (debt.parcelas_total && debt.parcelas_total > 0) {
          parcelasPagas = Math.min(parcelasPagas + 1, debt.parcelas_total)
        }

        // Calcular novo valor pago
        let novoValorPago = valorTotal
        if (debt.parcelas_total && debt.parcelas_total > 0) {
          const valorPorParcela = valorTotal / debt.parcelas_total
          novoValorPago = valorPorParcela * parcelasPagas
        }

        const novoStatus = novoValorPago >= valorTotal ? 'paga' : debt.status

        const { error } = await supabase
          .from('debts')
          .update({
            valor_pago: novoValorPago,
            parcelas_pagas: parcelasPagas,
            status: novoStatus,
          })
          .eq('id', debt.id)

        if (error) throw error

        toast({
          title: 'Parcela paga!',
          description: 'A parcela da dívida foi marcada como paga.',
        })
      }

      onRefresh()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return

    setLoading(true)
    try {
      if (transaction.type === 'debt') {
        const { error } = await supabase.from('debts').delete().eq('id', transaction.id)
        if (error) throw error
        toast({
          title: 'Excluído!',
          description: 'Dívida excluída com sucesso.',
        })
      } else {
        const table = transaction.type === 'income' ? 'incomes' : 'expenses'
        const { error } = await supabase.from(table).delete().eq('id', transaction.id)
        if (error) throw error
        toast({
          title: 'Excluído!',
          description: `${transaction.type === 'income' ? 'Entrada' : 'Gasto'} excluído com sucesso.`,
        })
      }

      onRefresh()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!transaction) return null

  const canMarkAsPaid =
    (transaction.type === 'expense' && expense?.status === 'pendente') ||
    (transaction.type === 'debt' && debt && Number(debt.valor_pago) < Number(debt.valor_total))

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {transaction.type === 'income' ? 'Detalhes da Entrada' : 
               transaction.type === 'expense' ? 'Detalhes do Gasto' : 
               'Detalhes da Dívida'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo e Valor */}
            <div className="flex items-center gap-3 pb-3 border-b border-surfaceMuted">
              {transaction.type === 'income' ? (
                <ArrowUpCircle className="w-8 h-8 text-success flex-shrink-0" />
              ) : (
                <ArrowDownCircle className="w-8 h-8 text-error flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-textSecondary mb-1">Valor</p>
                <p className={`text-xl font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-error'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.valor)}
                </p>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <p className="text-xs text-textSecondary mb-1">
                {transaction.type === 'income' ? 'Fonte' : 
                 transaction.type === 'expense' ? 'Categoria' : 
                 'Nome'}
              </p>
              <p className="text-sm font-medium text-textPrimary">{transaction.description}</p>
            </div>

            {/* Informações específicas */}
            {transaction.type === 'income' && income && (
              <>
                {income.projeto && (
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Projeto</p>
                    <p className="text-sm text-textPrimary">{income.projeto}</p>
                  </div>
                )}
              </>
            )}

            {transaction.type === 'expense' && expense && (
              <>
                {expense.descricao && (
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Descrição</p>
                    <p className="text-sm text-textPrimary">{expense.descricao}</p>
                  </div>
                )}
              </>
            )}

            {transaction.type === 'debt' && debt && (
              <>
                <div>
                  <p className="text-xs text-textSecondary mb-1">Credor</p>
                  <p className="text-sm text-textPrimary">{debt.credor}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Valor Total</p>
                    <p className="text-sm font-medium text-textPrimary">
                      {formatCurrency(Number(debt.valor_total))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Valor Pago</p>
                    <p className="text-sm font-medium text-success">
                      {formatCurrency(Number(debt.valor_pago))}
                    </p>
                  </div>
                </div>
                {debt.parcelas_total && (
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Parcelas</p>
                    <p className="text-sm text-textPrimary">
                      {debt.parcelas_pagas || 0} / {debt.parcelas_total}
                    </p>
                  </div>
                )}
                {debt.observacoes && (
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Observações</p>
                    <p className="text-sm text-textPrimary">{debt.observacoes}</p>
                  </div>
                )}
              </>
            )}

            {/* Data */}
            <div>
              <p className="text-xs text-textSecondary mb-1">
                {transaction.type === 'debt' && debt?.data_vencimento ? 'Data de Vencimento' : 'Data'}
              </p>
              <p className="text-sm text-textPrimary">{formatDate(transaction.data)}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
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
              {transaction.type === 'expense' && expense?.status === 'pago' && (
                <Badge variant="outline" className="text-xs border-0 text-success">
                  Pago
                </Badge>
              )}
              {transaction.type === 'debt' && debt?.status === 'paga' && (
                <Badge variant="outline" className="text-xs border-0 text-success">
                  Paga
                </Badge>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2 pt-3 border-t border-surfaceMuted">
              {canMarkAsPaid && (
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="w-full bg-success hover:bg-success/90 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {transaction.type === 'debt' ? 'Marcar Parcela como Paga' : 'Marcar como Pago'}
                </Button>
              )}
              {transaction.type === 'debt' && debt && (
                <Button
                  onClick={() => {
                    setShowUpdateDebtModal(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar Dívida
                </Button>
              )}
              <Button
                onClick={handleDelete}
                disabled={loading}
                variant="outline"
                className="w-full text-error border-error hover:bg-error/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {debt && (
        <UpdateDebtModal
          open={showUpdateDebtModal}
          onClose={() => setShowUpdateDebtModal(false)}
          onSuccess={() => {
            setShowUpdateDebtModal(false)
            onRefresh()
            onClose()
          }}
          debt={debt}
        />
      )}
    </>
  )
}

