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
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePassword = async () => {
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

  return (
    <DashboardLayout title="Admin Settings">
      <div className="max-w-lg space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Display Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><p className="text-sm text-muted-foreground">{user?.email} (read-only)</p></div>
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
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsPage
