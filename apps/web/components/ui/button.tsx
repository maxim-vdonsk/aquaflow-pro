import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] will-change-transform",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-foreground)] text-[var(--color-background)] hover:bg-[var(--color-primary)] hover:text-[var(--color-background)] hover:shadow-[0_0_0_1px_rgba(125,249,255,0.4),0_12px_48px_rgba(125,249,255,0.35)]",
        secondary:
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:opacity-90 hover:shadow-[0_0_24px_rgba(6,182,212,0.35)]",
        accent:
          "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 hover:shadow-[0_0_24px_rgba(176,107,255,0.35)]",
        outline:
          "border border-[var(--color-border-hi)] bg-transparent text-[var(--color-foreground)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[var(--color-primary)]",
        ghost: "hover:bg-[rgba(255,255,255,0.07)] text-[var(--color-foreground)]",
        destructive:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
