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

interface AddDebtModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddDebtModal({
  open,
  onClose,
  onSuccess,
}: AddDebtModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    credor: '',
    valor_total: '',
    valor_pago: '0',
    data_inicio: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    taxa_juros: '0',
    status: 'aberta' as 'aberta' | 'paga' | 'atrasada',
    conta: 'pessoal' as 'pessoal' | 'negocio',
    parcelas_total: '',
    parcelas_pagas: '0',
    observacoes: '',
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('debts').insert([
        {
          user_id: null,
          nome: formData.nome,
          credor: formData.credor,
          valor_total: parseFloat(formData.valor_total),
          valor_pago: parseFloat(formData.valor_pago),
          data_inicio: formData.data_inicio,
          data_vencimento: formData.data_vencimento || null,
          taxa_juros: parseFloat(formData.taxa_juros),
          status: formData.status,
          conta: formData.conta,
          parcelas_total: formData.parcelas_total ? parseInt(formData.parcelas_total) : null,
          parcelas_pagas: formData.parcelas_pagas ? parseInt(formData.parcelas_pagas) : 0,
          observacoes: formData.observacoes || null,
        },
      ])

      if (error) throw error

      toast({
        title: 'Dívida criada!',
        description: 'A dívida foi adicionada com sucesso.',
      })

      setFormData({
        nome: '',
        credor: '',
        valor_total: '',
        valor_pago: '0',
        data_inicio: new Date().toISOString().split('T')[0],
        data_vencimento: '',
        taxa_juros: '0',
        status: 'aberta',
        conta: 'pessoal',
        parcelas_total: '',
        parcelas_pagas: '0',
        observacoes: '',
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Dívida</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Dívida</Label>
            <Input
              id="nome"
              placeholder="Ex: Empréstimo Banco, Cartão de Crédito..."
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credor">Credor</Label>
            <Input
              id="credor"
              placeholder="Ex: Banco X, João Silva..."
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
                placeholder="0.00"
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
                placeholder="0.00"
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
                placeholder="Ex: 12"
                value={formData.parcelas_total}
                onChange={(e) => setFormData({ ...formData, parcelas_total: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxa_juros">Taxa de Juros (%)</Label>
              <Input
                id="taxa_juros"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.taxa_juros}
                onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Notas adicionais..."
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
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
