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
import { api } from '@/lib/axios'
import { toast } from 'sonner'

interface ScheduleInterviewModalProps {
  open: boolean
  onClose: () => void
  applicationId: string
  candidateName: string
  onSuccess: () => void
}

const ScheduleInterviewModal = ({
  open,
  onClose,
  applicationId,
  candidateName,
  onSuccess,
}: ScheduleInterviewModalProps) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('on-site')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setDate('')
    setTime('')
    setLocation('')
    setType('on-site')
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!date || !time || !location) {
      toast.error('Veuillez remplir tous les champs obligatoires (date, heure, lieu).')
      return
    }

    setLoading(true)
    try {
      // Combine date and time into ISO datetime
      const scheduledAt = new Date(`${date}T${time}`).toISOString()
      
      await api.post('/interviews', {
        applicationId,
        scheduledAt,  // Backend expects scheduledAt (ISO datetime)
        location,
        type,
        notes,
      })
      toast.success('Entretien planifié avec succès.')
      resetForm()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Interview scheduling error:', error)
      const errorMsg = error.response?.data?.error || 'Erreur lors de la planification.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Planifier un entretien — {candidateName}
          </DialogTitle>
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
              Notes <span className="text-xs text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              id="interview-notes"
              placeholder="Instructions pour le candidat, sujets à aborder..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[80px] text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-acch"
          >
            {loading ? 'Planification...' : 'Planifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleInterviewModal
