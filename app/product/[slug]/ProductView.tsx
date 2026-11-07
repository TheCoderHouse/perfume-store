"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FitImage from "@/components/FitImage";
import { IMAGE_SIZES } from "@/lib/imageSizes";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Check, ChevronDown, Heart, Star, Truck } from "lucide-react";
import BottleScene from "@/components/BottleScene";
import ProductCard from "@/components/ProductCard";
import { QtyStepper } from "@/components/CartDrawer";
import { Reveal, Words } from "@/components/Reveal";
import { brandOf, inr, products, type Product } from "@/lib/products";
import { useCart, useUI, useWishlist } from "@/lib/store";

const REVIEWS = [
  { n: "Ananya S.", r: 5, t: "Unmistakably luxurious", b: "Projects beautifully for the first four hours and then settles into my skin. I get asked what it is every single time." },
  { n: "Rohan K.", r: 5, t: "Worth the wait", b: "The ninety-day rest really shows — the blend is seamless. The packaging felt like unwrapping a gift." },
  { n: "Meera D.", r: 4, t: "Elegant and long-lasting", b: "Beautiful opening, a touch strong in the first minutes. After that, pure velvet. Will be buying the 100 ml." },
];

export default function ProductView({ product: p }: { product: Product }) {
  const router = useRouter();
  const [view, setView] = useState<number>(p.bottle ? -1 : 0); // -1 = 3D
  const [ml, setMl] = useState(p.sizes[Math.min(1, p.sizes.length - 1)].ml);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState<string>("notes");
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setMood = useUI((s) => s.setMood);
  const liked = useWishlist((s) => s.slugs.includes(p.slug));
  const toggle = useWishlist((s) => s.toggle);
  const price = p.sizes.find((s) => s.ml === ml)!.price;
  // The gallery frame follows each photo's own shape (gently clamped), so nothing needs filler.
  const [iw, ih] = view >= 0 ? (IMAGE_SIZES[p.images[view]] ?? [1, 1]) : [1, 1];
  const frame = Math.min(1.25, Math.max(0.75, iw / ih));

  useEffect(() => {
    setMood(p.mood);
    return () => setMood(null);
  }, [p, setMood]);

  const addToBag = (buyNow = false) => {
    add(p.slug, ml, qty);
    if (buyNow) router.push("/checkout");
    else {
      setAdded(true);
      setCartOpen(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  const related = [...products.filter((x) => x.slug !== p.slug && x.family === p.family), ...products.filter((x) => x.slug !== p.slug && x.family !== p.family)].slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-[1700px] gap-10 px-5 pb-24 pt-24 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:pt-32">
        {/* gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <nav className="eyebrow mb-5 flex items-center gap-3 text-[0.6rem] opacity-70" aria-label="Breadcrumb">
            <Link href="/" className="u-link">Home</Link>/<Link href="/shop" className="u-link">Shop</Link>/<span aria-current="page">{p.name}</span>
          </nav>
          <div className="relative mx-auto w-full overflow-hidden bg-[#17120e] transition-[aspect-ratio] duration-500 lg:mx-0 lg:max-w-[var(--mw)]" style={{ aspectRatio: frame, "--mw": `calc((100svh - 10rem) * ${frame})` } as React.CSSProperties} data-cursor={view === -1 && p.bottle ? "Drag" : undefined}>
            <AnimatePresence mode="wait">
              {view === -1 && p.bottle ? (
                <motion.div key="3d" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <BottleScene spec={p.bottle} accent={p.mood.accent} mode="orbit" scale={1.25} className="h-full w-full" />
                  <span className="eyebrow pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-none border border-white/20 bg-black/30 px-4 py-2 text-[0.58rem] text-white/90 backdrop-blur">Drag to rotate · 360°</span>
                </motion.div>
              ) : (
                <motion.div key={view} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
                  <FitImage src={p.images[view]} alt={`${p.name} — view ${view + 1}`} ratio={1} priority sizes="(min-width:1024px) 55vw, 100vw" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Product views">
            {p.bottle && (
              <Thumb active={view === -1} onClick={() => setView(-1)} label="3D view">
                <span className="grid h-full w-full place-items-center bg-fg text-bg"><Box size={22} strokeWidth={1.3} /></span>
              </Thumb>
            )}
            {p.images.map((src, i) => (
              <Thumb key={src} active={view === i} onClick={() => setView(i)} label={`Photo ${i + 1}`}>
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </Thumb>
            ))}
          </div>
        </div>

        {/* info */}
        <div className="lg:pt-14">
          <p className="eyebrow flex items-center gap-3 opacity-80">
            <span className="h-px w-8 bg-current" /> {brandOf(p)} · {p.family} · {p.gender}
            {p.badge && <span className="rounded-none border border-current px-3 py-1 text-[0.55rem]">{p.badge}</span>}
          </p>
          <h1 className="display mt-4 text-[clamp(2.8rem,12vw,3.6rem)] italic sm:text-[clamp(3.4rem,7vw,6.5rem)]">{p.name}</h1>
          <p className="display mt-2 text-2xl opacity-80">{p.tagline}</p>
          <a href="#reviews" className="mt-5 inline-flex items-center gap-2 text-sm">
            <span className="flex text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className={i < Math.round(p.rating) ? "fill-current" : ""} />)}</span>
            {p.rating} · {p.reviews} reviews
          </a>

          <p className="mt-8 max-w-xl text-[0.95rem] leading-[1.8] opacity-85">{p.description}</p>

          <fieldset className="mt-10">
            <legend className="label">Size</legend>
            <div className="flex flex-wrap gap-3">
              {p.sizes.map((s) => (
                <label key={s.ml} className={`group relative cursor-pointer rounded-[2px] border px-6 py-3.5 text-center transition-colors duration-300 ${ml === s.ml ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}>
                  <input type="radio" name="size" value={s.ml} checked={ml === s.ml} onChange={() => setMl(s.ml)} className="peer sr-only" />
                  <span className="pointer-events-none absolute inset-0 rounded-[2px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)] peer-focus-visible:outline" />
                  <span className="block text-sm font-semibold">{s.ml} ml</span>
                  <span className="block text-xs opacity-70">{inr(s.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-10 flex items-end justify-between gap-4 border-t border-line pt-8">
            <div>
              <p className="eyebrow text-[0.6rem] opacity-60">Price</p>
              <motion.p key={price * qty} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="display text-5xl">{inr(price * qty)}</motion.p>
              <p className="text-xs opacity-60">Inclusive of all taxes</p>
            </div>
            <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, Math.min(10, n)))} />
          </div>

          <div className="mt-6 flex gap-3">
            <button className="btn flex-1" onClick={() => addToBag(false)} aria-live="polite">
              {added ? <><Check size={16} /> Added to bag</> : "Add to bag"}
            </button>
            <button
              className="grid size-[3.25rem] shrink-0 cursor-pointer place-items-center border border-line transition-colors hover:border-fg"
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={liked}
              onClick={() => toggle(p.slug)}
            >
              <Heart size={20} strokeWidth={1.4} className={liked ? "fill-[#c23b62] text-[#c23b62]" : ""} />
            </button>
          </div>
          <button className="btn btn-ghost mt-3 w-full" onClick={() => addToBag(true)}>Buy it now</button>
          <p className="mt-5 flex items-center gap-3 text-xs opacity-75"><Truck size={16} strokeWidth={1.3} /> Complimentary shipping over ₹10,000 · Free discovery vial with your first order</p>

          <div className="mt-12 border-t border-line">
            {[
              { id: "notes", t: "Fragrance notes", c: <Pyramid p={p} /> },
              { id: "perf", t: "Performance", c: <Performance p={p} /> },
              { id: "ship", t: "Shipping & returns", c: <p className="text-sm leading-relaxed opacity-80">Dispatched within 24 hours in our signature gift box. Complimentary returns within 14 days on unopened flacons. Delivery in 2–4 business days across India.</p> },
            ].map((a) => (
              <div key={a.id} className="border-b border-line">
                <button className="flex min-h-14 w-full cursor-pointer items-center justify-between text-left" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? "" : a.id)}>
                  <span className="display text-2xl">{a.t}</span>
                  <ChevronDown size={18} className={`transition-transform duration-500 ${open === a.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === a.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
                      <div className="pb-7">{a.c}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-[1600px] px-5 py-24 sm:px-10">
        <Words text="What wearers say." className="display text-5xl italic sm:text-7xl" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.n} delay={i * 90} className="rounded-[2px] border border-line p-8">
              <div className="flex text-accent">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={14} className={k < r.r ? "fill-current" : ""} />)}</div>
              <h3 className="display mt-5 text-2xl">{r.t}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-80">{r.b}</p>
              <p className="eyebrow mt-6 text-[0.6rem] opacity-60">{r.n} · Verified buyer</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-28 sm:px-10 lg:pb-12">
        <Words text="Continue the journey." className="display mb-12 text-5xl italic sm:text-7xl" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
          {related.map((r) => <ProductCard key={r.slug} p={r} />)}
        </div>
      </section>

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-line bg-bg/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex-1"><p className="display text-2xl leading-none">{inr(price * qty)}</p><p className="text-[0.65rem] opacity-60">{p.name} · {ml} ml</p></div>
        <button className="btn !px-8" onClick={() => addToBag(false)}>Add to bag</button>
      </div>
    </>
  );
}

function Thumb({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button role="tab" aria-selected={active} aria-label={label} onClick={onClick} className={`relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-[2px] border-2 transition-all duration-300 ${active ? "border-fg" : "border-transparent opacity-70 hover:opacity-100"}`}>
      {children}
    </button>
  );
}

function Pyramid({ p }: { p: Product }) {
  const tiers = [
    { l: "Top", n: p.notes.top, w: "w-[58%]" },
    { l: "Heart", n: p.notes.heart, w: "w-[78%]" },
    { l: "Base", n: p.notes.base, w: "w-full" },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      {tiers.map((t, i) => (
        <div key={t.l} className={`${t.w} rounded-[2px] border border-line px-5 py-4 text-center`} style={{ background: `color-mix(in srgb, var(--accent) ${8 + i * 7}%, transparent)` }}>
          <p className="eyebrow text-[0.58rem] opacity-70">{t.l} notes</p>
          <p className="display mt-1 text-xl">{t.n.join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}

function Performance({ p }: { p: Product }) {
  const rows = [["Longevity", p.longevity], ["Sillage", p.sillage]] as const;
  return (
    <div className="space-y-5">
      {rows.map(([l, v]) => (
        <div key={l}>
          <div className="mb-2 flex justify-between text-xs"><span className="eyebrow text-[0.6rem]">{l}</span><span>{v}/10</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-fg/10"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${v * 10}%` }} transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }} /></div>
        </div>
      ))}
      <dl className="grid grid-cols-2 gap-4 pt-2 text-sm">
        <div><dt className="eyebrow text-[0.58rem] opacity-60">Best season</dt><dd className="mt-1">{p.seasons.join(", ")}</dd></div>
        <div><dt className="eyebrow text-[0.58rem] opacity-60">Occasion</dt><dd className="mt-1">{p.occasion}</dd></div>
        <div><dt className="eyebrow text-[0.58rem] opacity-60">Concentration</dt><dd className="mt-1">{p.concentration}</dd></div>
      </dl>
    </div>
  );
}
