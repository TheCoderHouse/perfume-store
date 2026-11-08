"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { useAuth, useWishlist } from "@/lib/store";
import { getProduct, inr, products } from "@/lib/products";
import { useHydrated } from "@/lib/useHydrated";

const STATUS: Record<string, string> = {
  Delivered: "bg-[#D9E9DA] text-[#2F6B4A]",
  Shipped: "bg-[#F4E4BD] text-[#8F5906]",
  Processing: "bg-[#F4E4BD] text-[#8F5906]",
};

export default function Account() {
  const router = useRouter();
  const ready = useHydrated();
  const { user, orders, logout } = useAuth();
  const wish = useWishlist((s) => s.slugs);
  const [tab, setTab] = useState<"orders" | "wishlist" | "profile">("orders");

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  if (!ready || !user) return <div className="min-h-screen" />;

  return (
    <>
      <PageHero eyebrow="My account" title={`Bonjour, ${user.name.split(" ")[0]}`} />
      <section className="mx-auto max-w-[1300px] px-5 pb-12 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="tablist">
            {(["orders", "wishlist", "profile"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`eyebrow min-h-11 cursor-pointer rounded-none border px-6 text-[0.62rem] capitalize transition-colors ${tab === t ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}>{t}</button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => { logout(); router.push("/"); }}><LogOut size={14} /> Sign out</button>
        </div>

        {tab === "orders" && (
          <div className="mt-10 space-y-5">
            {orders.length === 0 && <div className="py-20 text-center"><p className="display text-4xl">No orders yet.</p><Link href="/shop" className="btn mt-8">Begin exploring</Link></div>}
            {orders.map((o) => (
              <article key={o.id} className="rounded-[2px] border border-line p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="display text-2xl">{o.id}</p><p className="text-xs opacity-65">Placed {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                  <span className={`eyebrow rounded-none px-4 py-2 text-[0.58rem] ${STATUS[o.status]}`}>{o.status}</span>
                </div>
                <ul className="mt-5 space-y-1.5 text-sm">{o.items.map((it) => <li key={it.slug + it.ml}>{getProduct(it.slug)?.name} · {it.ml} ml × {it.qty}</li>)}</ul>
                <div className="mt-5 flex justify-between border-t border-line pt-4 text-sm"><span className="opacity-65">{o.address}</span><b>{inr(o.total)}</b></div>
              </article>
            ))}
          </div>
        )}
        {tab === "wishlist" && (
          <div className="mt-10">
            {wish.length === 0 ? <p className="py-16 text-center opacity-70">Your wishlist is empty.</p> : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-3">{products.filter((p) => wish.includes(p.slug)).map((p) => <ProductCard key={p.slug} p={p} />)}</div>
            )}
          </div>
        )}
        {tab === "profile" && (
          <dl className="mt-10 grid max-w-xl gap-6 rounded-[2px] border border-line p-8">
            <div><dt className="label">Name</dt><dd>{user.name}</dd></div>
            <div><dt className="label">Email</dt><dd>{user.email}</dd></div>
            <div><dt className="label">Membership</dt><dd>Inner Circle · complimentary discovery vials</dd></div>
          </dl>
        )}
      </section>
    </>
  );
}
