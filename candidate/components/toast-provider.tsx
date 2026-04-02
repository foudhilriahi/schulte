'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        className: 'text-sm',
        duration: 3000
      }}
    />
  )
}
