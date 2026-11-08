"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", topic: "Fragrance advice", msg: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Please tell us your name.";
    if (!/\S+@\S+\.\S+/.test(f.email)) v.email = "Enter a valid email address.";
    if (f.msg.trim().length < 10) v.msg = "A few more words, please.";
    setErr(v);
    if (!Object.keys(v).length) setSent(true);
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s talk scent." intro="Our fragrance advisors reply within one working day." />
      <section className="mx-auto grid max-w-[1300px] gap-16 px-5 pb-12 sm:px-10 lg:grid-cols-[1.2fr_1fr]">
        {sent ? (
          <div role="status" className="rounded-[2px] bg-[#D9E9DA] p-10 text-[#2F6B4A]">
            <p className="display text-5xl">Merci, {f.name.split(" ")[0]}.</p>
            <p className="mt-3 text-sm">Your message is with our advisors. Expect a reply at {f.email} shortly.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="name" className="label">Name</label><input id="name" className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} />{err.name && <p className="mt-1.5 text-xs text-[#b3261e]">{err.name}</p>}</div>
              <div><label htmlFor="email" className="label">Email</label><input id="email" type="email" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!err.email} />{err.email && <p className="mt-1.5 text-xs text-[#b3261e]">{err.email}</p>}</div>
            </div>
            <div><label htmlFor="topic" className="label">Topic</label><select id="topic" className="field" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{["Fragrance advice", "Order support", "Gifting", "Press & partnerships"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label htmlFor="msg" className="label">Message</label><textarea id="msg" rows={6} className="field !py-3" value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} aria-invalid={!!err.msg} />{err.msg && <p className="mt-1.5 text-xs text-[#b3261e]">{err.msg}</p>}</div>
            <button className="btn">Send message</button>
          </form>
        )}
        <aside className="space-y-8">
          {[[MapPin, "Atelier", "14 Rue Jean Ossola, 06130 Grasse, France"], [Mail, "Email", "hello@aurelle.example"], [Phone, "Concierge", "+91 22 5555 0142 · Mon–Sat, 10–7"]].map(([I, t, d]) => {
            const Icon = I as typeof Mail;
            return <div key={t as string} className="flex gap-5"><Icon size={22} strokeWidth={1.3} className="mt-1 text-accent" /><div><p className="label !mb-1">{t as string}</p><p className="text-sm opacity-80">{d as string}</p></div></div>;
          })}
          <div className="rounded-[2px] border border-line p-7">
            <p className="display text-3xl">Shipping & returns</p>
            <p className="mt-3 text-sm leading-relaxed opacity-75">Free delivery over ₹10,000. Returns accepted within 14 days on unopened flacons. Gift wrapping is always complimentary.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
