import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Reveal, Words } from "@/components/Reveal";

export default function Bestsellers() {
  const list = products.filter((p) => !p.brand && (p.badge === "Bestseller" || p.badge === "New" || p.badge === "Limited")).slice(0, 4);
  return (
    <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-10 sm:py-24 lg:py-32">
      <div className="mb-14 flex items-end justify-between gap-6">
        <Words text="Most loved." className="display text-6xl sm:text-8xl" />
        <Link href="/shop" className="btn btn-ghost max-sm:!hidden shrink-0 self-end">Shop all <ArrowRight size={14} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
        {list.map((p, i) => (
          <Reveal key={p.slug} delay={i * 90}>
            <ProductCard p={p} />
          </Reveal>
        ))}
      </div>
      <Link href="/shop" className="btn btn-ghost mt-12 sm:!hidden">Shop all <ArrowRight size={14} /></Link>
    </section>
  );
}
