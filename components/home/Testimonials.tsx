"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";

const QUOTES = [
  { q: "Midnight Oud arrives like a slow exhale — dark, resinous and unbelievably refined. Compliments for days.", a: "Kabir M.", p: "Midnight Oud" },
  { q: "I have never smelled a peony this alive. Aurora Bloom is the first fragrance my mother and I both fight over.", a: "Naina R.", p: "Aurora Bloom" },
  { q: "Azure Homme lasts from board meeting to dinner. Clean, cold, and quietly confident.", a: "Dev P.", p: "Azure Homme" },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const q = QUOTES[i];
  return (
    <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-10 sm:py-24 lg:py-32">
      <div className="flex justify-center gap-1 text-accent" aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} className="fill-current" />)}
      </div>
      <div className="relative mt-10 min-h-[15rem] sm:min-h-[12rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.blockquote key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}>
            <p className="display text-3xl leading-tight sm:text-5xl">“{q.q}”</p>
            <footer className="eyebrow mt-8 opacity-70">{q.a} · {q.p}</footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-10 flex justify-center gap-1">
        {QUOTES.map((_, k) => (
          <button key={k} aria-label={`Show review ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className="grid h-11 w-11 cursor-pointer place-items-center">
            <span className={`block h-1 rounded-full bg-current transition-all duration-500 ${k === i ? "w-10" : "w-4 opacity-30"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
