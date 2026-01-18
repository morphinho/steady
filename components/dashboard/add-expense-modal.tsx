'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AddExpenseForm from './add-expense-form'

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function AddExpenseModal({
  open,
  onClose,
  onSuccess,
  userId,
}: AddExpenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Novo Gasto</DialogTitle>
        </DialogHeader>
        <AddExpenseForm userId={userId} onSuccess={onSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
