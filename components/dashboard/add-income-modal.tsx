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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface AddIncomeModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function AddIncomeModal({
  open,
  onClose,
  onSuccess,
  userId,
}: AddIncomeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    fonte: '',
    tipo: 'pontual' as 'recorrente' | 'pontual',
    projeto: '',
    conta: 'pessoal' as 'pessoal' | 'negocio',
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('incomes').insert([
        {
          user_id: userId,
          valor: parseFloat(formData.valor),
          data: formData.data,
          fonte: formData.fonte,
          tipo: formData.tipo,
          projeto: formData.projeto || null,
          conta: formData.conta,
        },
      ])

      if (error) throw error

      toast({
        title: 'Entrada criada!',
        description: 'A entrada foi adicionada com sucesso.',
      })

      setFormData({
        valor: '',
        data: new Date().toISOString().split('T')[0],
        fonte: '',
        tipo: 'pontual',
        projeto: '',
        conta: 'pessoal',
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
          <DialogTitle className="text-base">Nova Entrada</DialogTitle>
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
            <Label htmlFor="fonte" className="text-xs">Fonte</Label>
            <Input
              id="fonte"
              placeholder="Ex: Salário, Freelance..."
              value={formData.fonte}
              onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="projeto" className="text-xs">Projeto (opcional)</Label>
            <Input
              id="projeto"
              placeholder="Ex: Morphion, Freelance..."
              value={formData.projeto}
              onChange={(e) => setFormData({ ...formData, projeto: e.target.value })}
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'recorrente' | 'pontual') =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pontual</SelectItem>
                  <SelectItem value="recorrente">Recorrente</SelectItem>
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
