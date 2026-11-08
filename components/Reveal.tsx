"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

export function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ "--d": delay } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

/** Masked word-by-word headline reveal. */
export function Words({
  text,
  className = "",
  delay = 0,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const [ref, inView] = useInView<HTMLElement>(0.1);
  return (
    <Tag ref={ref} className={`${inView ? "in" : ""} ${className}`} style={{ "--d": delay } as React.CSSProperties} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="mask-word" aria-hidden>
          <span style={{ "--i": i } as React.CSSProperties}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div className="marquee-track">
        {row.concat(row).map((t, i) => (
          <span key={i} className="display flex items-center gap-10 pr-10 text-5xl sm:text-7xl">
            {t}
            <span className="size-2 rotate-45 bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
