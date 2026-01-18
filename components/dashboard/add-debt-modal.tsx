'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AddDebtForm from './add-debt-form'

interface AddDebtModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function AddDebtModal({
  open,
  onClose,
  onSuccess,
  userId,
}: AddDebtModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Dívida</DialogTitle>
        </DialogHeader>
        <AddDebtForm userId={userId} onSuccess={onSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
