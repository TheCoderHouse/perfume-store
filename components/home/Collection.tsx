"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getProduct, inr, startingPrice } from "@/lib/products";

const PICKS = [
  { slug: "coco-mademoiselle", img: "/images/stone-2.png", bg: "#2a1614" },
  { slug: "versace-eros", img: "/images/stone-5.png", bg: "#0e2f35" },
  { slug: "ysl-libre", img: "/images/stone-7.png", bg: "#17120d" },
];
const LIST = PICKS.map((x) => ({ ...getProduct(x.slug)!, img: x.img, bg: x.bg }));
const N = LIST.length;

/**
 * Desktop: one pinned stage. As you scroll, each fragrance "opens" like an iris
 * over the previous one while its name, notes and counter roll over.
 * Mobile / reduced motion: a simple vertical list.
 */
export default function Collection() {
  const section = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const el = section.current!;
      const layers = gsap.utils.toArray<HTMLElement>(".cs-layer", el);
      const texts = gsap.utils.toArray<HTMLElement>(".cs-text", el);
      const dots = gsap.utils.toArray<HTMLElement>(".cs-dot", el);
      const bigs = gsap.utils.toArray<HTMLElement>(".cs-big", el);

      gsap.set(layers.slice(1), { clipPath: "circle(0% at 50% 50%)" });
      gsap.set(texts.slice(1), { autoAlpha: 0, yPercent: 14 });
      gsap.set(bigs.slice(1), { yPercent: 100 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.8,
          start: "top top",
          end: () => "+=" + (N - 1) * window.innerHeight * 0.85,
          snap: { snapTo: 1 / (N - 1), duration: { min: 0.25, max: 0.7 }, ease: "power2.inOut" },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.round(self.progress * (N - 1));
            if (counter.current) counter.current.textContent = String(i + 1).padStart(2, "0");
            dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
          },
        },
      });

      for (let i = 1; i < N; i++) {
        const t = i - 1;
        tl.to(layers[i], { clipPath: "circle(78% at 50% 50%)", duration: 0.8, ease: "power1.inOut" }, t)
          .to(layers[i - 1], { scale: 1.12, duration: 0.8, ease: "none" }, t)
          .fromTo(layers[i].querySelector(".cs-zoom"), { scale: 1.25 }, { scale: 1, duration: 0.8, ease: "none" }, t)
          .to(texts[i - 1], { autoAlpha: 0, yPercent: -14, duration: 0.35 }, t)
          .to(texts[i], { autoAlpha: 1, yPercent: 0, duration: 0.4 }, t + 0.45)
          .to(bigs[i - 1], { yPercent: -140, duration: 0.5 }, t)
          .to(bigs[i], { yPercent: 0, duration: 0.5 }, t + 0.3)
          .addLabel("hold" + i, t + 1);
      }
    });
    return () => mm.revert();
  }, []);

  return (
    // The outer div is owned by React; GSAP's pin-spacer is created inside it.
    <div>
      <section ref={section} className="relative overflow-hidden" aria-label="The collection">
        {/* Desktop stage */}
        <div className="hidden min-h-[100svh] grid-cols-[1fr_auto] items-center gap-10 px-10 pb-10 pt-28 min-[900px]:grid">
          <div className="relative flex h-[68vh] flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="eyebrow">The Collection</p>
              <p className="eyebrow tabular-nums">
                <span ref={counter}>01</span> / {String(N).padStart(2, "0")}
              </p>
            </div>

            {/* giant name, rolling */}
            <div className="relative h-[24vh] overflow-hidden">
              {LIST.map((p) => (
                <div key={p.slug} className="cs-big absolute inset-0 flex items-center">
                  <span className="display whitespace-nowrap text-[min(11vw,12.5rem)] italic leading-[1.15]">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="relative h-[22vh]">
              {LIST.map((p) => (
                <div key={p.slug} className="cs-text absolute inset-0 max-w-xl">
                  <p className="eyebrow mb-3 opacity-70">
                    {p.family} · {p.gender} · {p.concentration}
                  </p>
                  <p className="display text-3xl leading-tight">{p.tagline}</p>
                  <p className="mt-3 text-sm opacity-75">{[...p.notes.top.slice(0, 1), ...p.notes.heart.slice(0, 1), ...p.notes.base.slice(0, 1)].join(" · ")}</p>
                  <div className="mt-5 flex items-center gap-6">
                    <span className="text-sm">{inr(startingPrice(p))}</span>
                    <Link href={`/product/${p.slug}`} className="btn !min-h-11 !px-6">
                      Discover <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2" aria-hidden>
              {LIST.map((p) => (
                <span key={p.slug} className="cs-dot group relative block h-[2px] w-12 bg-current opacity-25 transition-all duration-500 [&.is-on]:w-20 [&.is-on]:opacity-100" />
              ))}
            </div>
          </div>

          {/* iris stage */}
          <div className="relative h-[72vh] w-[min(36vw,560px)] overflow-hidden rounded-t-[999px] rounded-[2px]" data-cursor="Scroll">
            {LIST.map((p, i) => (
              <div key={p.slug} className="cs-layer absolute inset-0" style={{ background: p.bg, zIndex: i }}>
                <div className="cs-zoom absolute inset-0">
                  <Image src={p.img} alt={`${p.name} in a carved stone niche`} fill sizes="36vw" priority={i === 0} className="object-contain p-[7%]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: swipeable snap carousel */}
        <div className="py-16 min-[900px]:hidden">
          <div className="px-5">
            <p className="eyebrow mb-3">The Collection</p>
            <h2 className="display text-5xl">Three signatures.</h2>
          </div>
          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scroll-padding-inline:1.25rem]">
            {LIST.map((p) => (
              <article key={p.slug} className="w-[78%] max-w-sm shrink-0 snap-start">
                <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-ink" style={{ background: p.bg }}>
                  <Image src={p.img} alt={`${p.name} in a carved stone niche`} fill sizes="80vw" className="object-contain p-[6%]" />
                </Link>
                <p className="eyebrow mt-4 text-[0.6rem] opacity-70">{p.family} · {p.gender}</p>
                <h3 className="display mt-1.5 text-4xl italic leading-none">{p.name}</h3>
                <p className="mt-2 text-sm opacity-80">{p.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">{inr(startingPrice(p))}</span>
                  <Link href={`/product/${p.slug}`} className="u-link eyebrow inline-flex min-h-11 items-center gap-2 text-[0.62rem]">Discover <ArrowUpRight size={13} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
