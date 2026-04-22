import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

interface OutcomeModalProps {
  open: boolean
  onClose: () => void
  interviewId: string
  candidateName: string
  onSuccess: () => void
}

const OutcomeModal = ({
  open,
  onClose,
  interviewId,
  candidateName,
  onSuccess,
}: OutcomeModalProps) => {
  const [loading, setLoading] = useState(false)

  const handleOutcome = async (outcome: 'pass' | 'fail' | 'no_show') => {
    setLoading(true)
    try {
      await api.patch(`/interviews/${interviewId}/outcome`, { outcome })
      toast.success('Résultat enregistré.')
      onSuccess()
      onClose()
    } catch {
      toast.error("Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Résultat de l&apos;entretien — {candidateName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Sélectionnez le résultat de l&apos;entretien
          </p>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 py-4">
          <Button
            className="flex-1 bg-okl border border-[var(--ok-b)] text-ok text-sm font-semibold py-6 hover:bg-okl"
            disabled={loading}
            onClick={() => handleOutcome('pass')}
          >
            Retenu
          </Button>

          <Button
            className="flex-1 bg-errl border border-[var(--err-b)] text-err text-sm font-semibold py-6 hover:bg-errl"
            disabled={loading}
            onClick={() => handleOutcome('fail')}
          >
            Refusé
          </Button>

          <Button
            className="flex-1 bg-secondary border border-input text-muted-foreground text-sm font-semibold py-6 hover:bg-card2"
            disabled={loading}
            onClick={() => handleOutcome('no_show')}
          >
            Absent
          </Button>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OutcomeModal
