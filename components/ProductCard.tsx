"use client";

import Link from "next/link";
import Image from "next/image";
import FitImage from "./FitImage";
import { Heart, Plus } from "lucide-react";
import { useCart, useUI, useWishlist } from "@/lib/store";
import { brandOf, inr, startingPrice, type Product } from "@/lib/products";

export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const liked = useWishlist((s) => s.slugs.includes(p.slug));
  const toggle = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const second = p.cutout ? (p.images.find((x) => x !== p.cutout && !x.includes("stone-")) ?? p.cutout) : (p.images[1] ?? p.images[0]);
  const ml = p.sizes[0].ml;
  const sizes = "(min-width:1024px) 25vw, (min-width:640px) 45vw, 90vw";

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2px]" style={{ background: p.mood.bg }}>
        <Link href={`/product/${p.slug}`} data-cursor="View" className="absolute inset-0 block" aria-label={`View ${p.name}`}>
          <div className="absolute inset-0 transition-all duration-[1400ms] ease-[var(--ease)] group-hover:scale-[1.04] group-hover:opacity-0">
            {p.cutout ? (
              <Image src={p.cutout} alt={`${p.name} ${p.concentration}`} fill sizes={sizes} priority={priority} className="object-contain p-[5%]" />
            ) : (
              <FitImage src={p.images[0]} alt={`${p.name} ${p.concentration}`} ratio={0.8} sizes={sizes} priority={priority} />
            )}
          </div>
          <div className="absolute inset-0 scale-105 opacity-0 transition-all duration-[1400ms] ease-[var(--ease)] group-hover:scale-100 group-hover:opacity-100">
            <FitImage src={second} alt="" ratio={0.8} sizes={sizes} />
          </div>
        </Link>
        {p.badge && (
          <span className="eyebrow pointer-events-none absolute left-4 top-4 rounded-none bg-[#f6f0e4]/90 px-3 py-1.5 text-[0.58rem] text-[#0e0b09] backdrop-blur">
            {p.badge}
          </span>
        )}
        <button
          aria-label={liked ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          aria-pressed={liked}
          onClick={() => toggle(p.slug)}
          className="absolute right-3 top-3 grid size-11 cursor-pointer place-items-center rounded-none bg-[#f6f0e4]/85 text-[#0e0b09] backdrop-blur transition-transform hover:scale-110"
        >
          <Heart size={18} strokeWidth={1.5} className={liked ? "fill-[#b9455c] text-[#b9455c]" : ""} />
        </button>
        <button
          aria-label={`Add ${p.name} to bag`}
          onClick={() => {
            add(p.slug, ml);
            setCartOpen(true);
          }}
          className="absolute bottom-2 right-2 grid size-11 cursor-pointer place-items-center bg-[#0e0b09] text-[#f6f0e4] lg:hidden"
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => {
            add(p.slug, ml);
            setCartOpen(true);
          }}
          className="eyebrow absolute inset-x-4 bottom-4 hidden translate-y-4 cursor-pointer rounded-none bg-[#0e0b09] py-3.5 text-center text-[0.6rem] text-[#f6f0e4] opacity-0 transition-all duration-500 hover:bg-[#9a6b1f] group-hover:translate-y-0 group-hover:opacity-100 lg:block"
        >
          Quick add · {ml} ml
        </button>
      </div>
      <Link href={`/product/${p.slug}`} className="mt-3.5 flex flex-col gap-1 sm:mt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="eyebrow mb-1.5 text-[0.55rem] opacity-60">{brandOf(p)}</p>
          <h3 className="display text-[1.35rem] leading-[1.05] sm:text-[1.7rem] sm:leading-none">{p.name}</h3>
          <p className="mt-1.5 text-[0.7rem] opacity-65 sm:mt-2 sm:text-xs">
            {p.family} · {p.concentration}
          </p>
        </div>
        <p className="whitespace-nowrap text-[0.8rem] sm:pt-1 sm:text-sm">
          <span className="text-xs opacity-60">from </span>
          {inr(startingPrice(p))}
        </p>
      </Link>
    </article>
  );
}
