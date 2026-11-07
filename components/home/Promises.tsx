import { Gift, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const ITEMS = [
  { i: Truck, t: "Complimentary shipping", d: "On every order over ₹10,000, in signature packaging." },
  { i: Gift, t: "Discovery vial", d: "A 2 ml sample of your choice with your first order." },
  { i: ShieldCheck, t: "Authenticity promised", d: "Every flacon is numbered and sealed at the Maison." },
  { i: Leaf, t: "Refillable crystal", d: "Return an empty flacon and we’ll refill it for 15% less." },
];

export default function Promises() {
  return (
    <section className="mx-auto max-w-[1600px] px-5 sm:px-10">
      <div className="grid gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <Reveal key={it.t} delay={i * 80} className="bg-bg p-8">
            <it.i size={26} strokeWidth={1.2} className="text-accent" />
            <h3 className="display mt-6 text-2xl">{it.t}</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-70">{it.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
