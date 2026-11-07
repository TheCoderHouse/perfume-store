"use client";

import { useState } from "react";
import Link from "next/link";
import FitImage from "@/components/FitImage";
import { Trash2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import OrderSummary from "@/components/OrderSummary";
import { QtyStepper } from "@/components/CartDrawer";
import { cartTotals, useCart } from "@/lib/store";
import { FREE_SHIPPING_THRESHOLD, getProduct, inr, PROMO } from "@/lib/products";

export default function CartPage() {
  const { items, promo, setQty, remove, applyPromo, clearPromo } = useCart();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const t = cartTotals(items, promo);

  return (
    <>
      <PageHero eyebrow="Shopping bag" title={items.length ? "Your selection" : "Your bag is empty"} />
      {items.length === 0 ? (
        <div className="mx-auto max-w-xl px-5 pb-32 text-center">
          <p className="text-sm opacity-75">Nothing here yet — let a fragrance find you.</p>
          <Link href="/shop" className="btn mt-8">Explore the collection</Link>
        </div>
      ) : (
        <section className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-12 sm:px-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-8 rounded-[2px] border border-line p-5 text-sm">
              {t.remainingForFree > 0 ? <>Add <b>{inr(t.remainingForFree)}</b> more for complimentary shipping.</> : <b>Complimentary shipping unlocked.</b>}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-fg/10"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${Math.min(100, ((t.subtotal - t.discount) / FREE_SHIPPING_THRESHOLD) * 100)}%` }} /></div>
            </div>
            <ul className="divide-y divide-line">
              {items.map((it) => {
                const p = getProduct(it.slug)!;
                const price = p.sizes.find((s) => s.ml === it.ml)!.price;
                return (
                  <li key={it.slug + it.ml} className="flex gap-5 py-7">
                    <Link href={`/product/${p.slug}`} className="relative h-32 w-24 shrink-0 sm:h-40 sm:w-32 overflow-hidden rounded-[2px]" style={{ background: p.mood.bg }}>
                      <FitImage src={p.images[0]} alt={p.name} ratio={0.8} sizes="128px" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link href={`/product/${p.slug}`} className="display text-2xl italic sm:text-3xl">{p.name}</Link>
                          <p className="mt-1 text-xs opacity-65">{p.concentration} · {it.ml} ml</p>
                          <p className="mt-1 text-xs opacity-65">{inr(price)} each</p>
                        </div>
                        <p className="text-sm sm:text-base">{inr(price * it.qty)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <QtyStepper qty={it.qty} onChange={(n) => setQty(it.slug, it.ml, n)} />
                        <button className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs hover:text-accent" onClick={() => remove(it.slug, it.ml)}><Trash2 size={14} /> Remove</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <form
              className="rounded-[2px] border border-line p-7"
              onSubmit={(e) => {
                e.preventDefault();
                const ok = applyPromo(code);
                setMsg(ok ? { ok, t: `${PROMO.pct}% off applied.` } : { ok, t: "That code isn’t valid." });
              }}
            >
              <label htmlFor="promo" className="label">Promo code</label>
              <div className="flex gap-2">
                <input id="promo" className="field" placeholder={`Try ${PROMO.code}`} value={code} onChange={(e) => setCode(e.target.value)} />
                <button className="btn !px-6">Apply</button>
              </div>
              <p role="status" className={`mt-3 text-xs ${msg?.ok ? "text-[#2f6b4a]" : "text-[#b3261e]"}`}>{msg?.t}</p>
              {promo && <button type="button" className="u-link mt-2 text-xs cursor-pointer" onClick={() => { clearPromo(); setMsg(null); }}>Remove {promo}</button>}
            </form>
            <OrderSummary />
            <Link href="/checkout" className="btn w-full">Proceed to checkout</Link>
            <Link href="/shop" className="btn btn-ghost w-full">Continue shopping</Link>
          </aside>
        </section>
      )}
    </>
  );
}
