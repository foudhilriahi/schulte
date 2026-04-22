import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold transition-colors gap-[5px]",
  {
    variants: {
      variant: {
        default: "bg-violetl border-[var(--violet-b)] text-violet",
        secondary: "bg-card2 border-border text-ink3",
        destructive: "bg-errl border-[var(--err-b)] text-err",
        outline: "bg-card border-border text-ink2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
