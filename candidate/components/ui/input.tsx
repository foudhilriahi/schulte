import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-ink placeholder:text-ink4 selection:bg-primary selection:text-primary-foreground border-[1.5px] border-input h-10 w-full min-w-0 rounded-md bg-card px-3.5 py-2 text-[13px] text-ink transition-[border-color,box-shadow,color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--violet-l)]',
        'aria-invalid:ring-[var(--err-b)] aria-invalid:border-err',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
