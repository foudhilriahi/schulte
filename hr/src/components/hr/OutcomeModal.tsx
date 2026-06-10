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

  const buildIdempotencyKey = (outcome: 'pass' | 'fail' | 'no_show') => {
    return `outcome:${interviewId}:${outcome}`
  }

  const handleOutcome = async (outcome: 'pass' | 'fail' | 'no_show') => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error("Connexion internet indisponible. Vérifiez le réseau puis réessayez.")
      return
    }

    setLoading(true)
    try {
      await api.patch(
        `/interviews/${interviewId}/outcome`,
        { outcome },
        {
          headers: {
            'x-idempotency-key': buildIdempotencyKey(outcome),
          },
        },
      )
      toast.success('Résultat enregistré.')
      onSuccess()
      onClose()
    } catch (error: any) {
      const status = error?.response?.status
      const errorMsg =
        status === 409
          ? "Une requête identique est déjà en cours. Patientez quelques secondes."
          : error?.response?.data?.error || "Erreur lors de l'enregistrement."
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink">
            Résultat de l&apos;entretien — {candidateName}
          </DialogTitle>
          <p className="pt-1 text-[12px] text-ink3">
            Sélectionnez le résultat de l&apos;entretien
          </p>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 py-4">
          <Button
            className="flex-1 border border-[var(--ok-b)] bg-okl py-6 text-[12px] text-ok hover:bg-okl"
            disabled={loading}
            onClick={() => handleOutcome('pass')}
          >
            Retenu
          </Button>

          <Button
            className="flex-1 border border-[var(--err-b)] bg-errl py-6 text-[12px] text-err hover:bg-errl"
            disabled={loading}
            onClick={() => handleOutcome('fail')}
          >
            Refusé
          </Button>

          <Button
            className="flex-1 border border-input bg-secondary py-6 text-[12px] text-ink3 hover:bg-card2"
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
