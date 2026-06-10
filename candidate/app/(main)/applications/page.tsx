'use client'

import { ApplicationsScreen } from '@/components/screens/applications-screen'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'

export default function ApplicationsPage() {
  const router = useRouterWithLoader()

  return (
    <ApplicationsScreen
      onSelectApplication={(application) => router.push(`/applications/${application.id}`)}
    />
  )
}
