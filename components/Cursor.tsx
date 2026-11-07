"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, select, textarea, label");
      const text = t?.dataset.cursor;
      if (t) {
        gsap.to(ring.current, { scale: text ? 3.6 : 1.9, duration: 0.5, ease: "expo.out" });
        gsap.to(dot.current, { scale: text ? 0 : 0.4, duration: 0.3 });
      } else {
        gsap.to(ring.current, { scale: 1, duration: 0.5, ease: "expo.out" });
        gsap.to(dot.current, { scale: 1, duration: 0.3 });
      }
      if (label.current) {
        label.current.textContent = text ?? "";
        gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.3 });
      }
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
      <div
        ref={ring}
        className="absolute left-0 top-0 -ml-5 -mt-5 grid size-10 place-items-center rounded-none border border-white opacity-0 mix-blend-difference"
      >
        <span ref={label} className="eyebrow text-[0.2rem] leading-none text-white opacity-0" style={{ fontSize: "3.5px" }} />
      </div>
    </div>
  );
}
