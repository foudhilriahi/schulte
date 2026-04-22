'use client'

import { ArrowLeft, Lightbulb } from 'lucide-react'
import { TimelineStepper } from '@/components/timeline-stepper'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Application } from '@/lib/types'

interface ApplicationDetailScreenProps {
  application: Application
  onBack: () => void
}

export function ApplicationDetailScreen({ application, onBack }: ApplicationDetailScreenProps) {
  const city = application.offer?.site || 'Zaghouan'
  const cityColor = city === 'Bouarada'
    ? 'bg-boul border-[var(--bou-b)] text-primary'
    : 'bg-zagl border-[var(--zag-b)] text-ok'

  // Parse AI analysis if available
  let aiAnalysis = null
  try {
    if (application.aiAnalysis && typeof application.aiAnalysis === 'string') {
      aiAnalysis = JSON.parse(application.aiAnalysis)
    } else if (application.aiAnalysis && typeof application.aiAnalysis === 'object') {
      aiAnalysis = application.aiAnalysis
    }
  } catch (e) {
    // Ignore parsing errors
  }

  const aiTips = Array.isArray(aiAnalysis?.tipsForCandidate)
    ? aiAnalysis.tipsForCandidate
    : Array.isArray(aiAnalysis?.tips_for_candidate)
      ? aiAnalysis.tips_for_candidate
      : Array.isArray(aiAnalysis?.mergedTips)
        ? aiAnalysis.mergedTips
        : []

  const hasAITips = aiTips.length > 0

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-page">
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6">
        <div className="mb-6">
          <Badge className={cityColor}>{city}</Badge>
          <h1 className="text-xl font-semibold text-foreground mt-3">
            {application.offer?.title || 'Candidature'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Candidature envoyee le {new Date(application.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-card2 rounded-lg p-4 border border-border">
          <h2 className="font-bold text-ink mb-4">Statut de candidature</h2>
          <TimelineStepper application={application} />
        </div>

        {/* AI Tips Section */}
        {hasAITips && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-violet" />
                Conseils d'amelioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiTips.slice(0, 2).map((tip: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-ink2">{tip}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink4 mt-4">
                Ces suggestions sont générées par l'IA pour aider à améliorer votre profil
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
