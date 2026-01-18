'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
} from 'lucide-react'
import UpdateDebtModal from './update-debt-modal'

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

interface DebtsListProps {
  debts: Debt[]
  accountFilter: 'all' | 'pessoal' | 'negocio'
  onRefresh: () => void
}

export default function DebtsList({
  debts,
  accountFilter,
  onRefresh,
}: DebtsListProps) {
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null)
  const [debtToUpdate, setDebtToUpdate] = useState<Debt | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const filteredDebts = debts.filter((debt) =>
    accountFilter === 'all' ? true : debt.conta === accountFilter
  )

  const handleDelete = async () => {
    if (!debtToDelete) return

    try {
      const { error } = await supabase.from('debts').delete().eq('id', debtToDelete)

      if (error) throw error

      toast({
        title: 'Dívida excluída!',
        description: 'A dívida foi removida com sucesso.',
      })

      onRefresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDebtToDelete(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { icon: any; label: string; color: string }> = {
      aberta: { icon: Clock, label: 'Aberta', color: 'text-textTertiary' },
      paga: { icon: CheckCircle, label: 'Paga', color: 'text-success' },
      atrasada: { icon: AlertCircle, label: 'Atrasada', color: 'text-error' },
    }

    const config = variants[status] || variants.aberta
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`flex items-center gap-1 w-fit border-0 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (filteredDebts.length === 0) {
    return (
      <div className="bg-surface rounded-2xl p-4">
        <div className="py-12 text-center">
          <p className="text-textTertiary">Nenhuma dívida cadastrada</p>
        </div>
      </div>
    )
  }

  const totalDebts = filteredDebts.reduce((sum, d) => sum + Number(d.valor_total), 0)
  const totalPaid = filteredDebts.reduce((sum, d) => sum + Number(d.valor_pago), 0)
  const totalRemaining = totalDebts - totalPaid

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <div className="bg-surface rounded-2xl p-3 md:p-4">
          <div className="pb-2 md:pb-3">
            <p className="text-xs font-medium text-textSecondary">
              Total em Dívidas
            </p>
          </div>
          <div>
            <div className="text-base md:text-xl font-semibold text-textPrimary break-words">
              {formatCurrency(totalDebts)}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-3 md:p-4">
          <div className="pb-2 md:pb-3">
            <p className="text-xs font-medium text-textSecondary">
              Total Pago
            </p>
          </div>
          <div>
            <div className="text-base md:text-xl font-semibold text-success break-words">
              {formatCurrency(totalPaid)}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-3 md:p-4">
          <div className="pb-2 md:pb-3">
            <p className="text-xs font-medium text-textSecondary">
              Falta Pagar
            </p>
          </div>
          <div>
            <div className={`text-base md:text-xl font-semibold break-words ${
              totalRemaining > 0 ? 'text-error' : 'text-success'
            }`}>
              {formatCurrency(totalRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDebts.map((debt) => {
          const percentualPago = (Number(debt.valor_pago) / Number(debt.valor_total)) * 100
          const valorRestante = Number(debt.valor_total) - Number(debt.valor_pago)

          return (
            <div key={debt.id} className="bg-surface rounded-2xl p-4">
              <div className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-medium text-textPrimary">{debt.nome}</h3>
                      {getStatusBadge(debt.status)}
                      <Badge variant="outline" className="border-0 text-textTertiary">{debt.conta}</Badge>
                    </div>
                    <p className="text-sm text-textSecondary">
                      Credor: <span className="font-medium text-textPrimary">{debt.credor}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDebtToUpdate(debt)}
                      className="h-8 w-8 hover:bg-surfaceElevated"
                    >
                      <Pencil className="w-4 h-4 text-textTertiary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDebtToDelete(debt.id)}
                      className="h-8 w-8 hover:bg-surfaceElevated"
                    >
                      <Trash2 className="w-4 h-4 text-textTertiary" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="text-textSecondary mb-1 text-xs">Valor Total</p>
                    <p className="font-semibold text-textPrimary text-xs md:text-sm break-words">
                      {formatCurrency(Number(debt.valor_total))}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-textSecondary mb-1 text-xs">Já Pago</p>
                    <p className="font-semibold text-success text-xs md:text-sm break-words">
                      {formatCurrency(Number(debt.valor_pago))}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-textSecondary mb-1 text-xs">Falta Pagar</p>
                    <p className={`font-semibold text-xs md:text-sm break-words ${
                      valorRestante > 0 ? 'text-error' : 'text-success'
                    }`}>
                      {formatCurrency(valorRestante)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-textSecondary mb-1 text-xs">Taxa de Juros</p>
                    <p className="font-semibold text-textPrimary text-xs md:text-sm">
                      {Number(debt.taxa_juros).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-textSecondary">Progresso do Pagamento</span>
                    <span className="font-semibold text-textPrimary">
                      {percentualPago.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-surfaceMuted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        debt.status === 'paga'
                          ? 'bg-success'
                          : debt.status === 'atrasada'
                          ? 'bg-error'
                          : percentualPago >= 50
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(percentualPago, 100)}%` }}
                    />
                  </div>
                </div>

                {debt.parcelas_total && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-textTertiary" />
                    <span className="text-textSecondary">
                      Parcelas: <span className="font-medium text-textPrimary">
                        {debt.parcelas_pagas}/{debt.parcelas_total}
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-textTertiary" />
                    <span className="text-textSecondary">
                      Início: <span className="font-medium text-textPrimary">
                        {formatDate(debt.data_inicio)}
                      </span>
                    </span>
                  </div>
                  {debt.data_vencimento && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-textTertiary" />
                      <span className="text-textSecondary">
                        Vencimento: <span className="font-medium text-slate-900">
                          {formatDate(debt.data_vencimento)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {debt.observacoes && (
                  <div className="bg-surfaceMuted p-3 rounded-xl">
                    <p className="text-sm text-textSecondary">{debt.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!debtToDelete} onOpenChange={() => setDebtToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir dívida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A dívida será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpdateDebtModal
        open={!!debtToUpdate}
        onClose={() => setDebtToUpdate(null)}
        onSuccess={onRefresh}
        debt={debtToUpdate}
      />
    </>
  )
}
