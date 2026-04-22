import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '@/components/hr/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X, Plus, ArrowLeft, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import TemplateSelector from '@/components/hr/TemplateSelector'

interface Template {
  id: string
  titleFr: string
  titleEn: string
  contractType: string
  department: string
  description: string
  suggestedSkills: string[]
}

const NewOfferPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialize from route state
  useEffect(() => {
    const routeState = location.state as { selectedTemplate?: Template } | null
    if (routeState?.selectedTemplate) {
      setSelectedTemplate(routeState.selectedTemplate)
      setFormData({
        title: routeState.selectedTemplate.titleFr,
        description: routeState.selectedTemplate.description,
        contractType: routeState.selectedTemplate.contractType,
        department: routeState.selectedTemplate.department,
        requiredSkills: [...routeState.selectedTemplate.suggestedSkills],
        experienceYears: 0,
        seats: 1,
        salaryRange: '',
        showSalary: true,
        deadline: null,
      })
    } else {
      // No route state, show template selector
      setShowTemplateSelector(true)
    }
  }, [location.state])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractType: '',
    department: '',
    requiredSkills: [] as string[],
    experienceYears: 0,
    seats: 1,
    salaryRange: '',
    showSalary: true,
    deadline: null as Date | null,
  })

  const [newSkill, setNewSkill] = useState('')

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.titleFr,
      description: template.description,
      contractType: template.contractType,
      department: template.department,
      requiredSkills: [...template.suggestedSkills],
      experienceYears: 0,
      seats: 1,
      salaryRange: '',
      showSalary: true,
      deadline: null,
    })
    setShowTemplateSelector(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTemplate) {
      toast.error('Veuillez sélectionner un modèle avant de créer une offre')
      setShowTemplateSelector(true)
      return
    }

    if (!formData.title || !formData.description || !formData.contractType || !formData.deadline) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        templateId: selectedTemplate.id,
        site: user?.site || 'Bouarada',
        deadline: formData.deadline?.toISOString(),
      }

      await api.post('/offers', payload)
      toast.success('Offre créée avec succès!')
      navigate('/offers')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création de l\'offre')
    } finally {
      setLoading(false)
    }
  }

  if (showTemplateSelector) {
    return (
      <DashboardLayout title="Nouvelle offre">
        <TemplateSelector
          open={showTemplateSelector}
          onClose={() => navigate('/offers')}
          onSelectTemplate={handleTemplateSelect}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Nouvelle offre">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/offers')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Nouvelle offre (depuis modèle)
              </h1>
              {selectedTemplate && (
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4 text-warn" />
                  <span className="text-sm text-muted-foreground">
                    Basée sur le modèle: {selectedTemplate.titleFr}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowTemplateSelector(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Changer de modèle
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du poste *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Ingénieur Qualité"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Production"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description du poste *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez les missions et responsabilités..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails du contrat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contractType">Type de contrat *</Label>
                  <Select 
                    value={formData.contractType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contractType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seats">Nombre de postes</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={formData.seats}
                    onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="experienceYears">Expérience requise (années)</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryRange">Fourchette salariale (optionnel)</Label>
                  <Input
                    id="salaryRange"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                    placeholder="Ex: 800-1200 DT"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="showSalary"
                    checked={formData.showSalary}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showSalary: checked }))}
                  />
                  <Label htmlFor="showSalary">Afficher le salaire aux candidats</Label>
                </div>
              </div>

              <div>
                <Label>Date limite de candidature *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(formData.deadline, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Compétences requises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Ajouter une compétence..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/offers')}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-violeth">
              {loading ? 'Création...' : 'Créer l\'offre'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default NewOfferPage