"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FitImage from "@/components/FitImage";
import { getProduct, inr, startingPrice } from "@/lib/products";
import { useUI } from "@/lib/store";
import type { HeroSlide } from "./HeroWorld";

const HeroWorld = dynamic(() => import("./HeroWorld"), { ssr: false, loading: () => null });

const RAW: (HeroSlide & { href: string; label?: string })[] = [
  { slug: "coco-mademoiselle", href: "coco-mademoiselle", lines: ["COCO", "MADEMOISELLE"], img: "/images/stone-2.png", focus: [0.5, 0.5], sky: "#2a1514", glow: "#d98a80", ground: "#180b0a" },
  { slug: "nectarine-blossom-honey", href: "nectarine-blossom-honey", lines: ["NECTARINE", "BLOSSOM"], img: "/images/stone-3.png", focus: [0.5, 0.5], sky: "#241d12", glow: "#d9bd86", ground: "#15110a" },
  { slug: "red-diamond", href: "red-diamond", lines: ["RED", "DIAMOND"], img: "/images/stone-4.png", focus: [0.5, 0.5], sky: "#2a0a0e", glow: "#e0453a", ground: "#160608" },
  { slug: "versace-eros", href: "versace-eros", lines: ["VERSACE", "EROS"], img: "/images/stone-5.png", focus: [0.5, 0.5], sky: "#06181c", glow: "#2fb6b0", ground: "#040e10" },
];
const SLIDES = RAW.map((s) => ({ ...s, name: s.label ?? getProduct(s.href)!.name }));

const N = SLIDES.length;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const ctaVars = { "--fg": "#efe5d0", "--bg": "#0d0b09", "--accent": "#c9a45c" } as React.CSSProperties;

export default function Hero() {
  const router = useRouter();
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(true);
  const [gl, setGl] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(false);
  const ready = useUI((s) => s.ready);
  const setOnDark = useUI((s) => s.setOnDark);
  const root = useRef<HTMLElement>(null);
  const idxRef = useRef(0);
  const lock = useRef(0);
  const idx = mod(t, N);
  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);
  const s = SLIDES[idx];
  const p = getProduct(s.href)!;

  const go = useCallback((d: number) => setT((v) => v + d), []);
  const jump = (i: number) => {
    let d = mod(i - idxRef.current, N);
    if (d > N / 2) d -= N;
    setT((v) => v + d);
  };

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement("canvas");
      ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGl(ok);
    const mq = () => setMobile(window.innerWidth < 768);
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);

  // Header turns light/transparent while the dark hero is in view.
  useEffect(() => {
    const el = root.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        setOnDark(e.intersectionRatio > 0.4);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      setOnDark(false);
    };
  }, [setOnDark]);

  // Wheel steps through the scents; once the last one is reached the page scrolls on.
  useEffect(() => {
    const el = root.current!;
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 4) return el.removeAttribute("data-lenis-prevent-wheel");
      const dy = e.deltaY;
      const i = idxRef.current;
      const capture = (dy > 0 && i < N - 1) || (dy < 0 && i > 0);
      if (!capture) return el.removeAttribute("data-lenis-prevent-wheel");
      el.setAttribute("data-lenis-prevent-wheel", "");
      e.preventDefault();
      const now = performance.now();
      if (now < lock.current || Math.abs(dy) < 10) return;
      lock.current = now + 850;
      go(dy > 0 ? 1 : -1);
    };
    let sx = 0;
    let sy = 0;
    const ts = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
    };
    const key = (e: KeyboardEvent) => {
      if (window.scrollY > 200) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchend", te, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchend", te);
      window.removeEventListener("keydown", key);
    };
  }, [go]);

  const fade = `transition-opacity duration-[1400ms] ${ready ? "opacity-100" : "opacity-0"}`;
  const arrow = "pointer-events-auto grid size-12 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/20 backdrop-blur transition-colors hover:bg-white/15";

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#0b0806] text-[#efe5d0]"
      aria-roledescription="carousel"
      aria-label="Featured fragrances"
    >
      <h1 className="sr-only">Maison Aurelle — the art of being remembered</h1>

      <div className="absolute inset-0">
        {gl === true && <HeroWorld slides={SLIDES} t={t} visible={visible} mobile={mobile} onOpen={(i) => router.push(`/product/${SLIDES[i].href}`)} />}
        {gl === false && (
          <div className="absolute inset-0">
            <FitImage src={s.img} alt={`${p.name}`} sizes="100vw" priority />
            <div className="absolute inset-0 bg-black/45" />
          </div>
        )}
      </div>

      {/* atmosphere: vignette, top fade, film grain */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}
        aria-hidden
      />

      {/* index (desktop) */}
      <ol className={`absolute left-10 top-1/2 z-20 hidden -translate-y-1/2 lg:block ${fade}`} aria-label="Fragrances">
        {SLIDES.map((sl, i) => (
          <li key={sl.slug}>
            <button
              onClick={() => jump(i)}
              aria-current={i === idx}
              className={`group flex min-h-9 cursor-pointer items-center gap-4 text-left transition-opacity duration-500 ${i === idx ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
            >
              <span className="eyebrow tabular-nums text-[0.6rem]">{String(i + 1).padStart(2, "0")}</span>
              <span className={`h-px bg-current transition-all duration-700 ${i === idx ? "w-10" : "w-4"}`} />
              <span className="eyebrow text-[0.62rem]">{sl.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className={`eyebrow absolute right-10 top-1/2 z-20 hidden -translate-y-1/2 origin-center rotate-90 text-[0.6rem] opacity-60 lg:block ${fade}`} aria-hidden>
        Scroll · Drag · ← →
      </p>

      {/* bottom: scent line + call to action */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-3 px-5 text-center sm:bottom-9 ${fade}`}>
        <p className="eyebrow text-[0.62rem] opacity-75" aria-live="polite">
          {p.family} · {p.concentration}
        </p>
        <Link href={`/product/${p.slug}`} className="btn pointer-events-auto" style={ctaVars}>
          Discover · {inr(startingPrice(p))} <ArrowRight size={14} />
        </Link>
      </div>

      <div className={`pointer-events-none absolute inset-x-4 bottom-6 z-20 flex justify-between sm:inset-x-6 lg:inset-x-10 lg:bottom-9 ${fade}`}>
        <button className={arrow} aria-label="Previous fragrance" onClick={() => go(-1)}>
          <ArrowLeft size={18} strokeWidth={1.4} />
        </button>
        <button className={arrow} aria-label="Next fragrance" onClick={() => go(1)}>
          <ArrowRight size={18} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  );
}
