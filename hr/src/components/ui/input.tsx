import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-[1.5px] border-input bg-card px-3.5 py-2 text-[13px] text-ink file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-ink4 focus-visible:outline-none focus-visible:border-v focus-visible:ring-[3px] focus-visible:ring-vl disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
