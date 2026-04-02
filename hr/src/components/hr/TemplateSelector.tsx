import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Sparkles } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

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
  onCreateFromScratch: () => void
}

const TemplateSelector = ({ open, onClose, onSelectTemplate, onCreateFromScratch }: TemplateSelectorProps) => {
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

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    onClose()
  }

  const handleCreateFromScratch = () => {
    onCreateFromScratch()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F59E0B]" />
            Créer une nouvelle offre
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez un modèle pré-défini pour gagner du temps ou créez une offre depuis zéro.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create from Scratch Option */}
          <Card className="border-2 border-dashed border-slate-300 hover:border-[#1A2B4A] transition-colors cursor-pointer"
                onClick={handleCreateFromScratch}>
            <CardHeader className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="text-lg">Créer depuis zéro</CardTitle>
              <CardDescription>
                Créez une offre personnalisée avec tous les champs vides
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Template Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Modèles disponibles ({templates.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des modèles...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun modèle disponible
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 hover:border-[#1A2B4A]"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-[#1A2B4A] mb-1">
                            {template.titleFr}
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            {template.titleEn}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.contractType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700">
                          Département: {template.department}
                        </p>
                        {template.suggestedSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-1">
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TemplateSelector