"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHero from "@/components/PageHero";
import OrderSummary from "@/components/OrderSummary";
import { cartTotals, useAuth, useCart } from "@/lib/store";

type Errors = Record<string, string>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, promo, clear } = useCart();
  const user = useAuth((s) => s.user);
  const placeOrder = useAuth((s) => s.placeOrder);
  const [pay, setPay] = useState<"card" | "upi" | "cod">("card");
  const [f, setF] = useState({ email: "", name: "", phone: "", address: "", city: "", pin: "", card: "", exp: "", cvv: "", upi: "" });
  const [err, setErr] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const t = cartTotals(items, promo);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setF((x) => ({ ...x, email: x.email || user.email, name: x.name || user.name }));
  }, [user]);

  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const e: Errors = {};
    if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Enter a valid email address.";
    if (f.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\d{10}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "Enter a 10-digit mobile number.";
    if (f.address.trim().length < 6) e.address = "Enter your delivery address.";
    if (f.city.trim().length < 2) e.city = "Enter your city.";
    if (!/^\d{6}$/.test(f.pin)) e.pin = "Enter a 6-digit PIN code.";
    if (pay === "card") {
      if (f.card.replace(/\s/g, "").length < 12) e.card = "Enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(f.exp)) e.exp = "Use MM/YY.";
      if (!/^\d{3,4}$/.test(f.cvv)) e.cvv = "3–4 digits.";
    }
    if (pay === "upi" && !/^[\w.-]+@[\w]+$/.test(f.upi)) e.upi = "Enter a valid UPI ID.";
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErr(v);
    if (Object.keys(v).length) {
      document.getElementById(Object.keys(v)[0])?.focus();
      return;
    }
    setBusy(true);
    setTimeout(() => {
      placeOrder({ items, total: t.total, address: `${f.address}, ${f.city} ${f.pin}` });
      clear();
      router.push("/order-confirmation");
    }, 1400);
  };

  const field = (id: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className="field" value={f[id]} onChange={up(id)} aria-invalid={!!err[id]} aria-describedby={err[id] ? id + "-e" : undefined} {...props} />
      {err[id] && <p id={id + "-e"} className="mt-1.5 text-xs text-[#b3261e]">{err[id]}</p>}
    </div>
  );

  if (items.length === 0 && !busy)
    return (
      <>
        <PageHero eyebrow="Checkout" title="Nothing to check out" />
        <div className="px-5 pb-32 text-center"><Link href="/shop" className="btn">Browse fragrances</Link></div>
      </>
    );

  return (
    <>
      <PageHero eyebrow="Secure checkout" title="Almost yours" />
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-12 sm:px-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-12">
          {!user && <p className="rounded-[2px] border border-line p-4 text-sm">Have an account? <Link href="/login?next=/checkout" className="u-link font-semibold">Sign in</Link> for faster checkout.</p>}
          <fieldset className="space-y-5">
            <legend className="display mb-5 text-3xl">Contact</legend>
            {field("email", "Email", { type: "email", autoComplete: "email" })}
            <div className="grid gap-5 sm:grid-cols-2">
              {field("name", "Full name", { autoComplete: "name" })}
              {field("phone", "Mobile", { type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "10 digits" })}
            </div>
          </fieldset>
          <fieldset className="space-y-5">
            <legend className="display mb-5 text-3xl">Delivery</legend>
            {field("address", "Address", { autoComplete: "street-address" })}
            <div className="grid gap-5 sm:grid-cols-2">
              {field("city", "City", { autoComplete: "address-level2" })}
              {field("pin", "PIN code", { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="display mb-2 text-3xl">Payment</legend>
            <p className="mb-5 text-xs opacity-65">Demonstration store — no payment is taken and nothing is stored on a server.</p>
            <div className="mb-6 flex flex-wrap gap-3">
              {([["card", "Card"], ["upi", "UPI"], ["cod", "Cash on delivery"]] as const).map(([v, l]) => (
                <label key={v} className={`eyebrow flex min-h-12 cursor-pointer items-center rounded-none border px-6 text-[0.62rem] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)] ${pay === v ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}>
                  <input type="radio" name="pay" className="sr-only" checked={pay === v} onChange={() => setPay(v)} />{l}
                </label>
              ))}
            </div>
            {pay === "card" && (
              <div className="space-y-5">
                {field("card", "Card number", { inputMode: "numeric", autoComplete: "cc-number", placeholder: "4242 4242 4242 4242" })}
                <div className="grid grid-cols-2 gap-5">
                  {field("exp", "Expiry", { placeholder: "MM/YY", autoComplete: "cc-exp" })}
                  {field("cvv", "CVV", { inputMode: "numeric", maxLength: 4, autoComplete: "cc-csc" })}
                </div>
              </div>
            )}
            {pay === "upi" && field("upi", "UPI ID", { placeholder: "name@bank" })}
            {pay === "cod" && <p className="text-sm opacity-75">Pay when your order arrives. A ₹0 handling fee applies.</p>}
          </fieldset>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <OrderSummary />
          <button className="btn w-full" disabled={busy}>{busy ? "Placing your order…" : `Place order · ₹${t.total.toLocaleString("en-IN")}`}</button>
          <Link href="/cart" className="u-link block text-center text-xs">Return to bag</Link>
        </aside>
      </form>
    </>
  );
}
