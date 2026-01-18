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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Entrada</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fonte">Fonte</Label>
            <Input
              id="fonte"
              placeholder="Ex: Salário, Freelance..."
              value={formData.fonte}
              onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projeto">Projeto</Label>
            <Input
              id="projeto"
              placeholder="Ex: Morphion, Freelance..."
              value={formData.projeto}
              onChange={(e) => setFormData({ ...formData, projeto: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'recorrente' | 'pontual') =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pontual</SelectItem>
                  <SelectItem value="recorrente">Recorrente</SelectItem>
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
