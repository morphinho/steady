'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

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

interface UpdateDebtModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  debt: Debt | null
}

export default function UpdateDebtModal({
  open,
  onClose,
  onSuccess,
  debt,
}: UpdateDebtModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    credor: '',
    valor_total: '',
    valor_pago: '',
    data_inicio: '',
    data_vencimento: '',
    taxa_juros: '',
    status: 'aberta' as 'aberta' | 'paga' | 'atrasada',
    conta: 'pessoal' as 'pessoal' | 'negocio',
    parcelas_total: '',
    parcelas_pagas: '',
    observacoes: '',
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (debt) {
      setFormData({
        nome: debt.nome,
        credor: debt.credor,
        valor_total: debt.valor_total.toString(),
        valor_pago: debt.valor_pago.toString(),
        data_inicio: debt.data_inicio,
        data_vencimento: debt.data_vencimento || '',
        taxa_juros: debt.taxa_juros.toString(),
        status: debt.status,
        conta: debt.conta,
        parcelas_total: debt.parcelas_total?.toString() || '',
        parcelas_pagas: debt.parcelas_pagas?.toString() || '0',
        observacoes: debt.observacoes || '',
      })
    }
  }, [debt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debt) return

    setLoading(true)

    try {
      const valorPago = parseFloat(formData.valor_pago)
      const valorTotal = parseFloat(formData.valor_total)

      let newStatus = formData.status
      if (valorPago >= valorTotal) {
        newStatus = 'paga'
      } else if (formData.data_vencimento) {
        const vencimento = new Date(formData.data_vencimento)
        const hoje = new Date()
        if (vencimento < hoje && valorPago < valorTotal) {
          newStatus = 'atrasada'
        } else {
          newStatus = 'aberta'
        }
      }

      const { error } = await supabase
        .from('debts')
        .update({
          nome: formData.nome,
          credor: formData.credor,
          valor_total: valorTotal,
          valor_pago: valorPago,
          data_inicio: formData.data_inicio,
          data_vencimento: formData.data_vencimento || null,
          taxa_juros: parseFloat(formData.taxa_juros),
          status: newStatus,
          conta: formData.conta,
          parcelas_total: formData.parcelas_total ? parseInt(formData.parcelas_total) : null,
          parcelas_pagas: formData.parcelas_pagas ? parseInt(formData.parcelas_pagas) : 0,
          observacoes: formData.observacoes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', debt.id)

      if (error) throw error

      toast({
        title: 'Dívida atualizada!',
        description: 'As informações foram atualizadas com sucesso.',
      })

      onSuccess()
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

  const handleAddPayment = () => {
    const currentPaid = parseFloat(formData.valor_pago) || 0
    const total = parseFloat(formData.valor_total) || 0
    const remaining = total - currentPaid

    const paymentAmount = prompt(`Quanto deseja pagar? (Falta: R$ ${remaining.toFixed(2)})`)
    if (paymentAmount) {
      const amount = parseFloat(paymentAmount)
      if (!isNaN(amount) && amount > 0) {
        const newPaid = currentPaid + amount
        setFormData({
          ...formData,
          valor_pago: Math.min(newPaid, total).toFixed(2),
          parcelas_pagas: formData.parcelas_total
            ? Math.min(
                (parseInt(formData.parcelas_pagas) || 0) + 1,
                parseInt(formData.parcelas_total)
              ).toString()
            : formData.parcelas_pagas
        })
      }
    }
  }

  if (!debt) return null

  const valorRestante = parseFloat(formData.valor_total) - parseFloat(formData.valor_pago)
  const percentualPago = (parseFloat(formData.valor_pago) / parseFloat(formData.valor_total)) * 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atualizar Dívida</DialogTitle>
        </DialogHeader>

        <div className="bg-slate-50 p-4 rounded-lg space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Progresso do Pagamento</span>
            <span className="text-sm font-semibold text-slate-900">
              {percentualPago.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(percentualPago, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">
              Pago: R$ {parseFloat(formData.valor_pago).toFixed(2)}
            </span>
            <span className="text-red-600 font-medium">
              Falta: R$ {valorRestante.toFixed(2)}
            </span>
          </div>
          {formData.parcelas_total && (
            <div className="text-center text-sm text-slate-600">
              Parcelas: {formData.parcelas_pagas}/{formData.parcelas_total}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleAddPayment}
          className="w-full mb-4"
          variant="default"
        >
          Adicionar Pagamento
        </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Dívida</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credor">Credor</Label>
            <Input
              id="credor"
              value={formData.credor}
              onChange={(e) => setFormData({ ...formData, credor: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_total">Valor Total</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                value={formData.valor_total}
                onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_pago">Já Pago</Label>
              <Input
                id="valor_pago"
                type="number"
                step="0.01"
                value={formData.valor_pago}
                onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parcelas_total">Total de Parcelas</Label>
              <Input
                id="parcelas_total"
                type="number"
                value={formData.parcelas_total}
                onChange={(e) => setFormData({ ...formData, parcelas_total: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcelas_pagas">Parcelas Pagas</Label>
              <Input
                id="parcelas_pagas"
                type="number"
                value={formData.parcelas_pagas}
                onChange={(e) => setFormData({ ...formData, parcelas_pagas: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxa_juros">Taxa de Juros (%)</Label>
              <Input
                id="taxa_juros"
                type="number"
                step="0.01"
                value={formData.taxa_juros}
                onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'aberta' | 'paga' | 'atrasada') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conta</Label>
            <Select
              value={formData.conta}
              onValueChange={(value: 'pessoal' | 'negocio') =>
                setFormData({ ...formData, conta: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="negocio">Negócio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
