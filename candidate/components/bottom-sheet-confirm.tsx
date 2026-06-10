'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomSheetConfirmProps {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  pending?: boolean
  children?: ReactNode
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

export function BottomSheetConfirm({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  tone = 'default',
  pending = false,
  children,
  onClose,
  onConfirm,
}: BottomSheetConfirmProps) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-[var(--scrim)] animate-fadeIn"
        onClick={pending ? undefined : onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[61] bg-card rounded-t-[20px] pb-[env(safe-area-inset-bottom)] animate-slideUp shadow-[0_8px_24px_rgba(15,13,28,0.12)]">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 bg-[var(--border2)] rounded-full" />
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-ink leading-snug">
                {title}
              </h2>
              {description && (
                <p className="text-[12px] text-ink3 leading-relaxed mt-1.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Fermer"
              disabled={pending}
              className="p-1.5 rounded-lg text-ink3 active:bg-card2 transition-colors disabled:opacity-40"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {children && <div className="pt-4">{children}</div>}

          <div className="flex gap-2 pt-5">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="flex-1 bg-card border border-[var(--border)] text-ink2 rounded-xl py-3 text-[13px] font-semibold font-sans active:scale-[0.97] transition-transform duration-100 disabled:opacity-40"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void onConfirm()}
              className={cn(
                'flex-1 rounded-xl py-3 text-[13px] font-semibold font-sans active:scale-[0.97] transition-transform duration-100 disabled:opacity-40',
                tone === 'danger'
                  ? 'bg-err text-white'
                  : 'bg-v text-white shadow-[0_3px_12px_rgba(91,79,232,.28)]',
              )}
            >
              {pending ? 'Veuillez patienter' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
