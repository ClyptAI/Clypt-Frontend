import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-5 py-2.5",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-violet)] text-[var(--color-bg)] font-heading font-semibold hover:bg-[var(--color-violet-dim)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] font-heading font-medium hover:bg-[var(--color-surface-2)]",
        secondary:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] font-heading font-medium hover:bg-[var(--color-surface-2)]",
        ghost:
          "bg-transparent text-[var(--color-text-secondary)] border-none font-heading font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-[6px] px-3",
        lg: "h-11 rounded-[6px] px-8",
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
