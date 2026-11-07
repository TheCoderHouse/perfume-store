"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import FitImage from "@/components/FitImage";
import { families, getProduct } from "@/lib/products";
import { Reveal, Words } from "@/components/Reveal";

const PREVIEW = ["chanel-no5", "santal-reserve", "versace-eros", "coco-mademoiselle", "citrus-veil"];

/** Editorial index (left) with one fixed preview panel (right) that cross-fades in place. */
export default function Families() {
  const [active, setActive] = useState(0);
  const f = families[active];
  const pp = getProduct(PREVIEW[active])!;

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-10 sm:py-24 lg:py-36">
      <div className="mb-10 grid gap-6 sm:mb-16 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-10 bg-current" /> Scent families</p>
          <Words text="Find your family." className="display text-6xl sm:text-8xl" />
        </div>
        <Reveal className="max-w-xs text-sm leading-relaxed opacity-75">
          Begin with the mood you want to wear. Each family gathers the compositions that share its character.
        </Reveal>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <ul className="border-t border-line" onPointerLeave={() => undefined}>
          {families.map((fam, i) => (
            <li key={fam.name} className="border-b border-line">
              <Link
                href={`/shop?family=${fam.name}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-current={i === active}
                className="group relative grid grid-cols-[2rem_1fr_3.5rem] items-center gap-3 py-5 md:grid-cols-[3.5rem_1fr_auto] md:py-8"
              >
                <span className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-accent transition-transform duration-500 group-aria-[current=true]:scale-y-100 max-md:hidden" aria-hidden />
                <span className="eyebrow tabular-nums opacity-60 md:pl-5">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className={`display block text-[clamp(2.6rem,12vw,3.6rem)] font-light leading-none transition-all duration-700 ease-[var(--ease)] md:text-[clamp(2.6rem,5vw,5rem)] ${i === active ? "md:translate-x-3 md:text-accent" : "md:opacity-45"}`}>
                    {fam.name}
                  </span>
                  <span className={`mt-2 hidden text-sm opacity-70 transition-all duration-500 md:block ${i === active ? "max-h-8 opacity-70" : "max-h-0 overflow-hidden opacity-0"}`}>{fam.blurb}</span>
                </span>
                <span className="relative size-14 overflow-hidden bg-ink md:hidden" aria-hidden>
                  <FitImage src={getProduct(PREVIEW[i])!.cutout ?? getProduct(PREVIEW[i])!.images[0]} alt="" sizes="56px" />
                </span>
                <span className={`hidden size-11 place-items-center border transition-all duration-500 md:grid ${i === active ? "border-fg bg-fg text-bg" : "border-line"}`}>
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* fixed preview panel (desktop) */}
        <aside className="relative hidden lg:block" aria-hidden>
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ background: pp.mood.bg, transition: "background-color 0.8s var(--ease)" }}>
              {families.map((fam, i) => {
                const p = getProduct(PREVIEW[i])!;
                return (
                  <div key={fam.name} className={`absolute inset-0 transition-opacity duration-700 ease-[var(--ease)] ${i === active ? "opacity-100" : "opacity-0"}`}>
                    {p.cutout ? (
                      <Image src={p.cutout} alt="" fill sizes="35vw" className="object-contain p-[6%]" />
                    ) : (
                      <FitImage src={p.images[0]} alt="" sizes="35vw" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="eyebrow text-[0.6rem] opacity-60">{String(active + 1).padStart(2, "0")} / {String(families.length).padStart(2, "0")}</p>
                <p className="display mt-1 text-3xl">{f.name}</p>
              </div>
              <p className="eyebrow text-[0.6rem] opacity-70">{f.slugs.length} fragrances</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
