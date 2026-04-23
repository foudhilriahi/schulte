import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, KeyRound, UserX, UserCheck, Trash2 } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { socketService } from '@/lib/socket'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const HRAccountsPage = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [pendingDeactivate, setPendingDeactivate] = useState<any | null>(null)
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<any | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [updatingAccount, setUpdatingAccount] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', site: 'bouarada' })
  const [resetPw, setResetPw] = useState('')
  
  // Reset form on modal close
  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) setForm({ name: '', email: '', password: '', site: 'bouarada' })
  }
  
  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open)
    if (!open) setForm({ name: '', email: '', password: '', site: 'bouarada' })
  }
  
  const handleResetOpenChange = (open: boolean) => {
    setResetOpen(open)
    if (!open) setResetPw('')
  }

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/hr-accounts', { params: { includeInactive: showInactive } })
      setAccounts(data)
    } catch { toast.error('Echec du chargement des comptes RH') }
    finally { setLoading(false) }
  }, [showInactive])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  useEffect(() => {
    const socket = socketService.getSocket()
    const refresh = () => fetchAccounts()
    socket?.on('admin:hr-account:changed', refresh)
    return () => {
      socket?.off('admin:hr-account:changed', refresh)
    }
  }, [fetchAccounts])

  const handleCreate = async () => {
    const email = form.email.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      toast.error('Veuillez saisir une adresse e-mail valide (exemple : hr@schulte.tn)')
      return
    }

    const passwordOk = /^(?=.*[0-9]).{8,}$/.test(form.password)
    if (!passwordOk) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres et 1 chiffre')
      return
    }

    setCreatingAccount(true)
    try {
      await api.post('/admin/hr-accounts', { ...form, email })
      toast.success('Compte RH cree.')
      handleCreateOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Erreur lors de la creation du compte')
    } finally {
      setCreatingAccount(false)
    }
  }

  const handleEdit = async () => {
    if (!selected) return

    const payload: Record<string, string> = {}

    const normalizedName = form.name.trim()
    if (normalizedName && normalizedName !== selected.name) {
      payload.name = normalizedName
    }

    const normalizedSite = form.site
    if (normalizedSite && normalizedSite !== selected.site) {
      payload.site = normalizedSite
    }

    const normalizedEmail = form.email.trim().toLowerCase()
    if (normalizedEmail && normalizedEmail !== String(selected.email || '').toLowerCase()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      if (!emailOk) {
        toast.error('Veuillez saisir une adresse e-mail valide (exemple : hr@schulte.tn)')
        return
      }
      payload.email = normalizedEmail
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Aucun changement a enregistrer')
      return
    }

    setUpdatingAccount(true)
    try {
      await api.patch(`/admin/hr-accounts/${selected.id}`, payload)
      toast.success('Compte mis a jour.')
      handleEditOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Erreur lors de la mise a jour du compte')
    } finally {
      setUpdatingAccount(false)
    }
  }

  const handleReset = async () => {
    if (!selected) return

    const password = resetPw.trim()
    if (!password) {
      toast.error('Veuillez saisir un nouveau mot de passe')
      return
    }

    const passwordOk = /^(?=.*[0-9]).{8,}$/.test(password)
    if (!passwordOk) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres et 1 chiffre')
      return
    }

    setResettingPassword(true)
    try {
      await api.patch(`/admin/hr-accounts/${selected.id}`, { password })
      toast.success('Mot de passe reinitialise.')
      handleResetOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Erreur lors de la reinitialisation du mot de passe')
    } finally {
      setResettingPassword(false)
    }
  }

  const openDeactivateDialog = (user: any) => {
    setPendingDeactivate(user)
    setDeactivateOpen(true)
  }

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return

    try {
      await api.delete(`/admin/hr-accounts/${pendingDeactivate.id}`)
      toast.success('Compte desactive.')
      setDeactivateOpen(false)
      setPendingDeactivate(null)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Erreur lors de la desactivation du compte')
    }
  }

  const openPermanentDeleteDialog = (user: any) => {
    setPendingPermanentDelete(user)
    setPermanentDeleteOpen(true)
  }

  const confirmPermanentDelete = async () => {
    if (!pendingPermanentDelete) return
    try {
      await api.delete(`/admin/hr-accounts/${pendingPermanentDelete.id}/permanent`)
      toast.success('Compte supprimé définitivement.')
      setPermanentDeleteOpen(false)
      setPendingPermanentDelete(null)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Erreur lors de la suppression définitive')
    }
  }

  const filtered = accounts.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Comptes RH">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="h-9 w-64 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Afficher inactifs
          </label>
        </div>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', site: 'bouarada' }); setCreateOpen(true) }} className="gap-2 bg-primary hover:bg-violeth">
          <Plus className="h-4 w-4" /> Creer un compte RH
        </Button>
      </div>

      <Card className="rounded-md shadow-card">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Site</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Chargement...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Aucun compte RH trouve.</td></tr>}
              {filtered.map((a, i) => (
                <tr key={a.id} className={`border-b hover:bg-card2 ${i % 2 === 0 ? '' : 'bg-card2/50'}`}>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${a.site === 'bouarada' ? 'bg-boul text-primary border-[var(--bou-b)]' : 'bg-zagl text-ok border-[var(--zag-b)]'}`}>
                      {a.site || '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${a.isActive !== false ? 'bg-ok/14 text-ok' : 'bg-err/14 text-err'}`}>
                      {a.isActive !== false ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelected(a)
                        setForm({
                          ...form,
                          name: a.name || '',
                          email: a.email || '',
                          site: a.site || 'bouarada',
                        })
                        setEditOpen(true)
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(a); setResetOpen(true) }}>
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeactivateDialog(a)}>
                        {a.isActive !== false
                          ? <UserX className="h-3.5 w-3.5 text-err" />
                          : <UserCheck className="h-3.5 w-3.5 text-ok" />}
                      </Button>
                      {a.isActive === false && (
                        <Button variant="ghost" size="sm" onClick={() => openPermanentDeleteDialog(a)} title="Supprimer définitivement">
                          <Trash2 className="h-3.5 w-3.5 text-err" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Creer un compte RH</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom complet</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Mot de passe</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><p className="text-[10px] text-muted-foreground mt-1">8 caracteres min, 1 chiffre</p></div>
            <div>
              <Label>Site</Label>
              <Select value={form.site} onValueChange={v => setForm({ ...form, site: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bouarada">Bouarada</SelectItem>
                  <SelectItem value="zaghouan">Zaghouan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreate} disabled={creatingAccount} className="bg-primary">{creatingAccount ? 'Creation...' : 'Creer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le compte RH</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Nom complet</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Site</Label>
              <Select value={form.site} onValueChange={v => setForm({ ...form, site: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bouarada">Bouarada</SelectItem>
                  <SelectItem value="zaghouan">Zaghouan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleEdit} disabled={updatingAccount} className="bg-primary">{updatingAccount ? 'Enregistrement...' : 'Enregistrer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetOpen} onOpenChange={handleResetOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reinitialiser le mot de passe — {selected?.name}</DialogTitle></DialogHeader>
          <div><Label>Nouveau mot de passe</Label><Input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)} /></div>
          <DialogFooter><Button onClick={handleReset} disabled={resettingPassword} className="bg-primary">{resettingPassword ? 'Reinitialisation...' : 'Reinitialiser'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deactivateOpen}
        onOpenChange={(open) => {
          setDeactivateOpen(open)
          if (!open) setPendingDeactivate(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeactivate?.isActive !== false ? 'Désactiver ce compte RH ?' : 'Réactiver ce compte RH ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeactivate
                ? pendingDeactivate.isActive !== false
                  ? `Le compte ${pendingDeactivate.name} perdra immédiatement l'accès à la plateforme.`
                  : `Le compte ${pendingDeactivate.name} retrouvera l'accès à la plateforme.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeactivate(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              className={pendingDeactivate?.isActive !== false ? 'bg-err hover:bg-err/90' : 'bg-ok hover:bg-ok/90'}
            >
              {pendingDeactivate?.isActive !== false ? 'Désactiver' : 'Réactiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={permanentDeleteOpen}
        onOpenChange={(open) => {
          setPermanentDeleteOpen(open)
          if (!open) setPendingPermanentDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ce compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPermanentDelete
                ? `Le compte "${pendingPermanentDelete.name}" (${pendingPermanentDelete.email}) sera supprimé de manière irréversible. Les offres et entretiens créés par ce compte seront réassignés à l'administrateur.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPermanentDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-err hover:bg-err/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default HRAccountsPage
