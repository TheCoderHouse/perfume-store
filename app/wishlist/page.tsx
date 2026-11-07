"use client";

import Link from "next/link";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/lib/store";
import { products } from "@/lib/products";

export default function Wishlist() {
  const slugs = useWishlist((s) => s.slugs);
  const list = products.filter((p) => slugs.includes(p.slug));
  return (
    <>
      <PageHero eyebrow="Saved for later" title="Your wishlist" />
      <section className="mx-auto max-w-[1600px] px-5 pb-12 sm:px-10">
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm opacity-75">Tap the heart on any fragrance to keep it here.</p>
            <Link href="/shop" className="btn mt-8">Discover fragrances</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        )}
      </section>
    </>
  );
}
