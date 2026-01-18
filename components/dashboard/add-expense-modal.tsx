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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Tecnologia',
  'Serviços',
  'Impostos',
  'Outros',
]

export default function AddExpenseModal({
  open,
  onClose,
  onSuccess,
  userId,
}: AddExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    descricao: '',
    tipo: 'variavel' as 'fixo' | 'variavel',
    status: 'pago' as 'pago' | 'pendente',
    conta: 'pessoal' as 'pessoal' | 'negocio',
    recorrente: false,
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          user_id: userId,
          valor: parseFloat(formData.valor),
          data: formData.data,
          categoria: formData.categoria,
          descricao: formData.descricao || null,
          tipo: formData.tipo,
          status: formData.status,
          conta: formData.conta,
          recorrente: formData.recorrente,
        },
      ])

      if (error) throw error

      toast({
        title: 'Gasto criado!',
        description: 'O gasto foi adicionado com sucesso.',
      })

      setFormData({
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
        descricao: '',
        tipo: 'variavel',
        status: 'pago',
        conta: 'pessoal',
        recorrente: false,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Novo Gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="valor" className="text-xs">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="h-9 text-sm"
              autoFocus={false}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="data" className="text-xs">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              required
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-xs">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Opcional..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'fixo' | 'variavel') =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variavel">Variável</SelectItem>
                  <SelectItem value="fixo">Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pago' | 'pendente') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id="recorrente"
              checked={formData.recorrente}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, recorrente: checked as boolean })
              }
            />
            <Label htmlFor="recorrente" className="cursor-pointer text-xs">
              Gasto recorrente
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
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
