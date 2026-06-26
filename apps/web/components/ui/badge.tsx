import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary)] text-[var(--color-background)]",
        secondary:
          "border-transparent bg-[var(--color-secondary)] text-[var(--color-background)]",
        accent:
          "border-transparent bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
        outline: "text-[var(--color-foreground)] border-[var(--color-border-hi)] bg-[rgba(255,255,255,0.04)]",
        cyan: "border-transparent bg-[rgba(125,249,255,0.15)] text-[var(--color-cyan)] border border-[rgba(125,249,255,0.3)]",
        pink: "border-transparent bg-[rgba(176,107,255,0.15)] text-[var(--color-pink)] border border-[rgba(176,107,255,0.3)]",
        yellow: "border-transparent bg-[rgba(255,225,86,0.15)] text-[var(--color-yellow)] border border-[rgba(255,225,86,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
