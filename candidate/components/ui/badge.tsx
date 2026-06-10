import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border-[1.5px] px-2.5 py-[3px] text-[10px] font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-[5px] [&>svg]:pointer-events-none transition-colors overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-vl border-[var(--vb)] text-v [a&]:hover:bg-vl',
        secondary:
          'bg-card2 border-border text-ink3 [a&]:hover:bg-card2',
        destructive:
          'bg-errl border-[var(--errb)] text-err [a&]:hover:bg-errl',
        outline:
          'bg-card border-border text-ink2 [a&]:hover:bg-card2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
