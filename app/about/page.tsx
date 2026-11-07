import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Reveal, Words, Marquee } from "@/components/Reveal";

export const metadata: Metadata = { title: "Our story" };

const STATS = [["90", "days of resting for every blend"], ["40", "bottles per hand-poured batch"], ["28%", "pure oil in our extraits"], ["9", "signature compositions"]];
const TIMELINE = [
  ["2014", "A small atelier opens above a flower market in Grasse."],
  ["2017", "First extrait — Midnight Oud — sells out in eleven days."],
  ["2021", "The refillable crystal programme launches."],
  ["2026", "Maison Aurelle opens its doors online, in India and beyond."],
];

export default function About() {
  return (
    <>
      <PageHero eyebrow="Our story" title="Parfum d’auteur." intro="Maison Aurelle is an independent house composing small-batch fragrances for people who prefer to be remembered, not announced." />

      <section className="mx-auto grid max-w-[1500px] items-center gap-14 px-5 py-16 sm:px-10 lg:grid-cols-2">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-[2px]"><Image src="/images/23.jpg" alt="A bride applying perfume by a window" fill sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" /></Reveal>
        <div>
          <Words text="Born in a flower market." className="display text-5xl italic sm:text-7xl" />
          <Reveal delay={150} className="mt-8 max-w-lg space-y-5 text-[0.95rem] leading-[1.85] opacity-85">
            <p>Our founder, a perfumer trained in Grasse, believed that scent should behave like memory: slow to arrive and impossible to shake. So we left the fast lane. Every composition rests for ninety days in glass before it earns its label.</p>
            <p>We work with a short list of growers, pour by hand in batches of forty, and never rush the blend. The result is fragrance with depth, a quiet confidence that changes as the hours pass.</p>
          </Reveal>
        </div>
      </section>

      <Marquee items={["Hand-poured", "Small batch", "Refillable", "Cruelty-free"]} className="mt-16 border-y border-line py-7" />

      <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-10">
        <div className="grid gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(([n, l], i) => (
            <Reveal key={l} delay={i * 90} className="bg-bg p-8"><p className="display text-7xl italic text-accent">{n}</p><p className="mt-3 text-sm opacity-75">{l}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-14 px-5 pb-28 sm:px-10 lg:grid-cols-[1fr_1.2fr]">
        <Words text="A short, slow history." className="display text-5xl italic sm:text-7xl" />
        <ol className="divide-y divide-line border-y border-line">
          {TIMELINE.map(([y, t]) => (
            <Reveal as="li" key={y} className="flex gap-8 py-8"><span className="display w-24 shrink-0 text-4xl italic text-accent">{y}</span><p className="text-sm leading-relaxed opacity-85">{t}</p></Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-ink px-5 py-28 text-center text-cream sm:px-10">
        <Words text="Ready to find yours?" className="display text-5xl italic sm:text-8xl" />
        <Link href="/shop" className="btn mt-10 !bg-cream !text-ink hover:!text-white">Explore the collection</Link>
      </section>
      <div className="relative mx-auto -mt-px hidden aspect-[16/5] max-w-none overflow-hidden lg:block"><Image src="/images/25.jpg" alt="" fill sizes="100vw" className="object-cover" /></div>
    </>
  );
}
