"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <footer className="mt-20 sm:mt-32 bg-ink text-cream">
      <div className="mx-auto grid max-w-[1500px] gap-14 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="display text-4xl italic leading-tight sm:text-5xl">Join the inner circle.</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            New compositions, private releases and a complimentary discovery vial with your first order.
          </p>
          <form
            className="mt-8 flex max-w-md items-center gap-2 border-b border-white/30 pb-2 focus-within:border-gold"
            onSubmit={(e) => {
              e.preventDefault();
              if (/\S+@\S+\.\S+/.test(email)) setSent(true);
            }}
          >
            <label htmlFor="nl" className="sr-only">
              Email address
            </label>
            <input
              id="nl"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={sent ? "Thank you — welcome in." : "Your email address"}
              disabled={sent}
              className="min-h-11 flex-1 bg-transparent text-sm placeholder:text-cream/50 focus:outline-none"
            />
            <button className="eyebrow grid min-h-11 place-items-center px-3 text-gold" aria-label="Subscribe">
              {sent ? "Subscribed" : "Subscribe"}
            </button>
          </form>
        </div>
        <FooterCol title="Shop" links={[["All fragrances", "/shop"], ["Floral", "/shop?family=Floral"], ["Woody", "/shop?family=Woody"], ["Oriental", "/shop?family=Oriental"], ["Fresh & Citrus", "/shop?family=Fresh"]]} />
        <FooterCol title="Maison" links={[["Our story", "/about"], ["Contact", "/contact"], ["Wishlist", "/wishlist"], ["Account", "/account"]]} />
        <FooterCol title="Care" links={[["Shipping & returns", "/contact"], ["Gift wrapping", "/contact"], ["Fragrance guide", "/about"], ["Authenticity", "/about"]]} />
      </div>
      <div className="mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-4 border-t border-white/10 px-6 py-8 text-xs text-cream/60 sm:flex-row sm:px-10">
        <span>© 2026 Maison Aurelle. A demonstration storefront — all products and data are fictional.</span>
        <span className="eyebrow">Wear it. Remember it.</span>
      </div>
      <div className="display overflow-hidden px-4 pb-2 text-center text-[22vw] leading-[0.8] tracking-[0.04em] text-white/[0.06]" aria-hidden>
        AURELLE
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-6 text-gold">{title}</p>
      <ul className="space-y-3">
        {links.map(([l, h]) => (
          <li key={l}>
            <Link href={h} className="group inline-flex min-h-9 items-center gap-1 text-sm text-cream/80 transition-colors hover:text-white">
              {l}
              <ArrowUpRight size={13} className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
