import { useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

const SettingsPage = () => {
  const { user } = useAuthStore()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async () => {
    if (newPw.length < 8) { toast.error('Min 8 characters'); return }
    setSaving(true)
    try {
      await api.patch('/profile/password', { currentPassword: currentPw, newPassword: newPw })
      toast.success('Mot de passe mis à jour.')
      setCurrentPw(''); setNewPw('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally { setSaving(false) }
  }

  return (
    <DashboardLayout title="Paramètres">
      <div className="max-w-2xl space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Profil RH</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Nom</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Site</span>
              <span className="text-sm font-medium capitalize">{user?.site || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Changer le mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Mot de passe actuel</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
            <div><Label>Nouveau mot de passe</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">Min 8 caractères, 1 chiffre</p></div>
            <Button onClick={handlePasswordChange} disabled={saving} className="bg-[#1A2B4A]">{saving ? 'Enregistrement...' : 'Mettre à jour'}</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle className="text-base">Site d'affectation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm capitalize font-medium">{user?.site || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Contactez l'administrateur pour changer de site.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
