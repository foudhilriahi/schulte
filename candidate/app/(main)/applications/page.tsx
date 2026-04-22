'use client'

import { useState } from 'react'
import { ApplicationsScreen } from '@/components/screens/applications-screen'
import { ApplicationDetailScreen } from '@/components/screens/application-detail-screen'
import type { Application } from '@/lib/types'

export default function ApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  if (selectedApplication) {
    return (
      <ApplicationDetailScreen
        application={selectedApplication}
        onBack={() => setSelectedApplication(null)}
      />
    )
  }

  return (
    <ApplicationsScreen onSelectApplication={setSelectedApplication} />
  )
}
