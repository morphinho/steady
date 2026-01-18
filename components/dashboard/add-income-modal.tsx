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
import AddIncomeForm from './add-income-form'

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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Entrada</DialogTitle>
        </DialogHeader>
        <AddIncomeForm userId={userId} onSuccess={onSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
