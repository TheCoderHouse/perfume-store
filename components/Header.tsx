"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { cartTotals, useAuth, useCart, useUI, useWishlist } from "@/lib/store";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?family=Oriental", label: "Collections" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const wish = useWishlist((s) => s.slugs.length);
  const user = useAuth((s) => s.user);
  const { menuOpen, setMenuOpen, setCartOpen, onDark } = useUI();
  const count = cartTotals(items, null).count;

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 320);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  const iconBtn =
    "relative grid size-11 place-items-center rounded-full transition-colors hover:bg-fg/10 cursor-pointer";

  return (
    <>
      <header
        style={onDark ? { color: "#efe5d0" } : undefined}
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-700 ${onDark ? "bg-transparent" : "bg-bg/90 backdrop-blur-xl"} ${scrolled && !onDark ? "border-b border-line" : ""} ${hidden && !menuOpen ? "-translate-y-full" : ""}`}
      >
        <div
          className={`mx-auto flex h-20 max-w-[1800px] items-center justify-between px-5 sm:px-10`}
        >
          <nav className="hidden flex-1 gap-9 md:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                aria-current={pathname === n.href.split("?")[0] && n.label !== "Collections" ? "page" : undefined}
                className="u-link eyebrow"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <button className={`${iconBtn} md:hidden`} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} strokeWidth={1.4} />
          </button>

          <Link href="/" className="display text-[1.7rem] tracking-[0.34em] sm:text-3xl" aria-label="Maison Aurelle home">
            AURELLE
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1">
            <Link href={user ? "/account" : "/login"} className={`${iconBtn} hidden sm:grid`} aria-label={user ? "Account" : "Sign in"}>
              <User size={20} strokeWidth={1.4} />
            </Link>
            <Link href="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wish} items`}>
              <Heart size={20} strokeWidth={1.4} />
              {wish > 0 && <Badge n={wish} />}
            </Link>
            <button className={iconBtn} aria-label={`Open bag, ${count} items`} onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} strokeWidth={1.4} />
              {count > 0 && <Badge n={count} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-ink px-8 pb-10 pt-6 text-cream"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="display text-2xl tracking-[0.3em]">AURELLE</span>
              <button className="grid size-11 place-items-center rounded-none border border-white/20" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="mt-14 flex flex-1 flex-col gap-3" aria-label="Mobile">
              {[...NAV, { href: user ? "/account" : "/login", label: user ? "Account" : "Sign in" }, { href: "/wishlist", label: "Wishlist" }].map((n, i) => (
                <motion.div key={n.label} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
                  <Link href={n.href} className="display block text-5xl">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="eyebrow opacity-60">Free shipping over ₹10,000</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold leading-4 text-white">
      {n}
    </span>
  );
}
