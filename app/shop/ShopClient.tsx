"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { products, startingPrice, type Family, type Gender } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

const FAMILIES: Family[] = ["Floral", "Woody", "Fresh", "Oriental", "Citrus"];
const GENDERS: Gender[] = ["Women", "Men", "Unisex"];
const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "rating", l: "Top rated" },
];

export default function ShopClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const family = sp.get("family");
  const gender = sp.get("gender");
  const house = sp.get("house");
  const sort = sp.get("sort") ?? "featured";

  const set = (k: string, v: string | null) => {
    const q = new URLSearchParams(sp.toString());
    if (v) q.set(k, v);
    else q.delete(k);
    router.replace(`${pathname}${q.size ? "?" + q : ""}`, { scroll: false });
  };

  const list = useMemo(() => {
    let l = products.filter((p) => (!family || p.family === family) && (!gender || p.gender === gender) && (!house || (house === "aurelle" ? !p.brand : !!p.brand)));
    if (sort === "price-asc") l = [...l].sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "price-desc") l = [...l].sort((a, b) => startingPrice(b) - startingPrice(a));
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [family, gender, house, sort]);

  const chip = (active: boolean) =>
    `eyebrow min-h-11 cursor-pointer rounded-none border px-5 text-[0.62rem] transition-colors duration-300 ${active ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`;

  return (
    <>
      <PageHero eyebrow="The Collection" title="All fragrances" intro="Our own hand-poured compositions alongside the world’s most loved houses. Filter by family, wearer or house — or simply follow your nose." />

      <section className="mx-auto max-w-[1600px] px-5 sm:px-10">
        <div className="z-30 -mx-5 lg:sticky lg:top-20 flex flex-col gap-3 border-y border-line bg-bg/85 px-5 py-4 backdrop-blur-xl sm:-mx-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter by family">
            <button className={chip(!family)} aria-pressed={!family} onClick={() => set("family", null)}>All</button>
            {FAMILIES.map((f) => (
              <button key={f} className={chip(family === f)} aria-pressed={family === f} onClick={() => set("family", family === f ? null : f)}>{f}</button>
            ))}
            <span className="mx-1 hidden w-px bg-line lg:block" />
            {([["aurelle", "Maison Aurelle"], ["designer", "Designer houses"]] as const).map(([v, l]) => (
              <button key={v} className={chip(house === v)} aria-pressed={house === v} onClick={() => set("house", house === v ? null : v)}>{l}</button>
            ))}
            <span className="mx-1 hidden w-px bg-line lg:block" />
            {GENDERS.map((g) => (
              <button key={g} className={chip(gender === g)} aria-pressed={gender === g} onClick={() => set("gender", gender === g ? null : g)}>{g}</button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <p className="text-xs opacity-70" aria-live="polite">{list.length} fragrances</p>
            <label className="flex items-center gap-3">
              <span className="eyebrow text-[0.6rem]">Sort</span>
              <select className="field !min-h-11 !w-auto !rounded-none !py-0 pr-8 text-sm" value={sort} onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}>
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-32 text-center">
            <p className="display text-4xl">Nothing matches just yet.</p>
            <button className="btn btn-ghost mt-8" onClick={() => router.replace(pathname)}>Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 py-8 sm:gap-x-6 sm:gap-y-16 sm:py-14 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 80}>
                <ProductCard p={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
