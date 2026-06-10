import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[14px] font-semibold font-sans tracking-[0] transition-[transform,background-color,border-color,color] duration-100 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--vl)] focus-visible:border-[var(--v)]",
  {
    variants: {
      variant: {
        default:
          'bg-v text-white shadow-[0_3px_12px_rgba(91,79,232,.28)]',
        destructive:
          'bg-errl border border-[var(--errb)] text-err',
        outline:
          'border border-[var(--border)] bg-card text-ink2',
        secondary:
          'border border-[var(--border)] bg-card text-ink2',
        ghost:
          'bg-transparent text-ink3 hover:text-ink active:bg-card2',
        link: 'text-v underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[48px] px-4',
        sm: 'h-8 rounded-lg gap-1.5 px-3 text-[12px]',
        lg: 'h-[52px] rounded-xl px-5',
        icon: 'size-9 rounded-lg',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
