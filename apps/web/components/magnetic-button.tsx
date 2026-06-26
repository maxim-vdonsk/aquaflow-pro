"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  asChild?: boolean;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, strength = 0.25, asChild = false, ...props }, ref) => {
    const innerRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current!);

    const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = innerRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const onMouseLeave = () => {
      const btn = innerRef.current;
      if (!btn) return;
      btn.style.transform = "";
    };

    if (asChild) {
      return (
        <span
          className={cn("inline-block will-change-transform", className)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </span>
      );
    }

    return (
      <button
        ref={innerRef}
        className={cn("will-change-transform", className)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
