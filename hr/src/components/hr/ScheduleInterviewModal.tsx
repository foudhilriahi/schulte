import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

interface ScheduleInterviewModalProps {
  open: boolean
  onClose: () => void
  applicationId: string
  candidateName: string
  onSuccess: () => void
  /** Pass true when an interview already exists (reschedule flow) */
  isReschedule?: boolean
  /** Pass the existing outcome if already set — will block scheduling entirely */
  existingOutcome?: 'pass' | 'fail' | 'no_show' | null
  /** Pass true when the existing interview date is in the past with no outcome */
  isPastWithoutOutcome?: boolean
}

const outcomeLabels: Record<string, string> = {
  pass: 'Retenu',
  fail: 'Refusé',
  no_show: 'Absent',
}

const ScheduleInterviewModal = ({
  open,
  onClose,
  applicationId,
  candidateName,
  onSuccess,
  isReschedule = false,
  existingOutcome = null,
  isPastWithoutOutcome = false,
}: ScheduleInterviewModalProps) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('on-site')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  /** Reschedule confirm step: null = form, 'confirm' = confirm dialog */
  const [step, setStep] = useState<'form' | 'confirm'>('form')

  const buildIdempotencyKey = (scheduledAtIso: string) => {
    const normalizedLocation = location.trim().toLowerCase().slice(0, 48)
    const normalizedType = type.trim().toLowerCase()
    const normalizedNotes = notes
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .slice(0, 64) || 'none'
    return `schedule:${applicationId}:${scheduledAtIso}:${normalizedType}:${normalizedLocation}:${normalizedNotes}`
  }

  const resetForm = () => {
    setDate('')
    setTime('')
    setLocation('')
    setType('on-site')
    setNotes('')
    setStep('form')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Called when user clicks "Planifier" — if reschedule, show confirm step first
  const handlePlanifierClick = () => {
    if (!date || !time || !location) {
      toast.error('Veuillez remplir tous les champs obligatoires (date, heure, lieu).')
      return
    }
    const scheduledAtDate = new Date(`${date}T${time}:00`)
    if (Number.isNaN(scheduledAtDate.getTime())) {
      toast.error('Date/heure invalide.')
      return
    }
    if (scheduledAtDate.getTime() < Date.now() + 5 * 60 * 1000) {
      toast.error("La date de l'entretien doit être au moins 5 minutes dans le futur.")
      return
    }
    if (isReschedule) {
      setStep('confirm')
    } else {
      submitInterview()
    }
  }

  const submitInterview = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error('Connexion internet indisponible. Vérifiez le réseau puis réessayez.')
      return
    }

    setLoading(true)
    try {
      const scheduledAtDate = new Date(`${date}T${time}:00`)
      const scheduledAt = scheduledAtDate.toISOString()
      const idempotencyKey = buildIdempotencyKey(scheduledAt)

      await api.post(
        '/interviews',
        { applicationId, scheduledAt, location, type, notes },
        { headers: { 'x-idempotency-key': idempotencyKey } },
      )
      toast.success(isReschedule ? 'Entretien replanifié avec succès.' : 'Entretien planifié avec succès.')
      resetForm()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Interview scheduling error:', error)
      const status = error?.response?.status
      const serverMsg = error?.response?.data?.error
      if (status === 409 && serverMsg?.includes('résultat')) {
        toast.error('Impossible de replanifier : le résultat de cet entretien a déjà été enregistré.')
      } else if (status === 409 && serverMsg?.includes('absent')) {
        toast.error("L'entretien précédent est passé sans résultat. Marquez-le absent avant de replanifier.")
      } else if (status === 409) {
        toast.error('Une requête identique est déjà en cours. Patientez quelques secondes.')
      } else {
        toast.error(serverMsg || 'Erreur lors de la planification.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Blocked: outcome already set ──────────────────────────────────────────
  if (existingOutcome) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-ink flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-err" />
              Replanification impossible
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md border border-err/30 bg-err/10 p-4 text-[13px] text-err">
            Le résultat de cet entretien a déjà été enregistré :{' '}
            <strong>{outcomeLabels[existingOutcome] ?? existingOutcome}</strong>.
            <br />
            <span className="mt-1 block text-[12px] text-ink3">
              Un entretien conclu ne peut pas être replanifié. Si nécessaire, créez une nouvelle candidature.
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Blocked: past interview without outcome ────────────────────────────────
  if (isPastWithoutOutcome && step === 'form') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-ink flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warn" />
              Résultat requis avant replanification
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md border border-warn/30 bg-warn/10 p-4 text-[13px] text-warn">
            L'entretien précédent est passé sans résultat enregistré.
            <br />
            <span className="mt-1 block text-[12px] text-ink3">
              Marquez le candidat absent (no_show) via la page Entretiens, puis revenez replanifier.
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Reschedule confirm step ────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-ink flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warn" />
              Confirmer la replanification
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-md border border-warn/30 bg-warn/10 p-4 text-[13px] text-warn">
            Un entretien est déjà planifié pour <strong>{candidateName}</strong>.
            <br />
            <span className="mt-1 block text-[12px] text-ink3">
              Le remplacer annulera l'ancien créneau. Le candidat recevra une nouvelle convocation.
              Cette action est irréversible.
            </span>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStep('form')} disabled={loading}>
              Retour
            </Button>
            <Button
              onClick={submitInterview}
              disabled={loading}
              className="bg-warn text-white hover:bg-warn/90"
            >
              {loading ? 'Replanification...' : 'Confirmer la replanification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Normal form ────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {isReschedule ? 'Replanifier l\'entretien' : 'Planifier un entretien'} — {candidateName}
          </DialogTitle>
          {isReschedule && (
            <p className="text-[11px] text-warn flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Un entretien existe déjà — vous êtes en mode replanification.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-date">
              Date <span className="text-err">*</span>
            </Label>
            <Input
              id="interview-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-time">
              Heure <span className="text-err">*</span>
            </Label>
            <Input
              id="interview-time"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-location">
              Lieu <span className="text-err">*</span>
            </Label>
            <Input
              id="interview-location"
              type="text"
              placeholder="Ex: Salle de réunion A, Bouarada Plant..."
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type d'entretien</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-site">Présentiel</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="phone">Téléphonique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-notes">
              Notes <span className="text-[10px] text-ink3">(optionnel)</span>
            </Label>
            <Textarea
              id="interview-notes"
              placeholder="Instructions pour le candidat, sujets à aborder..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[96px] resize-none text-[13px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handlePlanifierClick} disabled={loading}>
            {loading ? 'Planification...' : isReschedule ? 'Replanifier' : 'Planifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleInterviewModal
