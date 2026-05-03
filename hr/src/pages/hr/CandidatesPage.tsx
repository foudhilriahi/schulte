import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import CandidateDrawer from '@/components/hr/CandidateDrawer'
import { api } from '@/lib/axios'
import { getApplicationAnalysisText } from '@/lib/applicationText'
import { toast } from 'sonner'
import { useVirtualizer } from '@tanstack/react-virtual'

const statusLabels: Record<string, string> = {
  new: 'Nouvelle',
  reviewing: 'En examen',
  interview: 'Entretien',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
}

const tableColumns = 'minmax(180px,1.2fr) minmax(220px,1.1fr) 120px 120px 110px 120px 120px'

const CandidatesPage = () => {
  const [applications, setApplications] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const parentRef = useRef<HTMLDivElement | null>(null)

  const fetchCandidates = useCallback(() => {
    setLoading(true)
    api.get('/applications/by-site').then(res => {
      setApplications(res.data.map((a: any) => ({
        ...a,
        id: a.id,
        name: a.candidate?.name || 'Inconnu',
        phone: a.candidate?.phone || '',
        email: a.candidate?.email || '',
        cvUrl: a.cvUrl || '',
        analysisText: getApplicationAnalysisText(a),
        formData: a.formData || null,
        jobTitle: a.offer?.title || '',
        contractType: a.offer?.contractType || 'CDI',
        city: a.offer?.site || '',
        aiScore: a.aiScore ?? 0,
        aiAnalysis: a.aiAnalysis || null,
        starRating: a.hrRating ?? 0,
        notes: a.hrNotes || '',
        skills: a.candidate?.skills || [],
        requiredSkills: a.offer?.requiredSkills || [],
        experienceYears: a.offer?.experienceYears || 0,
        description: a.offer?.description || '',
        status: a.status,
      })))
      setError(null)
    }).catch(() => {
      setError('Impossible de charger les candidats.')
      toast.error('Echec du chargement des candidats')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const rowVirtualizer = useVirtualizer({
    count: applications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 10,
  })

  return (
    <DashboardLayout title="Candidats">
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchCandidates}>Réessayer</Button>
        </div>
      )}

      <Card className="rounded-md shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Tous les candidats</CardTitle>
            <p className="text-[11px] text-ink3">
              {applications.length} candidat{applications.length > 1 ? 's' : ''}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1080px]">
              <div
                className="grid gap-3 border-b border-border px-4 py-3 text-xs font-medium text-ink3"
                style={{ gridTemplateColumns: tableColumns }}
              >
                <span>Nom</span>
                <span>Poste</span>
                <span>Site</span>
                <span>Contrat</span>
                <span>Score IA</span>
                <span>Notation</span>
                <span>Statut</span>
              </div>

              {loading && (
                <p className="px-4 py-6 text-center text-[12px] text-ink3">Chargement...</p>
              )}

              {!loading && applications.length === 0 && (
                <p className="px-4 py-6 text-center text-[12px] text-ink3">Aucun candidat.</p>
              )}

              {!loading && applications.length > 0 && (
                <div ref={parentRef} className="h-[calc(100vh-310px)] overflow-auto">
                  <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const c = applications[virtualRow.index]

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelected(c)}
                          className={`absolute left-0 w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-card2 ${
                            virtualRow.index % 2 === 0 ? 'bg-card' : 'bg-page'
                          }`}
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                            height: `${virtualRow.size}px`,
                          }}
                        >
                          <div
                            className="grid items-center gap-3"
                            style={{ gridTemplateColumns: tableColumns }}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{c.name}</p>
                            </div>
                            <p className="truncate text-ink3">{c.jobTitle}</p>
                            <div>
                              <Badge variant="outline" className={`text-xs capitalize ${c.city === 'Bouarada' ? 'bg-boul border-[var(--bou-b)] text-primary' : 'bg-zagl border-[var(--zag-b)] text-ok'}`}>{c.city}</Badge>
                            </div>
                            <div>
                              <Badge variant="outline" className="text-xs bg-card2 text-ink3 border-border">{c.contractType}</Badge>
                            </div>
                            <div>
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                c.aiScore >= 75 ? 'bg-okl text-ok' :
                                c.aiScore >= 40 ? 'bg-warnl text-warn' :
                                'bg-errl text-err'
                              }`}>{c.aiScore}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`h-3.5 w-3.5 ${s <= c.starRating ? 'fill-v text-v' : 'text-ink4'}`} />
                              ))}
                            </div>
                            <div>
                              <Badge variant="secondary" className={`text-xs ${c.status === 'accepted' ? 'bg-okl text-ok border-[var(--ok-b)]' : c.status === 'interview' ? 'bg-boul text-primary border-[var(--bou-b)]' : c.status === 'reviewing' ? 'bg-warnl text-warn border-[var(--warn-b)]' : c.status === 'rejected' ? 'bg-errl text-err border-[var(--err-b)]' : 'bg-card2 text-ink3 border-border'}`}>{statusLabels[c.status] || c.status}</Badge>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CandidateDrawer candidate={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  )
}

export default CandidatesPage
