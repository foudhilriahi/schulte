import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Calendar, Plus, Pause, X as XIcon } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import TemplateSelector from '@/components/hr/TemplateSelector'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  open: { label: 'Actif', variant: 'default' },
  active: { label: 'Actif', variant: 'default' },
  paused: { label: 'En pause', variant: 'secondary' },
  closed: { label: 'Fermée', variant: 'destructive' },
}

const OffersPage = () => {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const navigate = useNavigate()

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers/hr/my-offers')
      setOffers(data)
    } catch { toast.error('Failed to load offers') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOffers() }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/offers/${id}`, { status })
      toast.success('Offer status updated.')
      fetchOffers()
    } catch { toast.error('Error updating offer') }
  }

  const handleTemplateSelect = (template: any) => {
    navigate('/offers/new', { state: { selectedTemplate: template } })
  }

  const handleCreateFromScratch = () => {
    navigate('/offers/new', { state: { selectedTemplate: null } })
  }

  return (
    <DashboardLayout title="Offres">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{offers.length} offre(s)</p>
        <Button onClick={() => setShowTemplateSelector(true)} className="gap-2 bg-[#1A2B4A] hover:bg-[#243a5e]">
          <Plus className="h-4 w-4" /> Nouvelle Offre
        </Button>
      </div>

      {loading && <p className="text-muted-foreground text-sm">Chargement...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((offer: any) => {
          const s = statusMap[offer.status] || statusMap.closed
          const stats = offer.stats || {}
          const hasStats = (stats?.totalApplications ?? 0) > 0
          
          return (
            <Card key={offer.id} className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                  <Badge variant={s.variant} className="text-xs">{s.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.site}</span>
                  <Badge variant="outline" className="text-xs">{offer.contractType}</Badge>
                </div>
                
                {/* Application Stats */}
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />Total Applications:
                    </span>
                    <span className="font-semibold">{stats.totalApplications || 0}</span>
                  </div>
                  
                  {hasStats && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">AI Analyzed:</span>
                        <span className="font-medium text-green-600">
                          {stats.applicationsWithAI || 0} ({stats.averageAIScore ? `${stats.averageAIScore}%` : 'N/A'})
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="flex justify-between">
                          <span className="text-amber-600">Reviewing:</span>
                          <span className="font-medium">{stats.statusBreakdown?.reviewing || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Interview:</span>
                          <span className="font-medium">{stats.statusBreakdown?.interview || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Accepted:</span>
                          <span className="font-medium">{stats.statusBreakdown?.accepted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Rejected:</span>
                          <span className="font-medium">{stats.statusBreakdown?.rejected || 0}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Deadline: {offer.deadline ? new Date(offer.deadline).toLocaleDateString('fr-TN') : '—'}</span>
                  <span>{offer.seats || 1} seat(s)</span>
                </div>
                
                <div className="flex gap-2 pt-1">
                  {offer.status === 'open' && (
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleStatusChange(offer.id, 'paused')}>
                      <Pause className="h-3 w-3" /> Pause
                    </Button>
                  )}
                  {offer.status === 'paused' && (
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleStatusChange(offer.id, 'open')}>
                      Reprendre
                    </Button>
                  )}
                  {offer.status !== 'closed' && (
                    <Button variant="outline" size="sm" className="text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange(offer.id, 'closed')}>
                      <XIcon className="h-3 w-3" /> Fermer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Template Selector Modal */}
      <TemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
        onCreateFromScratch={handleCreateFromScratch}
      />
    </DashboardLayout>
  )
}

export default OffersPage
