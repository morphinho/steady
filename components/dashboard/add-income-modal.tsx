'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
