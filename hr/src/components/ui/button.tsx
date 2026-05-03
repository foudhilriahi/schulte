import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-semibold tracking-[0.01em] transition-[transform,background-color,border-color,box-shadow,color] duration-150 focus-visible:outline-none focus-visible:border-v focus-visible:ring-[3px] focus-visible:ring-vl disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-v text-white shadow-[0_2px_10px_rgba(91,79,232,0.25)] hover:-translate-y-px hover:bg-vh hover:shadow-[0_4px_16px_rgba(91,79,232,0.32)] active:scale-[0.97]",
        destructive: "bg-errl border-[1.5px] border-[var(--err-b)] text-err hover:bg-errl active:scale-[0.96]",
        outline: "border-[1.5px] border-border bg-card text-ink2 hover:border-[var(--border2)] hover:bg-card2 active:scale-[0.96]",
        secondary: "border-[1.5px] border-border bg-card text-ink2 hover:border-[var(--border2)] hover:bg-card2 active:scale-[0.96]",
        ghost: "bg-transparent text-ink3 hover:bg-card2 hover:text-ink active:scale-[0.96]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
