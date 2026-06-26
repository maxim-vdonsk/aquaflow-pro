"use client";

import * as React from "react";

export function PageLoader() {
  const [done, setDone] = React.useState(false);
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    let value = 0;

    const tick = () => {
      value += Math.random() * 12;
      if (value >= 100) {
        value = 100;
        setPct(100);
        setTimeout(() => setDone(true), 350);
        return;
      }
      setPct(Math.floor(value));
      raf = window.setTimeout(tick, 90);
    };

    raf = window.setTimeout(tick, 100);

    return () => window.clearTimeout(raf);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-background)] transition-[opacity,visibility] duration-700 ${
        done ? "opacity-0 invisible" : "opacity-100 visible"
      }`}
      aria-hidden="true"
    >
      <div className="text-center">
        <div className="font-heading text-5xl font-extralight tracking-tight grad-text">
          {pct}%
        </div>
        <div className="relative mx-auto mt-5 h-px w-60 overflow-hidden bg-[var(--color-border)]">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-rose)] transition-transform duration-100 ease-linear"
            style={{ width: "100%", transform: `scaleX(${pct / 100})`, transformOrigin: "left" }}
          />
        </div>
        <div className="mt-4 font-mono text-xs uppercase tracking-[4px] text-[var(--color-muted-foreground)]">
          AquaFlow // Pro
        </div>
      </div>
    </div>
  );
}
