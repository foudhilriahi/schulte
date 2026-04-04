import { useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

const AdminSettingsPage = () => {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastSite, setBroadcastSite] = useState<'all' | 'Bouarada' | 'Zaghouan'>('all')
  const [sendingBroadcast, setSendingBroadcast] = useState(false)

  const handleProfile = async () => {
    const nextName = name.trim()
    if (nextName.length < 2) { toast.error('Display name must be at least 2 characters'); return }
    if (nextName === (user?.name || '')) { toast.info('No changes to save'); return }

    setSavingProfile(true)
    try {
      const { data } = await api.patch('/profile', { name: nextName })
      updateUser({ name: data.name })
      setName(data.name)
      toast.success('Profile updated.')
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Error updating profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async () => {
    if (!currentPw.trim()) { toast.error('Current password is required'); return }
    if (newPw.length < 8 || !/\d/.test(newPw)) { toast.error('New password must be at least 8 characters and contain 1 number'); return }
    if (newPw === currentPw) { toast.error('New password must be different from current password'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await api.patch('/profile/password', { currentPassword: currentPw, newPassword: newPw })
      toast.success('Password updated.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error updating password')
    } finally { setSaving(false) }
  }

  const handleBroadcast = async () => {
    const message = broadcastMsg.trim()
    if (message.length < 3) { toast.error('Message must be at least 3 characters'); return }

    setSendingBroadcast(true)
    try {
      const payload: Record<string, any> = { message }
      if (broadcastSite !== 'all') payload.site = broadcastSite

      const { data } = await api.post('/admin/broadcast-hr', payload)
      toast.success(data?.message || 'Broadcast sent')
      setBroadcastMsg('')
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Failed to send broadcast')
    } finally {
      setSendingBroadcast(false)
    }
  }

  return (
    <DashboardLayout title="Admin Settings">
      <div className="max-w-lg space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Display Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><p className="text-sm text-muted-foreground">{user?.email} (read-only)</p></div>
            <Button onClick={handleProfile} disabled={savingProfile} className="bg-[#1A2B4A]">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Current Password</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
            <div><Label>New Password</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">Min 8 chars, 1 digit</p></div>
            <div><Label>Confirm Password</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
            <Button onClick={handlePassword} disabled={saving} className="bg-[#1A2B4A]">{saving ? 'Saving...' : 'Update Password'}</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Mini Messagerie (Admin to HR)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Audience</Label>
              <select
                value={broadcastSite}
                onChange={e => setBroadcastSite(e.target.value as 'all' | 'Bouarada' | 'Zaghouan')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All HR sites</option>
                <option value="Bouarada">Bouarada only</option>
                <option value="Zaghouan">Zaghouan only</option>
              </select>
            </div>
            <div>
              <Label>Message</Label>
              <Input
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Write a short message to HR teams"
              />
            </div>
            <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="bg-[#1A2B4A]">
              {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsPage
