'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Phone, 
  MapPin, 
  Briefcase, 
  FileText,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-40 mt-3" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfileScreen() {
  const { user, isLoading, isAuthenticated, logout, fetchUser } = useAuthStore()
  const router = useRouterWithLoader()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogout = async () => {
    await logout()
    toast.success('Deconnexion reussie')
    router.push('/login')
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      await api.delete('/profile')
      toast.success('Votre compte a ete supprime definitivement.')
      await logout()
      router.push('/register')
    } catch (err) {
      toast.error('Erreur lors de la suppression du compte')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const siteColor = user?.site === 'Bouarada'
    ? 'bg-boul border-[var(--bou-b)] text-primary'
    : 'bg-zagl border-[var(--zag-b)] text-ok'

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-page">
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">Profil</h1>
          <Image
            src="/logo.png"
            alt="Schulte & Co"
            width={100}
            height={30}
            className="h-6 w-auto"
          />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <ProfileSkeleton />
        ) : !isAuthenticated || !user ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Vous n'etes pas connecte.</p>
            <Button onClick={() => router.push('/login')}>
              Se connecter
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center space-y-2">
              <div className="h-20 w-20 rounded-full bg-card2 border border-input flex items-center justify-center text-ink text-2xl font-semibold">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {user.name}
              </h2>
              {user.site && (
                <Badge className={`${siteColor} mt-1`}>
                  {user.site}
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <Card className="mt-6">
              <CardContent className="p-0 divide-y divide-border">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-ink truncate">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Telephone</p>
                      <p className="text-sm text-ink">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.site && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Site</p>
                      <p className="text-sm text-ink">{user.site}, Tunisie</p>
                    </div>
                  </div>
                )}
                {user.experience && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Experience</p>
                      <p className="text-sm text-ink">{user.experience}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
               <Card className="mt-6">
                 <CardContent className="p-4">
                   <h3 className="text-sm font-medium text-ink mb-3">Competences</h3>
                   <div className="flex flex-wrap gap-2">
                     {user.skills.map((skill: string, index: number) => (
                       <span
                         key={`${skill}-${index}`}
                         className="px-3 py-1 text-sm bg-card2 text-ink3 rounded-full"
                       >
                         {skill}
                       </span>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

            {/* Menu Items */}
            <Card className="mt-6">
              <CardContent className="p-0 divide-y divide-border">
                <button 
                  className="flex items-center gap-4 p-4 w-full text-left min-h-[56px] touch-manipulation hover:bg-card2 transition-colors"
                  onClick={() => router.push('/profile/cv')}
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm text-ink">Mes CV</span>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
                <button 
                  className="flex items-center gap-4 p-4 w-full text-left min-h-[56px] touch-manipulation hover:bg-card2 transition-colors"
                  onClick={() => router.push('/profile/settings')}
                >
                  <div className="flex-shrink-0">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm text-ink">Parametres</span>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Logout */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full min-h-[48px] touch-manipulation"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Se deconnecter</span>
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 pt-6 border-t border-err/20">
              <h3 className="text-err font-semibold text-sm mb-2">Zone de Danger</h3>
              <p className="text-xs text-muted-foreground mb-4">
                La suppression de votre compte est definitive. Toutes vos donnees, CVs, et candidatures seront immediatement effacees de nos serveurs.
              </p>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="w-full min-h-[48px] border-err/30 text-err hover:bg-errl hover:text-err touch-manipulation"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Supprimer mon compte
                </Button>
              ) : (
                <div className="p-4 rounded-lg border border-err bg-errl/20 space-y-3 animate-in fade-in zoom-in-95">
                  <p className="text-sm font-semibold text-err">Êtes-vous absolument sûr ?</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 bg-err hover:bg-err/90 text-white" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
