import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-ink placeholder:text-ink4 selection:bg-v selection:text-white border border-[var(--border)] w-full min-w-0 rounded-lg bg-card px-3.5 py-3 text-[14px] text-ink font-sans outline-none transition-[border-color,box-shadow,color] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]',
        'focus-visible:border-[var(--v)] focus-visible:ring-2 focus-visible:ring-[var(--vl)]',
        'aria-invalid:ring-[var(--errb)] aria-invalid:border-err',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
