import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const [form, setForm] = useState({ title: '', titleEn: '', description: '', suggestedSkills: [] as string[], skillInput: '' })

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/admin/templates')
      setTemplates(data)
    } catch { toast.error('Failed to load templates') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleCreate = async () => {
    try {
      await api.post('/admin/templates', {
        title: form.title,
        titleEn: form.titleEn,
        description: form.description,
        suggestedSkills: form.suggestedSkills,
      })
      toast.success('Template created.')
      setCreateOpen(false)
      setForm({ title: '', titleEn: '', description: '', suggestedSkills: [], skillInput: '' })
      fetchTemplates()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error')
    }
  }

  const handleEdit = async () => {
    if (!selected) return
    try {
      await api.patch(`/admin/templates/${selected.id}`, {
        title: form.title,
        titleEn: form.titleEn,
        description: form.description,
        suggestedSkills: form.suggestedSkills,
      })
      toast.success('Template updated.')
      setEditOpen(false)
      fetchTemplates()
    } catch { toast.error('Error') }
  }

  const handleToggle = async (t: any) => {
    try {
      await api.delete(`/admin/templates/${t.id}`)
      toast.success('Template status toggled.')
      fetchTemplates()
    } catch { toast.error('Error') }
  }

  const filtered = templates.filter(t => {
    if (!showInactive && t.isActive === false) return false
    return t.title?.toLowerCase().includes(search.toLowerCase()) || t.titleEn?.toLowerCase().includes(search.toLowerCase())
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="h-9 w-64 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B4A]/20" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
            Show inactive
          </label>
        </div>
        <Button onClick={() => { setForm({ title: '', titleEn: '', description: '', suggestedSkills: [], skillInput: '' }); setCreateOpen(true) }} className="gap-2 bg-[#1A2B4A] hover:bg-[#243a5e]">
          <Plus className="h-4 w-4" /> Create Template
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
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
                <tr key={t.id} className={`border-b hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.titleEn || t.title_en || '—'}</td>
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
                    <Badge className={`text-xs ${t.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {t.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelected(t)
                        setForm({
                          title: t.title,
                          titleEn: t.titleEn || t.title_en || '',
                          description: t.description || '',
                          suggestedSkills: t.suggestedSkills || t.suggested_skills || [],
                          skillInput: ''
                        })
                        setEditOpen(true)
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(t)}>
                        {t.isActive !== false ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                      </Button>
                    </div>
                  </td>
                </tr>
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
            {title === 'Edit Template' && <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Editing will not change existing offers created from this template.</p>}
            <div className="space-y-3">
              <div><Label>Position (French)</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Reference (English)</Label><Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} /></div>
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
            <DialogFooter><Button onClick={action} className="bg-[#1A2B4A]">{title === 'Create Template' ? 'Create' : 'Save'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </DashboardLayout>
  )
}

export default TemplatesPage
