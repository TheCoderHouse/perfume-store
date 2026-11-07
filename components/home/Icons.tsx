import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProduct } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Reveal, Words } from "@/components/Reveal";

const SLUGS = ["chanel-no5", "ysl-libre", "si-intense", "versace-eros", "acqua-di-gio", "coco-mademoiselle", "la-vie-est-belle", "voce-viva"];

export default function Icons() {
  const list = SLUGS.map((s) => getProduct(s)!);
  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-12 sm:px-10">
      <div className="mb-14 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <Words text="The icons." className="display text-6xl italic sm:text-8xl" />
        <div className="flex items-center gap-8">
          <p className="max-w-xs text-sm leading-relaxed opacity-75">Authenticated designer houses, curated alongside our own compositions.</p>
          <Link href="/shop?house=designer" className="btn btn-ghost max-sm:!hidden">View houses <ArrowRight size={14} /></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
        {list.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 4) * 90}>
            <ProductCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
