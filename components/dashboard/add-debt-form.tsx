'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { useRouter } from 'next/navigation'

interface AddDebtFormProps {
  userId: string
  onSuccess?: () => void
  onClose?: () => void
  isPage?: boolean
}

export default function AddDebtForm({
  userId,
  onSuccess,
  onClose,
  isPage = false,
}: AddDebtFormProps) {
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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('debts').insert([
        {
          user_id: userId,
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

      if (isPage) {
        router.push('/dashboard')
      } else {
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
        onSuccess?.()
        onClose?.()
      }
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="nome" className="text-xs">Nome da Dívida</Label>
        <Input
          id="nome"
          placeholder="Ex: Empréstimo Banco..."
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          className="h-9 text-sm"
          autoFocus={false}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="credor" className="text-xs">Credor</Label>
        <Input
          id="credor"
          placeholder="Ex: Banco X, João Silva..."
          value={formData.credor}
          onChange={(e) => setFormData({ ...formData, credor: e.target.value })}
          className="h-9 text-sm"
          autoFocus={false}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="valor_total" className="text-xs">Valor Total</Label>
          <Input
            id="valor_total"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.valor_total}
            onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
            className="h-9 text-sm"
            autoFocus={false}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valor_pago" className="text-xs">Já Pago</Label>
          <Input
            id="valor_pago"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.valor_pago}
            onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
            className="h-9 text-sm"
            autoFocus={false}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_inicio" className="text-xs">Data de Início</Label>
        <Input
          id="data_inicio"
          type="date"
          value={formData.data_inicio}
          onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
          className="h-9 text-sm w-full"
          style={{ fontSize: '16px', maxWidth: '100%' }}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_vencimento" className="text-xs">Data de Vencimento (opcional)</Label>
        <Input
          id="data_vencimento"
          type="date"
          value={formData.data_vencimento}
          onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
          className="h-9 text-sm w-full"
          style={{ fontSize: '16px', maxWidth: '100%' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="parcelas_total" className="text-xs">Parcelas</Label>
          <Input
            id="parcelas_total"
            type="number"
            placeholder="Ex: 12"
            value={formData.parcelas_total}
            onChange={(e) => setFormData({ ...formData, parcelas_total: e.target.value })}
            className="h-9 text-sm"
            autoFocus={false}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="taxa_juros" className="text-xs">Juros (%)</Label>
          <Input
            id="taxa_juros"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.taxa_juros}
            onChange={(e) => setFormData({ ...formData, taxa_juros: e.target.value })}
            className="h-9 text-sm"
            autoFocus={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'aberta' | 'paga' | 'atrasada') =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="paga">Paga</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Conta</Label>
          <Select
            value={formData.conta}
            onValueChange={(value: 'pessoal' | 'negocio') =>
              setFormData({ ...formData, conta: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pessoal">Pessoal</SelectItem>
              <SelectItem value="negocio">Negócio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes" className="text-xs">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          placeholder="Notas adicionais..."
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={2}
          className="text-sm resize-none"
          autoFocus={false}
        />
      </div>

      <div className="flex gap-2 pt-2">
        {isPage && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        {!isPage && (
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={loading} className="flex-1">
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

