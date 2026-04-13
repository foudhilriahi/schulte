import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, KeyRound, UserX, UserCheck } from 'lucide-react'
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
  const [selected, setSelected] = useState<any>(null)
  const [pendingDeactivate, setPendingDeactivate] = useState<any | null>(null)
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

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/admin/hr-accounts', { params: { includeInactive: showInactive } })
      setAccounts(data)
    } catch { toast.error('Failed to load HR accounts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAccounts() }, [showInactive])

  useEffect(() => {
    const socket = socketService.getSocket()
    const refresh = () => fetchAccounts()
    socket?.on('admin:hr-account:changed', refresh)
    return () => {
      socket?.off('admin:hr-account:changed', refresh)
    }
  }, [])

  const handleCreate = async () => {
    const email = form.email.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      toast.error('Please enter a valid email address (example: hr@schulte.tn)')
      return
    }

    const passwordOk = /^(?=.*[0-9]).{8,}$/.test(form.password)
    if (!passwordOk) {
      toast.error('Password must be at least 8 characters and include at least 1 number')
      return
    }

    setCreatingAccount(true)
    try {
      await api.post('/admin/hr-accounts', { ...form, email })
      toast.success('HR account created.')
      handleCreateOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Error creating account')
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
        toast.error('Please enter a valid email address (example: hr@schulte.tn)')
        return
      }
      payload.email = normalizedEmail
    }

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to save')
      return
    }

    setUpdatingAccount(true)
    try {
      await api.patch(`/admin/hr-accounts/${selected.id}`, payload)
      toast.success('Account updated.')
      handleEditOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Error updating account')
    } finally {
      setUpdatingAccount(false)
    }
  }

  const handleReset = async () => {
    if (!selected) return

    const password = resetPw.trim()
    if (!password) {
      toast.error('Please enter a new password')
      return
    }

    const passwordOk = /^(?=.*[0-9]).{8,}$/.test(password)
    if (!passwordOk) {
      toast.error('Password must be at least 8 characters and include at least 1 number')
      return
    }

    setResettingPassword(true)
    try {
      await api.patch(`/admin/hr-accounts/${selected.id}`, { password })
      toast.success('Password reset.')
      handleResetOpenChange(false)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Error resetting password')
    } finally {
      setResettingPassword(false)
    }
  }

  const openDeactivateDialog = (user: any) => {
    const isInactive = user?.isActive === false || !!user?.deletedAt || String(user?.email || '').startsWith('deleted_')
    if (isInactive) {
      toast.error('This account is already deactivated')
      return
    }

    setPendingDeactivate(user)
    setDeactivateOpen(true)
  }

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return

    try {
      await api.delete(`/admin/hr-accounts/${pendingDeactivate.id}`)
      toast.success('Account deactivated.')
      setDeactivateOpen(false)
      setPendingDeactivate(null)
      fetchAccounts()
    } catch (err: any) {
      const details = err?.response?.data?.details
      toast.error(details?.[0] || err?.response?.data?.error || 'Error deactivating account')
    }
  }

  const filtered = accounts.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="HR Accounts">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 w-64 px-3 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            Show inactive
          </label>
        </div>
        <Button onClick={() => { setForm({ name: '', email: '', password: '', site: 'bouarada' }); setCreateOpen(true) }} className="gap-2 bg-primary hover:bg-acch">
          <Plus className="h-4 w-4" /> Create HR Account
        </Button>
      </div>

      <Card className="rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Site</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No HR accounts found.</td></tr>}
              {filtered.map((a, i) => (
                <tr key={a.id} className={`border-b hover:bg-s2 ${i % 2 === 0 ? '' : 'bg-s2/50'}`}>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${a.site === 'bouarada' ? 'bg-bou/10 text-bou border-bou/25' : 'bg-zag/10 text-zag border-zag/25'}`}>
                      {a.site || '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${(a.isActive !== false && !a.deletedAt && !String(a.email || '').startsWith('deleted_')) ? 'bg-ok/14 text-ok' : 'bg-err/14 text-err'}`}>
                      {(a.isActive !== false && !a.deletedAt && !String(a.email || '').startsWith('deleted_')) ? 'Active' : 'Inactive'}
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
                        {(a.isActive !== false && !a.deletedAt && !String(a.email || '').startsWith('deleted_'))
                          ? <UserX className="h-3.5 w-3.5 text-err" />
                          : <UserCheck className="h-3.5 w-3.5 text-ok" />}
                      </Button>
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
          <DialogHeader><DialogTitle>Create HR Account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><p className="text-[10px] text-muted-foreground mt-1">Min 8 chars, 1 digit</p></div>
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
          <DialogFooter><Button onClick={handleCreate} disabled={creatingAccount} className="bg-primary">{creatingAccount ? 'Creating...' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit HR Account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
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
          <DialogFooter><Button onClick={handleEdit} disabled={updatingAccount} className="bg-primary">{updatingAccount ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetOpen} onOpenChange={handleResetOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password — {selected?.name}</DialogTitle></DialogHeader>
          <div><Label>New Password</Label><Input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)} /></div>
          <DialogFooter><Button onClick={handleReset} disabled={resettingPassword} className="bg-primary">{resettingPassword ? 'Resetting...' : 'Reset'}</Button></DialogFooter>
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
            <AlertDialogTitle>Désactiver ce compte RH ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeactivate
                ? `Le compte ${pendingDeactivate.name} perdra immédiatement l'accès à la plateforme.`
                : "Ce compte perdra immédiatement l'accès à la plateforme."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeactivate(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default HRAccountsPage
