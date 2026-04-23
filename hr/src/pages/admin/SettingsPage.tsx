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


  const handleProfile = async () => {
    const nextName = name.trim()
    if (nextName.length < 2) { toast.error('Le nom affiché doit contenir au moins 2 caractères'); return }
    if (nextName === (user?.name || '')) { toast.info('Aucun changement à enregistrer'); return }

    setSavingProfile(true)
    try {
      const { data } = await api.patch('/profile', { name: nextName })
      updateUser({ name: data.name })
      setName(data.name)
      toast.success('Profil mis à jour.')
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour du profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async () => {
    if (!currentPw.trim()) { toast.error('Le mot de passe actuel est requis'); return }
    if (newPw.length < 8 || !/\d/.test(newPw)) { toast.error('Le nouveau mot de passe doit contenir au moins 8 caracteres et 1 chiffre'); return }
    if (newPw === currentPw) { toast.error('Le nouveau mot de passe doit etre different de l\'actuel'); return }
    if (newPw !== confirmPw) { toast.error('Les mots de passe ne correspondent pas'); return }
    setSaving(true)
    try {
      await api.patch('/profile/password', { currentPassword: currentPw, newPassword: newPw })
      toast.success('Mot de passe mis a jour.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise a jour du mot de passe')
    } finally { setSaving(false) }
  }



  return (
    <DashboardLayout title="Parametres admin">
      <div className="max-w-lg space-y-6">
        <Card className="rounded-md shadow-card">
          <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Nom affiche</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><p className="text-sm text-muted-foreground">{user?.email} (lecture seule)</p></div>
            <Button onClick={handleProfile} disabled={savingProfile} className="bg-primary">
              {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md shadow-card">
          <CardHeader><CardTitle className="text-base">Changer le mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Mot de passe actuel</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
            <div><Label>Nouveau mot de passe</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">8 caracteres minimum, 1 chiffre</p></div>
            <div><Label>Confirmer le mot de passe</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
            <Button onClick={handlePassword} disabled={saving} className="bg-primary">{saving ? 'Enregistrement...' : 'Mettre a jour le mot de passe'}</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsPage
