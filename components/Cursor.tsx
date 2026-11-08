"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** A small dot that follows the pointer (and swells over anything clickable). No outline ring. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      gsap.to(dot.current, { opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, select, textarea, label");
      gsap.to(dot.current, { scale: t ? 2.6 : 1, duration: 0.4, ease: "expo.out" });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden>
      <div ref={dot} className="absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-white opacity-0 mix-blend-difference" />
    </div>
  );
}
