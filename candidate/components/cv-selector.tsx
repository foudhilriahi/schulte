'use client'

import { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { FileText, Star, Upload, Plus, X } from 'lucide-react'
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
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="max-h-[85vh] overflow-hidden">
        <div className="px-5 pb-5">
          <div className="flex items-start justify-between gap-3 pt-2">
            <div>
              <DrawerTitle className="text-[15px] font-semibold text-ink">
                Choisir votre CV
              </DrawerTitle>
              <DrawerDescription className="text-[12px] text-ink3">
                Selectionnez le CV a utiliser pour cette candidature
              </DrawerDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink3 hover:bg-card2 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 pt-4">
            {cvs.length > 0 ? (
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <button
                    key={cv.id}
                    className="w-full text-left bg-card border border-solid border-border rounded-xl p-4 active:scale-[0.98] transition-transform duration-100"
                    onClick={() => handleSelectCV(cv)}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-ink3 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-ink truncate">{cv.name}</p>
                          {cv.isDefault && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink4">
                              <Star className="h-3 w-3 text-warn" />
                              Par défaut
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink3 mt-0.5">
                          {cv.type === 'uploaded' ? 'Televerse' : 'Genere'}
                          {' • '}
                          {formatDate(cv.createdAt)}
                          {cv.size ? ` • ${formatFileSize(cv.size)}` : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-card2 text-ink4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-[13px] font-semibold text-ink mb-2">Aucun CV disponible</h3>
                <p className="text-[12px] text-ink3">
                  Vous devez d'abord créer ou téléverser un CV.
                </p>
              </div>
            )}
          </div>

          {allowCreateNew && (
            <div className="space-y-3 pt-4 mt-4 border-t border-solid border-border">
              <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink4">
                Creer nouveau
              </p>

              <button
                className="w-full text-left bg-card border-[1.5px] border-solid border-border rounded-xl p-4 active:scale-[0.98] transition-transform duration-100"
                onClick={handleCreateNew}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-vl flex items-center justify-center">
                    <Plus className="h-4 w-4 text-v" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Creer un nouveau CV</p>
                    <p className="text-[11px] text-ink3">Remplir le formulaire de candidature</p>
                  </div>
                </div>
              </button>

              <button
                className="w-full text-left bg-card border-[1.5px] border-solid border-border rounded-xl p-4 active:scale-[0.98] transition-transform duration-100"
                onClick={handleUploadNew}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-vl flex items-center justify-center">
                    <Upload className="h-4 w-4 text-v" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Televerser un PDF</p>
                    <p className="text-[11px] text-ink3">Utiliser un CV PDF existant</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" onClick={onClose} className="w-full">
              Annuler
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
