'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Star, Upload, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/axios'

interface CVItem {
  id: string
  name: string
  type: 'uploaded' | 'generated'
  createdAt: string
  isDefault: boolean
  size?: number
  template?: 'modern' | 'classic'
  data?: any
}

interface CVSelectorProps {
  open: boolean
  onClose: () => void
  onSelectCV: (cv: CVItem | null) => void
  onUploadNew: () => void
  allowCreateNew?: boolean
}

export function CVSelector({ open, onClose, onSelectCV, onUploadNew, allowCreateNew = true }: CVSelectorProps) {
  const [cvs, setCvs] = useState<CVItem[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      api
        .get('/cvs/mine')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : []
          setCvs(
            list.map((cv: any) => ({
              id: cv.id,
              name: cv.name,
              type: cv.type === 'generated' ? 'generated' : 'uploaded',
              createdAt: cv.createdAt,
              isDefault: !!cv.isDefault,
              size: typeof cv.size === 'number' ? cv.size : undefined,
              template: cv.cvTemplate === 'classic' ? 'classic' : 'modern',
              data: cv.formData,
            })),
          )
        })
        .catch(() => {
          setCvs([])
        })
    }
  }, [open, user?.id])

  const handleSelectCV = (cv: CVItem) => {
    onSelectCV(cv)
    onClose()
  }

  const handleCreateNew = () => {
    onSelectCV(null) // null means create new CV via form
    onClose()
  }

  const handleUploadNew = () => {
    onUploadNew()
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-TN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Choisir votre CV
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selectionnez le CV a utiliser pour cette candidature
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing CVs */}
          {cvs.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Vos CV ({cvs.length})
              </h3>
              
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <Card 
                    key={cv.id}
                    className="cursor-pointer border-border transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[3px] hover:border-[var(--border2)] hover:shadow-hover"
                    onClick={() => handleSelectCV(cv)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          cv.type === 'uploaded' 
                            ? 'bg-okl text-ok' 
                            : 'bg-boul text-primary'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{cv.name}</h4>
                            {cv.isDefault && (
                              <Star className="h-3 w-3 fill-current text-warn flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge 
                              variant={cv.type === 'uploaded' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {cv.type === 'uploaded' ? 'Televerse' : 'Genere'}
                            </Badge>
                            <span>•</span>
                            <span>{formatDate(cv.createdAt)}</span>
                            {cv.size && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(cv.size)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card2 text-ink4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Aucun CV disponible</h3>
              <p className="text-sm text-muted-foreground">
                Vous devez d'abord creer ou televerser un CV.
              </p>
            </div>
          )}

          {/* Create New Options */}
          {allowCreateNew && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-foreground">Creer nouveau</h3>
              
              <Card 
                className="cursor-pointer border-2 border-dashed border-[var(--bou-b)] transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[2px] hover:border-[var(--bou)] hover:shadow-card"
                onClick={handleCreateNew}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-boul text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Creer un nouveau CV</h3>
                      <p className="text-sm text-muted-foreground">Remplir le formulaire de candidature</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer border-2 border-dashed border-border transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-[2px] hover:border-[var(--violet-b)] hover:shadow-card"
                onClick={handleUploadNew}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card2 text-ink4">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">Televerser un PDF</h3>
                      <p className="text-sm text-muted-foreground">Utiliser un CV PDF existant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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