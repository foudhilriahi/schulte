import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Sparkles } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import { socketService } from '@/lib/socket'

interface Template {
  id: string
  titleFr: string
  titleEn: string
  contractType: string
  department: string
  description: string
  suggestedSkills: string[]
  isActive: boolean
}

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

const TemplateSelector = ({ open, onClose, onSelectTemplate }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/offers/hr/templates')
      setTemplates(data.filter((t: Template) => t.isActive))
    } catch (error) {
      toast.error('Erreur lors du chargement des modèles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const socket = socketService.getSocket()
    const onTemplateUpdated = () => {
      fetchTemplates()
    }

    socket?.on('template:updated', onTemplateUpdated)
    return () => {
      socket?.off('template:updated', onTemplateUpdated)
    }
  }, [open])

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warn" />
            Créer une nouvelle offre
          </DialogTitle>
          <p className="text-[12px] text-ink3">
            Choisissez un modèle pré-défini. La création d'offre côté RH se fait uniquement à partir d'un modèle.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Options */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-[16px] font-semibold tracking-[-0.015em] text-ink">
              <FileText className="h-5 w-5" />
              Modèles disponibles ({templates.length})
            </h3>
            
            {loading ? (
              <div className="py-8 text-center text-[12px] text-ink3">
                Chargement des modèles...
              </div>
            ) : templates.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-ink3">
                Aucun modèle disponible
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer border-border transition-[border-color,box-shadow] hover:border-[var(--border2)] hover:shadow-hover"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-1 text-base text-ink">
                            {template.titleFr}
                          </CardTitle>
                          <CardDescription className="text-[11px] text-ink3">
                            {template.titleEn}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.contractType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="mb-3 line-clamp-2 text-[12px] text-ink3">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-ink">
                          Département: {template.department}
                        </p>
                        {template.suggestedSkills.length > 0 && (
                          <div>
                            <p className="mb-1 text-[11px] font-medium text-ink">
                              Compétences suggérées:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.suggestedSkills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {template.suggestedSkills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.suggestedSkills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateSelector
