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

  const handleBroadcast = async () => {
    const message = broadcastMsg.trim()
    if (message.length < 3) { toast.error('Le message doit contenir au moins 3 caracteres'); return }

    setSendingBroadcast(true)
    try {
      const payload: Record<string, any> = { message }
      if (broadcastSite !== 'all') payload.site = broadcastSite

      const { data } = await api.post('/admin/broadcast-hr', payload)
      toast.success(data?.message || 'Diffusion envoyee')
      setBroadcastMsg('')
    } catch (err: any) {
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0])
        return
      }
      toast.error(err.response?.data?.error || 'Echec de l\'envoi de la diffusion')
    } finally {
      setSendingBroadcast(false)
    }
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

        <Card className="rounded-md shadow-card">
          <CardHeader><CardTitle className="text-base">Mini messagerie (admin vers RH)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Audience</Label>
              <select
                value={broadcastSite}
                onChange={e => setBroadcastSite(e.target.value as 'all' | 'Bouarada' | 'Zaghouan')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-card"
              >
                <option value="all">Tous les sites RH</option>
                <option value="Bouarada">Bouarada uniquement</option>
                <option value="Zaghouan">Zaghouan uniquement</option>
              </select>
            </div>
            <div>
              <Label>Message</Label>
              <Input
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="Ecrire un court message aux equipes RH"
              />
            </div>
            <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="bg-primary">
              {sendingBroadcast ? 'Envoi...' : 'Envoyer la diffusion'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminSettingsPage
