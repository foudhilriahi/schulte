import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border border-[var(--border)] placeholder:text-ink4 focus-visible:border-[var(--v)] focus-visible:ring-2 focus-visible:ring-[var(--vl)] aria-invalid:ring-[var(--errb)] aria-invalid:border-err bg-card flex field-sizing-content min-h-[120px] w-full rounded-lg px-3.5 py-3 text-[14px] text-ink font-sans transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
