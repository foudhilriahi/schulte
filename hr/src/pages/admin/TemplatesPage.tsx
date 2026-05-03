import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, X, ToggleLeft, ToggleRight, Lock, Trash2 } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { socketService } from '@/lib/socket'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const CORE_TEMPLATE_IDS = new Set([
  'planificateur-production',
  'acheteur-strategique',
  'chef-equipe-achats',
  'mecanicien-industriel',
  'operateur-machines',
  'technicien-electronique',
  'responsable-rh',
])

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<any | null>(null)
  const [isDeletingPermanent, setIsDeletingPermanent] = useState(false)

  const [form, setForm] = useState({
    titleFr: '',
    titleEn: '',
    contractType: 'CDI',
    department: '',
    description: '',
    suggestedSkills: [] as string[],
    skillInput: ''
  })

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/admin/templates')
      setTemplates(data)
    } catch { toast.error('Echec du chargement des modeles') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTemplates() }, [])

  useEffect(() => {
    const socket = socketService.getSocket()
    const refresh = () => fetchTemplates()
    socket?.on('template:updated', refresh)
    return () => {
      socket?.off('template:updated', refresh)
    }
  }, [])

  const handleCreate = async () => {
    try {
      const payload = {
        titleFr: form.titleFr.trim(),
        titleEn: form.titleEn.trim(),
        contractType: form.contractType,
        department: form.department.trim(),
        description: form.description.trim(),
        suggestedSkills: form.suggestedSkills,
      }

      if (!payload.titleFr || !payload.titleEn || !payload.department) {
        toast.error('Le titre FR, le titre EN et le departement sont obligatoires')
        return
      }

      if (payload.titleFr.length < 2 || payload.titleEn.length < 2) {
        toast.error('Les titres du modele doivent contenir au moins 2 caracteres')
        return
      }

      if (payload.description.length < 10) {
        toast.error('La description doit contenir au moins 10 caracteres')
        return
      }

      await api.post('/admin/templates', {
        ...payload,
      })
      toast.success('Modele cree.')
      setCreateOpen(false)
      setForm({ titleFr: '', titleEn: '', contractType: 'CDI', department: '', description: '', suggestedSkills: [], skillInput: '' })
      fetchTemplates()
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    try {
      const payload = {
        titleFr: form.titleFr.trim(),
        titleEn: form.titleEn.trim(),
        contractType: form.contractType,
        department: form.department.trim(),
        description: form.description.trim(),
        suggestedSkills: form.suggestedSkills,
      }

      await api.patch(`/admin/templates/${selected.id}`, {
        ...payload,
      })
      toast.success('Modele mis a jour.')
      setEditOpen(false)
      fetchTemplates()
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const handleToggle = async (t: any) => {
    try {
      const { data } = await api.delete(`/admin/templates/${t.id}`)
      toast.success(data?.message || 'Statut du modele mis a jour.')
      fetchTemplates()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
    }
  }

  const filtered = templates.filter(t => {
    if (!showInactive && t.isActive === false) return false
    return t.titleFr?.toLowerCase().includes(search.toLowerCase()) || t.titleEn?.toLowerCase().includes(search.toLowerCase())
  })

  const addSkill = () => {
    if (form.skillInput.trim() && !form.suggestedSkills.includes(form.skillInput.trim())) {
      setForm({ ...form, suggestedSkills: [...form.suggestedSkills, form.skillInput.trim()], skillInput: '' })
    }
  }

  const confirmPermanentDelete = async () => {
    if (!pendingPermanentDelete) return
    setIsDeletingPermanent(true)
    try {
      await api.delete(`/admin/templates/${pendingPermanentDelete.id}/permanent`)
      toast.success('Modèle supprimé définitivement.')
      setPermanentDeleteOpen(false)
      setPendingPermanentDelete(null)
      fetchTemplates()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la suppression définitive')
    } finally {
      setIsDeletingPermanent(false)
    }
  }

  return (
    <DashboardLayout title="Modeles d'offres">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher des modeles..." className="h-10 w-64 rounded-lg border-[1.5px] border-input bg-card px-3.5 text-[13px] text-ink placeholder:text-ink4 focus:outline-none focus:border-v focus:ring-[3px] focus:ring-vl" />
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-ink3">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
            Afficher inactifs
          </label>
        </div>
        <Button onClick={() => { setForm({ titleFr: '', titleEn: '', contractType: 'CDI', department: '', description: '', suggestedSkills: [], skillInput: '' }); setCreateOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> Creer un modele
        </Button>
      </div>

      <p className="mb-3 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
        Les modeles coeur sont proteges et ne peuvent pas etre desactives.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">Position (FR)</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">Reference (EN)</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">Competences</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">Statut</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[12px] text-ink3">Chargement...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[12px] text-ink3">Aucun modele trouve.</td></tr>}
              {filtered.map((t, i) => (
                (() => {
                  const isCore = CORE_TEMPLATE_IDS.has(t.id)
                  return (
                <tr key={t.id} className={`border-b hover:bg-card2 ${i % 2 === 0 ? '' : 'bg-card2/50'}`}>
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{t.titleFr}</span>
                      {isCore && (
                        <Badge variant="outline" className="gap-1 text-[10px] border-warn/30 text-warn">
                          <Lock className="h-3 w-3" /> Coeur
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink3">{t.titleEn || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(t.suggestedSkills || t.suggested_skills || []).slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                      {(t.suggestedSkills || t.suggested_skills || []).length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{(t.suggestedSkills || t.suggested_skills || []).length - 3}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${t.isActive !== false ? 'bg-ok/14 text-ok' : 'bg-card2 text-ink3'}`}>
                      {t.isActive !== false ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-ink3 hover:bg-card2 hover:text-ink" onClick={() => {
                        setSelected(t)
                        setForm({
                          titleFr: t.titleFr || '',
                          titleEn: t.titleEn || '',
                          contractType: t.contractType || 'CDI',
                          department: t.department || '',
                          description: t.description || '',
                          suggestedSkills: t.suggestedSkills || [],
                          skillInput: ''
                        })
                        setEditOpen(true)
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-ink3 hover:bg-card2 hover:text-err"
                        onClick={() => handleToggle(t)}
                        disabled={isCore}
                        title={isCore ? 'Les modeles coeur ne peuvent pas etre desactives' : 'Basculer le statut actif'}
                      >
                        {isCore ? (
                          <Lock className="h-4 w-4" />
                        ) : t.isActive !== false ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      {!isCore && t.isActive === false && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-ink3 hover:bg-card2 hover:text-err"
                          onClick={() => { setPendingPermanentDelete(t); setPermanentDeleteOpen(true) }}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                  )
                })()
              ))}
            </tbody>
          </table>
      </div>

      {/* Create/Edit shared modal content */}
      {[{ open: createOpen, setOpen: setCreateOpen, title: 'Creer un modele', action: handleCreate },
        { open: editOpen, setOpen: setEditOpen, title: 'Modifier le modele', action: handleEdit }].map(({ open, setOpen, title, action }) => (
        <Dialog key={title} open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
            {title === 'Modifier le modele' && <p className="rounded p-2 text-xs text-warn bg-warn/10 border border-warn/30">La modification ne change pas les offres deja creees depuis ce modele.</p>}
            <div className="space-y-3">
              <div><Label>Intitule du poste (FR)</Label><Input value={form.titleFr} onChange={e => setForm({ ...form, titleFr: e.target.value })} /></div>
              <div><Label>Reference (EN)</Label><Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type de contrat</Label>
                  <Select value={form.contractType} onValueChange={value => setForm({ ...form, contractType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Departement</Label>
                  <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="min-h-[100px]" /></div>
              <div>
                <Label>Competences suggerees</Label>
                <div className="flex gap-2">
                  <Input value={form.skillInput} onChange={e => setForm({ ...form, skillInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="Saisir + Entrer" />
                  <Button type="button" variant="outline" onClick={addSkill}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.suggestedSkills.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1">{s}<X className="h-3 w-3 cursor-pointer" onClick={() => setForm({ ...form, suggestedSkills: form.suggestedSkills.filter(sk => sk !== s) })} /></Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={action}>{title === 'Creer un modele' ? 'Creer' : 'Enregistrer'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      <AlertDialog
        open={permanentDeleteOpen}
        onOpenChange={(open) => {
          setPermanentDeleteOpen(open)
          if (!open) setPendingPermanentDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ce modèle ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPermanentDelete
                ? `Le modèle "${pendingPermanentDelete.titleFr}" sera supprimé de manière irréversible. Les offres existantes créées depuis ce modèle ne seront pas affectées.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPermanentDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-err hover:bg-err/90"
              disabled={isDeletingPermanent}
            >
              {isDeletingPermanent ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default TemplatesPage
