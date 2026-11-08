"use client";

import Link from "next/link";
import FitImage from "@/components/FitImage";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { cartTotals, useCart, useUI } from "@/lib/store";
import { FREE_SHIPPING_THRESHOLD, getProduct, inr } from "@/lib/products";

export function QtyStepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-none border border-line">
      <button aria-label="Decrease quantity" className="grid size-11 place-items-center cursor-pointer" onClick={() => onChange(qty - 1)}>
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{qty}</span>
      <button aria-label="Increase quantity" className="grid size-11 place-items-center cursor-pointer" onClick={() => onChange(qty + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { items, promo, setQty, remove } = useCart();
  const t = cartTotals(items, promo);
  const progress = Math.min(100, ((t.subtotal - t.discount) / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[460px] flex-col bg-[#f6f0e4] text-[#0e0b09] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-black/10 px-7 py-6">
              <h2 className="display text-3xl">Your bag <span className="eyebrow opacity-60">({t.count})</span></h2>
              <button className="grid size-11 place-items-center rounded-full hover:bg-black/5 cursor-pointer" aria-label="Close bag" onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center px-8 text-center">
                <div>
                  <p className="display text-4xl">Your bag is empty.</p>
                  <p className="mt-3 text-sm opacity-70">Let a fragrance find you.</p>
                  <Link href="/shop" onClick={() => setCartOpen(false)} className="btn mt-8">Explore the collection</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="px-7 pt-5">
                  <p className="text-xs">
                    {t.remainingForFree > 0 ? (
                      <>You&apos;re <b>{inr(t.remainingForFree)}</b> away from complimentary shipping.</>
                    ) : (
                      <b>You&apos;ve unlocked complimentary shipping.</b>
                    )}
                  </p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-[#8a6a35] transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <ul className="flex-1 space-y-6 overflow-y-auto px-7 py-6">
                  {items.map((it) => {
                    const p = getProduct(it.slug)!;
                    const price = p.sizes.find((s) => s.ml === it.ml)?.price ?? 0;
                    return (
                      <li key={it.slug + it.ml} className="flex gap-4">
                        <Link href={`/product/${p.slug}`} onClick={() => setCartOpen(false)} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[2px]" style={{ background: p.mood.bg }}>
                          <FitImage src={p.images[0]} alt={p.name} ratio={0.8} sizes="128px" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="display text-2xl leading-none">{p.name}</p>
                              <p className="mt-1 text-xs opacity-60">{p.concentration} · {it.ml} ml</p>
                            </div>
                            <p className="text-sm font-medium">{inr(price * it.qty)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <QtyStepper qty={it.qty} onChange={(n) => setQty(it.slug, it.ml, n)} />
                            <button className="u-link text-xs cursor-pointer" onClick={() => remove(it.slug, it.ml)}>Remove</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-3 border-t border-black/10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-sm sm:px-7">
                  <Row l="Subtotal" v={inr(t.subtotal)} />
                  {t.discount > 0 && <Row l={`Promo ${promo}`} v={`− ${inr(t.discount)}`} />}
                  <Row l="Shipping" v={t.shipping ? inr(t.shipping) : "Complimentary"} />
                  <div className="flex justify-between pt-2 text-base font-semibold"><span>Total</span><span>{inr(t.total)}</span></div>
                  <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn mt-3 w-full">Checkout</Link>
                  <Link href="/cart" onClick={() => setCartOpen(false)} className="btn btn-ghost w-full">View full bag</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between"><span className="opacity-70">{l}</span><span>{v}</span></div>;
}
