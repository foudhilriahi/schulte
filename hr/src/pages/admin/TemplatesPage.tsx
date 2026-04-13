import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, X, ToggleLeft, ToggleRight, Lock } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { socketService } from '@/lib/socket'

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
    } catch { toast.error('Failed to load templates') }
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
        toast.error('Title FR, Title EN and Department are required')
        return
      }

      if (payload.titleFr.length < 2 || payload.titleEn.length < 2) {
        toast.error('Template titles must be at least 2 characters')
        return
      }

      if (payload.description.length < 10) {
        toast.error('Description must be at least 10 characters')
        return
      }

      await api.post('/admin/templates', {
        ...payload,
      })
      toast.success('Template created.')
      setCreateOpen(false)
      setForm({ titleFr: '', titleEn: '', contractType: 'CDI', department: '', description: '', suggestedSkills: [], skillInput: '' })
      fetchTemplates()
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Error')
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
      toast.success('Template updated.')
      setEditOpen(false)
      fetchTemplates()
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const handleToggle = async (t: any) => {
    try {
      const { data } = await api.delete(`/admin/templates/${t.id}`)
      toast.success(data?.message || 'Template status updated.')
      fetchTemplates()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
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

  return (
    <DashboardLayout title="Job Templates">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="h-9 w-64 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
            Show inactive
          </label>
        </div>
        <Button onClick={() => { setForm({ titleFr: '', titleEn: '', contractType: 'CDI', department: '', description: '', suggestedSkills: [], skillInput: '' }); setCreateOpen(true) }} className="gap-2 bg-primary hover:bg-acch">
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </div>

      <p className="mb-3 rounded-md border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
        Core templates are protected and cannot be deactivated.
      </p>

      <Card className="rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Position (FR)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reference (EN)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Skills</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No templates found.</td></tr>}
              {filtered.map((t, i) => (
                (() => {
                  const isCore = CORE_TEMPLATE_IDS.has(t.id)
                  return (
                <tr key={t.id} className={`border-b hover:bg-s2 ${i % 2 === 0 ? '' : 'bg-s2/50'}`}>
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{t.titleFr}</span>
                      {isCore && (
                        <Badge variant="outline" className="gap-1 text-[10px] border-warn/30 text-warn">
                          <Lock className="h-3 w-3" /> Core
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.titleEn || '—'}</td>
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
                    <Badge className={`text-xs ${t.isActive !== false ? 'bg-ok/14 text-ok' : 'bg-s3 text-muted-foreground'}`}>
                      {t.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
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
                        onClick={() => handleToggle(t)}
                        disabled={isCore}
                        title={isCore ? 'Core templates cannot be deactivated' : 'Toggle active status'}
                      >
                        {isCore ? (
                          <Lock className="h-4 w-4 text-warn" />
                        ) : t.isActive !== false ? (
                          <ToggleRight className="h-4 w-4 text-ok" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
                  )
                })()
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create/Edit shared modal content */}
      {[{ open: createOpen, setOpen: setCreateOpen, title: 'Create Template', action: handleCreate },
        { open: editOpen, setOpen: setEditOpen, title: 'Edit Template', action: handleEdit }].map(({ open, setOpen, title, action }) => (
        <Dialog key={title} open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
            {title === 'Edit Template' && <p className="rounded p-2 text-xs text-warn bg-warn/10 border border-warn/30">Editing will not change existing offers created from this template.</p>}
            <div className="space-y-3">
              <div><Label>Position (French)</Label><Input value={form.titleFr} onChange={e => setForm({ ...form, titleFr: e.target.value })} /></div>
              <div><Label>Reference (English)</Label><Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contract Type</Label>
                  <select
                    value={form.contractType}
                    onChange={e => setForm({ ...form, contractType: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                  </select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="min-h-[100px]" /></div>
              <div>
                <Label>Suggested Skills</Label>
                <div className="flex gap-2">
                  <Input value={form.skillInput} onChange={e => setForm({ ...form, skillInput: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="Type + Enter" />
                  <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.suggestedSkills.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1">{s}<X className="h-3 w-3 cursor-pointer" onClick={() => setForm({ ...form, suggestedSkills: form.suggestedSkills.filter(sk => sk !== s) })} /></Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={action} className="bg-primary">{title === 'Create Template' ? 'Create' : 'Save'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </DashboardLayout>
  )
}

export default TemplatesPage
