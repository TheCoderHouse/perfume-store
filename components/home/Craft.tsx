"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Words } from "@/components/Reveal";

const STEPS = [
  { n: "I", t: "Sourcing", d: "Oud from Laos, jasmine from Grasse, sandalwood from Mysore — each raw material is traced to a single harvest.", img: "/images/25.jpg" },
  { n: "II", t: "Blending", d: "Our perfumers compose by hand in batches of forty bottles, adjusting by nose rather than by formula.", img: "/images/24.jpg" },
  { n: "III", t: "Resting", d: "Every blend rests for ninety days in glass, letting the notes marry before a single drop is bottled.", img: "/images/23.jpg" },
];

export default function Craft() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".cr-img").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(18% 12% 18% 12% round 2rem)" }, { clipPath: "inset(0% 0% 0% 0% round 2rem)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 25%", scrub: true } });
        gsap.fromTo(el.querySelector("img"), { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 30%", scrub: true } });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-ink text-cream">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 sm:gap-16 sm:px-10 sm:py-28 lg:grid-cols-2 lg:py-40">
        <div className="lg:sticky lg:top-28 lg:self-start lg:h-[70svh]">
          <p className="eyebrow mb-6 text-gold">The Craft</p>
          <Words text="Slow by design. Exact by nature." className="display text-5xl italic sm:text-7xl" />
          <p className="mt-8 max-w-md text-sm leading-relaxed text-cream/70">
            In a world of fast fragrance, we choose the long way round. Three patient stages, one unhurried philosophy.
          </p>
        </div>
        <div className="space-y-16 sm:space-y-28">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="cr-img relative aspect-[4/3] overflow-hidden">
                <Image src={s.img} alt="" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
              </div>
              <div className="mt-6 flex gap-6">
                <span className="display text-5xl italic text-gold">{s.n}</span>
                <div>
                  <h3 className="display text-3xl">{s.t}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/70">{s.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
