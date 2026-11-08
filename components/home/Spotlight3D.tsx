"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getProduct } from "@/lib/products";
import { Reveal, Words } from "@/components/Reveal";

const p = getProduct("ysl-libre")!;

export default function Spotlight3D() {
  return (
    <section className="bg-[#120d09] text-[#f2e3c4]">
      <div className="mx-auto grid max-w-[1600px] items-center gap-6 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div className="order-2 lg:order-1">
          <p className="eyebrow mb-6 text-[#d4a24c]">The Art of Display</p>
          <Words text="Hold it in your hands." className="display text-5xl sm:text-7xl" />
          <Reveal delay={200} className="mt-8 max-w-md text-sm leading-relaxed opacity-80">
            Libre Intense, set in hand-carved stone: gold, amber and a quiet dark. Every flacon is photographed in its own sculpted setting before it ever reaches your door.
          </Reveal>
          <Reveal delay={300}>
            <Link href={`/product/${p.slug}`} className="btn mt-10 !border-[#d4a24c] !bg-[#d4a24c] !text-[#120d09]">
              Discover Libre <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
        <div className="relative order-1 aspect-square w-full max-w-[640px] justify-self-center lg:order-2 lg:justify-self-end">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(184,134,47,0.35)_0%,transparent_65%)]" aria-hidden />
          <Image src="/images/stone-7.png" alt="YSL Libre Intense in a carved stone niche" fill sizes="(min-width:1024px) 40vw, 90vw" className="animate-[float-y_7s_ease-in-out_infinite] object-contain" />
        </div>
      </div>
    </section>
  );
}
