import { useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

const SettingsPage = () => {
  const { user } = useAuthStore()

  return (
    <DashboardLayout title="Paramètres">
      <div className="max-w-2xl space-y-6">
        <Card className="rounded-md shadow-card">
          <CardHeader><CardTitle className="text-base">Profil RH</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-ink3">Nom</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-ink3">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[12px] text-ink3">Site</span>
              <span className="text-sm font-medium capitalize">{user?.site || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md shadow-card">
          <CardHeader><CardTitle className="text-base">Site d'affectation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm capitalize font-medium">{user?.site || '—'}</p>
            <p className="mt-1 text-[11px] text-ink3">Contactez l'administrateur pour changer de site ou réinitialiser votre mot de passe.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
