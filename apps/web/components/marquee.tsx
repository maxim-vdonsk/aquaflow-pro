"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

const speedClass = {
  slow: "[animation-duration:60s]",
  normal: "[animation-duration:40s]",
  fast: "[animation-duration:20s]",
};

export function Marquee({ items, className, speed = "normal" }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className={cn("marquee border-y border-[var(--color-border)] py-7", className)}>
      <div className={cn("marquee-track", speedClass[speed])}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`}>
            <b>{item}</b>
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
