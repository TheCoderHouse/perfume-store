"use client";

import Image from "next/image";
import { cartTotals, useCart } from "@/lib/store";
import { getProduct, inr } from "@/lib/products";

export default function OrderSummary() {
  const { items, promo } = useCart();
  const t = cartTotals(items, promo);
  return (
    <div className="rounded-[2px] border border-line p-7">
      <h2 className="display text-3xl">Order summary</h2>
      <ul className="mt-6 space-y-5">
        {items.map((it) => {
          const p = getProduct(it.slug)!;
          const price = p.sizes.find((s) => s.ml === it.ml)!.price;
          return (
            <li key={it.slug + it.ml} className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-[2px]" style={{ background: p.mood.bg }}>
                <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                <span className="absolute -right-0 -top-0 grid size-5 place-items-center rounded-bl-lg bg-fg text-[0.6rem] text-bg">{it.qty}</span>
              </div>
              <div className="flex-1 text-sm"><p className="font-medium">{p.name}</p><p className="text-xs opacity-60">{it.ml} ml</p></div>
              <p className="text-sm">{inr(price * it.qty)}</p>
            </li>
          );
        })}
      </ul>
      <dl className="mt-6 space-y-2.5 border-t border-line pt-6 text-sm">
        <div className="flex justify-between"><dt className="opacity-70">Subtotal</dt><dd>{inr(t.subtotal)}</dd></div>
        {t.discount > 0 && <div className="flex justify-between"><dt className="opacity-70">Promo {promo}</dt><dd>− {inr(t.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="opacity-70">Shipping</dt><dd>{t.shipping ? inr(t.shipping) : "Complimentary"}</dd></div>
        <div className="flex justify-between pt-3 text-lg font-semibold"><dt>Total</dt><dd>{inr(t.total)}</dd></div>
      </dl>
    </div>
  );
}
