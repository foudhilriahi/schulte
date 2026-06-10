'use client'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'

export default function SettingsPage() {
  const router = useRouterWithLoader()
  const { user } = useAuthStore()
  
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Mocked for the frontend for now, in a real implementation we would hit a PATCH /api/users/:id endpoint
      await new Promise(r => setTimeout(r, 1000))
      toast.success('Paramètres mis à jour.')
      setPassword('')
    } catch (e) {
      toast.error('Échec de la mise à jour des paramètres.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-ink3 min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-[12px]">Retour</span>
          </button>
          <h1 className="ml-4 font-semibold text-ink">Parametres du compte</h1>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
              <h2 className="text-[15px] font-semibold text-ink mb-4">Informations personnelles</h2>
            
            <div className="space-y-2">
              <Label>Adresse e-mail</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="nom@exemple.com"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Nouveau mot de passe</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Laisser vide pour conserver l'actuel"
              />
              <p className="text-[10px] text-ink4 mt-1">8 caracteres minimum, 1 chiffre.</p>
            </div>
            
            <Button 
              className="w-full mt-4 gap-2" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : <><Save className="h-4 w-4" /> Enregistrer les modifications</>}
            </Button>
          </div>
          
          <div className="p-4 bg-errl rounded-xl border border-[var(--errb)] flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-[13px] font-semibold text-err">Zone dangereuse</h3>
              <p className="text-[11px] text-ink3 mt-1">Supprimer definitivement votre compte et toutes les candidatures associees.</p>
              <Button variant="outline" className="mt-3 text-err border-[var(--errb)] hover:bg-errl hover:text-err h-9" onClick={() => toast.error('Action bloquee en mode demo.')}> 
                Supprimer le compte
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
