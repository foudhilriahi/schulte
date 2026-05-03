import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MapPin, Users, Calendar, Plus, Pause, X as XIcon } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TemplateSelector from '@/components/hr/TemplateSelector'

const statusMap: Record<string, { label: string; className: string }> = {
  open: { label: 'Actif', className: 'bg-okl text-ok border-[var(--ok-b)]' },
  active: { label: 'Actif', className: 'bg-okl text-ok border-[var(--ok-b)]' },
  paused: { label: 'En pause', className: 'bg-warnl text-warn border-[var(--warn-b)]' },
  closed: { label: 'Fermée', className: 'bg-errl text-err border-[var(--err-b)]' },
}

const OffersPage = () => {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [pendingCloseOffer, setPendingCloseOffer] = useState<any | null>(null)
  const [closing, setClosing] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const navigate = useNavigate()

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers/hr/my-offers')
      setOffers(data)
    } catch { toast.error('Echec du chargement des offres') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOffers() }, [])

  useEffect(() => {
    setSearchQuery(queryParam)
  }, [queryParam])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/offers/${id}`, { status })
      toast.success('Statut de l\'offre mis a jour.')
      fetchOffers()
    } catch { toast.error('Erreur lors de la mise a jour de l\'offre') }
  }

  const confirmCloseOffer = async () => {
    if (!pendingCloseOffer?.id) return
    setClosing(true)
    try {
      await api.patch(`/offers/${pendingCloseOffer.id}`, { status: 'closed', confirmClose: true })
      toast.success('Offre fermee avec succes.')
      setPendingCloseOffer(null)
      fetchOffers()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erreur lors de la fermeture de l\'offre')
    } finally {
      setClosing(false)
    }
  }

  const handleTemplateSelect = (template: any) => {
    navigate('/offers/new', { state: { selectedTemplate: template } })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  const filteredOffers = offers.filter((offer) => {
    if (!searchQuery.trim()) return true
    return String(offer.title || '')
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  })

  return (
    <DashboardLayout title="Offres">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[12px] text-ink3">{filteredOffers.length} offre(s)</p>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher une offre..."
            className="h-9 w-56 rounded-full border border-border bg-card px-3 text-[11px] text-ink placeholder:text-ink4 focus:outline-none focus:border-v focus:ring-[3px] focus:ring-vl"
          />
        </div>
        <Button onClick={() => setShowTemplateSelector(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle Offre
        </Button>
      </div>

      {loading && <p className="text-[12px] text-ink3">Chargement...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOffers.map((offer: any) => {
          const s = statusMap[offer.status] || statusMap.closed
          const stats = offer.stats || {}
          const hasStats = (stats?.totalApplications ?? 0) > 0
          
          return (
            <Card key={offer.id} className="rounded-md shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                  <Badge className={`text-xs ${s.className}`}>{s.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center gap-4 text-[12px] text-ink3">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.site}</span>
                  <Badge variant="outline" className="text-xs bg-card2 text-ink3 border-border">{offer.contractType}</Badge>
                </div>
                
                {/* Application Stats */}
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-ink3">
                      <Users className="h-3.5 w-3.5" />Total candidatures :
                    </span>
                    <span className="font-mono text-ink2">{stats.totalApplications || 0}</span>
                  </div>
                  
                  {hasStats && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink3">Analyse IA :</span>
                        <span className="font-medium text-ok">
                          {stats.applicationsWithAI || 0} ({stats.averageAIScore ? `${stats.averageAIScore}%` : 'N/A'})
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="flex justify-between">
                          <span className="text-warn">En examen :</span>
                          <span className="font-medium">{stats.statusBreakdown?.reviewing || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary">Entretien :</span>
                          <span className="font-medium">{stats.statusBreakdown?.interview || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ok">Acceptées :</span>
                          <span className="font-medium">{stats.statusBreakdown?.accepted || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-err">Rejetees :</span>
                          <span className="font-medium">{stats.statusBreakdown?.rejected || 0}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-ink3">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Date limite : {offer.deadline ? new Date(offer.deadline).toLocaleDateString('fr-TN') : '—'}</span>
                  <span>{offer.seats || 1} poste(s)</span>
                </div>
                
                <div className="flex gap-2 pt-1">
                  {offer.status === 'open' && (
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleStatusChange(offer.id, 'paused')}>
                      <Pause className="h-3 w-3" /> Mettre en pause
                    </Button>
                  )}
                  {offer.status === 'paused' && (
                    <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleStatusChange(offer.id, 'open')}>
                      Reprendre
                    </Button>
                  )}
                  {offer.status !== 'closed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 border-err/40 text-err hover:bg-errl"
                      onClick={() => setPendingCloseOffer(offer)}
                    >
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
      />

      <AlertDialog
        open={!!pendingCloseOffer}
        onOpenChange={(open) => {
          if (!open && !closing) setPendingCloseOffer(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action arretera immediatement la visibilite cote candidat et retirera l'offre de la liste des offres courantes RH.
              Vous pourrez consulter l'historique via les candidatures liees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCloseOffer}
              disabled={closing}
              className="bg-err text-err-foreground hover:bg-err/90"
            >
              {closing ? 'Fermeture...' : 'Confirmer la fermeture'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default OffersPage
