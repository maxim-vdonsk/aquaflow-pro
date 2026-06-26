"use client";

import * as React from "react";

export function CustomCursor() {
  const dotRef = React.useRef<HTMLDivElement>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const pos = React.useRef({ cx: 0, cy: 0, rx: 0, ry: 0 });
  const frameRef = React.useRef<number | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  React.useEffect(() => {
    if (isMobile) return;

    const onMove = (e: MouseEvent) => {
      pos.current.cx = e.clientX;
      pos.current.cy = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const loop = () => {
      pos.current.rx += (pos.current.cx - pos.current.rx) * 0.18;
      pos.current.ry += (pos.current.cy - pos.current.ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.rx}px, ${pos.current.ry}px) translate(-50%, -50%)`;
      }
      frameRef.current = requestAnimationFrame(loop) ?? null;
    };

    const onEnter = () => {
      dotRef.current?.classList.add("hover");
      ringRef.current?.classList.add("hover");
    };
    const onLeave = () => {
      dotRef.current?.classList.remove("hover");
      ringRef.current?.classList.remove("hover");
    };

    window.addEventListener("mousemove", onMove);
    frameRef.current = requestAnimationFrame(loop);

    const targets = document.querySelectorAll(
      "a, button, [role='button'], input, textarea, select, [data-cursor-hover]"
    );
    targets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
