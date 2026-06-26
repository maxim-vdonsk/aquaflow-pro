"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
  glare?: boolean;
}

export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  ({ children, className, tilt = 6, glare = true, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current!);

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = innerRef.current;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${-y * tilt}deg) rotateY(${x * tilt}deg) translateY(-6px)`;
      card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    };

    const onMouseLeave = () => {
      const card = innerRef.current;
      if (!card) return;
      card.style.transform = "";
    };

    return (
      <div
        ref={innerRef}
        className={cn(
          "group relative transform-gpu transition-transform duration-300 ease-out",
          glare && "before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(800px_circle_at_var(--mx,50%)_var(--my,50%),rgba(125,249,255,0.07),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
          className
        )}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TiltCard.displayName = "TiltCard";
