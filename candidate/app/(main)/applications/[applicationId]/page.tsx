'use client'

import { use } from 'react'
import { ApplicationDetailScreen } from '@/components/screens/application-detail-screen'
import { useApplicationById } from '@/hooks/useApplications'
import { useRouterWithLoader } from '@/hooks/use-router-with-loader'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface ApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
}

function LoadingState() {
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-page px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-24" />
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const router = useRouterWithLoader()
  const { applicationId } = use(params)
  const { data: application, isLoading, isError } = useApplicationById(applicationId)

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-4 pb-20 text-center gap-4">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">Candidature introuvable</h1>
        <p className="text-[13px] text-ink3 max-w-sm">
          Cette candidature n'est pas accessible ou a été supprimée.
        </p>
        <Button onClick={() => router.push('/applications')}>Retour aux candidatures</Button>
      </div>
    )
  }

  return (
    <ApplicationDetailScreen
      application={application}
      onBack={() => router.push('/applications')}
    />
  )
}
