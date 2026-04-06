import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import CandidateDrawer from '@/components/hr/CandidateDrawer'
import { api } from '@/lib/axios'
import { getApplicationAnalysisText } from '@/lib/applicationText'
import { toast } from 'sonner'

const statusLabels: Record<string, string> = {
  new: 'Nouvelle',
  reviewing: 'En examen',
  interview: 'Entretien',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
}

const CandidatesPage = () => {
  const [applications, setApplications] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/by-site').then(res => {
      setApplications(res.data.map((a: any) => ({
        ...a,
        id: a.id,
        name: a.candidate?.name || 'Unknown',
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
    }).catch(() => {
      toast.error('Failed to load candidates')
    }).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Candidats">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle className="text-base">Tous les candidats</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Poste</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Site</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contrat</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Score IA</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notation</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Chargement...</td></tr>}
                {!loading && applications.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Aucun candidat.</td></tr>}
                {applications.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.jobTitle}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{c.city}</Badge></td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{c.contractType}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        c.aiScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        c.aiScore >= 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>{c.aiScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= c.starRating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{statusLabels[c.status] || c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CandidateDrawer candidate={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  )
}

export default CandidatesPage
