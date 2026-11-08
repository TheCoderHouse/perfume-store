"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/store";
import { getProduct, inr } from "@/lib/products";
import { useHydrated } from "@/lib/useHydrated";

export default function Confirmation() {
  const order = useAuth((s) => s.lastOrder);
  const ready = useHydrated();
  if (!ready) return <div className="min-h-screen" />;
  if (!order)
    return (
      <div className="grid min-h-[80svh] place-items-center px-5 text-center">
        <div><p className="display text-5xl">No recent order.</p><Link href="/shop" className="btn mt-8">Shop fragrances</Link></div>
      </div>
    );
  return (
    <section className="mx-auto max-w-2xl px-5 pb-12 pt-40 text-center">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#D9E9DA] text-[#2F6B4A]"><Check size={34} strokeWidth={1.5} /></span>
      <h1 className="display mt-8 text-6xl sm:text-7xl">Thank you.</h1>
      <p className="mt-4 text-sm opacity-75">Order <b>{order.id}</b> is confirmed. A discovery vial is tucked into your parcel.</p>
      <div className="mt-10 rounded-[2px] border border-line p-8 text-left text-sm">
        <ul className="space-y-3">
          {order.items.map((it) => <li key={it.slug + it.ml} className="flex justify-between"><span>{getProduct(it.slug)?.name} · {it.ml} ml × {it.qty}</span><span className="opacity-70">{inr((getProduct(it.slug)?.sizes.find((s) => s.ml === it.ml)?.price ?? 0) * it.qty)}</span></li>)}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-5 text-base font-semibold"><span>Total</span><span>{inr(order.total)}</span></div>
        <p className="mt-5 text-xs opacity-65">Delivering to {order.address} · Estimated 2–4 business days</p>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/account" className="btn">View my orders</Link>
        <Link href="/shop" className="btn btn-ghost">Keep exploring</Link>
      </div>
    </section>
  );
}
