import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] px-2 py-0.5 font-heading font-medium text-[11px] tracking-[0.05em] uppercase transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-violet-muted)] text-[var(--color-violet)]",
        secondary: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]",
        destructive: "bg-[var(--color-rose-muted)] text-[var(--color-rose)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
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
