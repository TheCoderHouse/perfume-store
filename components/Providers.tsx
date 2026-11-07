"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth, useCart, useUI, useWishlist } from "@/lib/store";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mood = useUI((s) => s.mood);
  const locked = useUI((s) => s.cartOpen || s.menuOpen || !s.ready);

  // Rehydrate persisted stores on the client only (avoids SSR mismatch).
  useEffect(() => {
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();
    useAuth.persist.rehydrate();
  }, []);

  // Smooth scroll wired into GSAP's ticker.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  useEffect(() => {
    const l = window.__lenis;
    if (!l) return;
    if (locked) l.stop();
    else l.start();
  }, [locked]);

  // Route change: back to top, refresh triggers, reset mood.
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    useUI.getState().setMood(null);
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // Apply the live mood to CSS variables.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", mood?.bg ?? "#f6f0e4");
    root.style.setProperty("--fg", mood?.fg ?? "#0e0b09");
    root.style.setProperty("--accent", mood?.accent ?? "#9a6b1f");
  }, [mood]);

  return <>{children}</>;
}
