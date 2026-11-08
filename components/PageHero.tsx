import { Words } from "./Reveal";

export default function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="mx-auto max-w-[1600px] px-5 pb-8 pt-28 sm:px-10 sm:pb-12 sm:pt-44">
      <p className="eyebrow mb-4 flex items-center gap-3 sm:mb-6"><span className="h-px w-10 bg-current" /> {eyebrow}</p>
      <Words as="h1" text={title} className="display text-[clamp(3.4rem,9vw,8.5rem)]" />
      {intro && <p className="mt-6 max-w-xl text-sm leading-relaxed opacity-75">{intro}</p>}
    </header>
  );
}
