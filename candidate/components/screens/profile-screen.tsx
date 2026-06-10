'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/axios'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Settings, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { TopBar } from '@/components/topbar'
import { BottomSheetConfirm } from '@/components/bottom-sheet-confirm'
import { messages } from '@/lib/messages'

function ProfileSkeleton() {
  return (
    <div className="space-y-6 pt-4 animate-pulse">
      <div className="flex flex-col items-center">
        <Skeleton className="h-20 w-20 rounded-full bg-card2" />
        <Skeleton className="h-5 w-40 mt-3 bg-card2" />
        <Skeleton className="h-4 w-32 mt-2 bg-card2" />
      </div>
      <div className="bg-card border border-solid border-border rounded-xl h-48 w-full" />
    </div>
  )
}

interface ProfileRowProps {
  label: string
  value: string
  editable?: boolean
  readonly?: boolean
  hint?: string
  onClick?: () => void
}

export function ProfileRow({ label, value, editable = false, readonly = false, hint, onClick }: ProfileRowProps) {
  return (
    <div 
      onClick={editable && onClick ? onClick : undefined}
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-solid border-border last:border-b-0 select-none ${editable && onClick ? 'cursor-pointer active:bg-card2 transition-colors duration-75' : ''}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-ink4 mb-0.5 uppercase tracking-[0.09em] font-medium">{label}</p>
        <p className={`text-[13px] ${readonly ? 'text-ink3' : 'text-ink font-medium'} truncate`}>
          {value || '—'}
        </p>
        {hint && <p className="text-[10px] text-v mt-0.5">{hint}</p>}
      </div>
      {editable && (
        <div className="text-ink4 flex-shrink-0 p-1">
          <ChevronRight size={14} />
        </div>
      )}
    </div>
  )
}

export function ProfileScreen() {
  const { user, isLoading, isAuthenticated, logout, fetchUser } = useAuthStore()
  const router = useRouterWithLoader()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogout = async () => {
    await logout()
    toast.success(messages.profile.logoutDone)
    router.push('/login')
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(messages.profile.deletePasswordRequired)
      return
    }

    try {
      setIsDeleting(true)
      await api.delete('/profile', { data: { currentPassword: deletePassword } })
      toast.success(messages.profile.accountDeleted)
      setShowDeleteConfirm(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || messages.profile.accountDeleteFailed)
      setIsDeleting(false)
      return
    }

    try {
      await logout()
      router.push('/register')
    } catch (err) {
      toast.error('Erreur lors de la déconnexion')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-page pt-[52px] pb-[calc(58px+env(safe-area-inset-bottom))]">
      {/* Fixed Reusable TopBar */}
      <TopBar />

      <main className="flex-1 py-4">
        {isLoading ? (
          <div className="px-4">
            <ProfileSkeleton />
          </div>
        ) : !isAuthenticated || !user ? (
          <div className="text-center py-12 px-4 space-y-4">
            <p className="text-ink3 text-sm">Vous n'êtes pas connecté.</p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-v text-white rounded-xl py-3.5 text-[14px] font-semibold font-sans shadow-[0_3px_12px_rgba(91,79,232,.28)] active:scale-[0.97] transition-transform duration-100 cursor-pointer"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <div className="animate-slide-up-fade">
            {/* Profile Avatar Header */}
            <div className="flex flex-col items-center space-y-2 py-4 select-none">
              <div className="h-16 w-16 rounded-full bg-v text-white flex items-center justify-center text-xl font-semibold shadow-[0_1px_3px_rgba(15,13,28,0.05)]">
                {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-[18px] font-semibold text-ink leading-tight">
                {user.name}
              </h2>
              {user.site && (
                <span className={`font-mono text-[10px] font-medium px-2.5 py-[3px] rounded-full border border-solid ${
                  user.site === 'Bouarada' 
                    ? 'bg-boul border-boub text-[#1A5FCC]' 
                    : 'bg-zagl border-zagb text-[#0A8A5A]'
                }`}>
                  {user.site}
                </span>
              )}
            </div>

            {/* Informations personnelles Group */}
            <div className="px-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink4 mb-2 mt-4 select-none">
                Informations personnelles
              </p>
              <div className="bg-card border border-solid border-border rounded-xl overflow-hidden">
                <ProfileRow label="Nom complet" value={user.name} readonly />
                <ProfileRow label="Email" value={user.email} readonly />
                <ProfileRow label="Téléphone" value={user.phone || 'Non renseigné'} readonly />
                {user.experience && (
                  <ProfileRow label="Expérience" value={user.experience} readonly />
                )}
              </div>
            </div>

            {/* Compétences Group */}
            {user.skills && user.skills.length > 0 && (
              <div className="px-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink4 mb-2 mt-5 select-none">
                  Compétences
                </p>
                <div className="bg-card border border-solid border-border rounded-xl p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill: string, index: number) => (
                      <span
                        key={`${skill}-${index}`}
                        className="bg-card2 border border-solid border-border text-ink3 font-sans text-[11px] px-2 py-[2px] rounded-[4px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mon Compte / Actions Group */}
            <div className="px-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink4 mb-2 mt-5 select-none">
                Mon Compte
              </p>
              <div className="bg-card border border-solid border-border rounded-xl overflow-hidden">
                <div 
                  onClick={() => router.push('/profile/cv')}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-solid border-border last:border-b-0 cursor-pointer active:bg-card2 transition-colors duration-75 select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <FileText size={18} className="text-ink3" />
                  <span className="flex-1 text-[13px] text-ink font-medium">Mes CV</span>
                  <ChevronRight size={14} className="text-ink4" />
                </div>
                <div 
                  onClick={() => router.push('/profile/settings')}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-solid border-border last:border-b-0 cursor-pointer active:bg-card2 transition-colors duration-75 select-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Settings size={18} className="text-ink3" />
                  <span className="flex-1 text-[13px] text-ink font-medium">Paramètres</span>
                  <ChevronRight size={14} className="text-ink4" />
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="px-4 mt-6">
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-errl border border-solid border-errb text-err rounded-xl py-3.5 text-[13px] font-semibold font-sans active:scale-[0.98] transition-transform duration-100 cursor-pointer select-none touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Déconnexion
              </button>
            </div>

            {/* Danger Zone */}
            <div className="px-4 mt-10">
              <div className="border-t border-solid border-err/20 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-err mb-2 select-none">
                  Zone sensible
                </p>
                <p className="text-xs text-ink3 mb-4 leading-relaxed select-none">
                  La suppression de votre compte est définitive. Vos données, CV et candidatures seront supprimés.
                </p>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-card border border-solid border-err/30 text-err rounded-xl py-3 text-[13px] font-semibold font-sans active:scale-[0.98] transition-transform duration-100 cursor-pointer select-none touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomSheetConfirm
        open={showLogoutConfirm}
        title={messages.profile.logoutTitle}
        description={messages.profile.logoutDescription}
        confirmLabel={messages.profile.logoutConfirm}
        tone="danger"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      <BottomSheetConfirm
        open={showDeleteConfirm}
        title={messages.profile.deleteAccountTitle}
        description={messages.profile.deleteAccountDescription}
        confirmLabel={messages.profile.deleteAccountConfirm}
        tone="danger"
        pending={isDeleting}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletePassword('')
        }}
        onConfirm={handleDeleteAccount}
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium uppercase tracking-[0.09em] text-ink3">
            Mot de passe actuel
          </label>
          <Input
            type="password"
            placeholder="Mot de passe actuel"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            className="border-err/30 focus-visible:ring-err/20"
          />
        </div>
      </BottomSheetConfirm>
    </div>
  )
}
