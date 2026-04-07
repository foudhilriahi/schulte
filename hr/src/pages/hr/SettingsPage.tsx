import { useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

const SettingsPage = () => {
  const { user } = useAuthStore()

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
          <CardHeader><CardTitle className="text-base">Site d'affectation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm capitalize font-medium">{user?.site || '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Contactez l'administrateur pour changer de site ou réinitialiser votre mot de passe.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
