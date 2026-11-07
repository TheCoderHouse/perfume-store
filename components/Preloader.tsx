"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useUI } from "@/lib/store";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const setReady = useUI((s) => s.setReady);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("aurelle-seen") === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      setReady(true);
      return;
    }
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem("aurelle-seen", "1");
          } catch {}
          setReady(true);
          setDone(true);
        },
      });
      tl.from(".pl-letter", { yPercent: 120, duration: 1, stagger: 0.06, ease: "expo.out" })
        .to(obj, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(obj.v)).padStart(3, "0"); } }, 0.2)
        .to(".pl-line", { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, 0.2)
        .to(".pl-inner", { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, ">0.1")
        .to(root.current, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, ">-0.1");
    }, root);
    return () => ctx.revert();
  }, [setReady]);

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-[#0e0b09] text-[#f2e3c4]" aria-hidden>
      <div className="pl-inner flex w-[min(78vw,520px)] flex-col items-center gap-8">
        <div className="display flex overflow-hidden text-5xl tracking-[0.18em] sm:text-7xl">
          {"AURELLE".split("").map((c, i) => (
            <span key={i} className="pl-letter inline-block">
              {c}
            </span>
          ))}
        </div>
        <p className="eyebrow opacity-70">Maison de Parfum</p>
        <div className="h-px w-full bg-white/15">
          <div className="pl-line h-px origin-left scale-x-0 bg-[#d4a24c]" />
        </div>
        <span ref={num} className="eyebrow tabular-nums">000</span>
      </div>
    </div>
  );
}
