"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/store";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  const { login, register } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const isLogin = mode === "login";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (!isLogin && f.name.trim().length < 2) v.name = "Please enter your name.";
    if (!/\S+@\S+\.\S+/.test(f.email)) v.email = "Enter a valid email address.";
    if (f.password.length < 6) v.password = "Use at least 6 characters.";
    if (Object.keys(v).length) return setErr(v);
    const res = isLogin ? login(f.email, f.password) : register(f.name.trim(), f.email, f.password);
    if (!res.ok) return setErr({ form: res.error });
    router.push(next);
  };

  return (
    <div className="grid min-h-[100svh] pt-20 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-cream lg:block">
        <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(201,164,92,0.28)_0%,transparent_65%)]" aria-hidden />
        <Image src="/images/stone-1.png" alt="Chanel N°5 in a carved stone niche" fill priority sizes="50vw" className="object-contain p-[9%] pb-[22%]" />
        
        <div className="pointer-events-none absolute inset-x-12 bottom-14">
          <p className="display text-5xl leading-tight">“A fragrance is an invisible signature.”</p>
          <p className="eyebrow mt-5 text-gold">Maison Aurelle</p>
        </div>
      </div>
      <div className="flex items-center px-5 pb-16 pt-12 sm:px-14">
        <form onSubmit={submit} noValidate className="mx-auto w-full max-w-md">
          <p className="eyebrow mb-4">{isLogin ? "Welcome back" : "Join the Maison"}</p>
          <h1 className="display text-6xl">{isLogin ? "Sign in" : "Create account"}</h1>
          <div className="mt-10 space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input id="name" className="field" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} />
                {err.name && <p className="mt-1.5 text-xs text-[#b3261e]">{err.name}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" className="field" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!err.email} />
              {err.email && <p className="mt-1.5 text-xs text-[#b3261e]">{err.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={show ? "text" : "password"} className="field pr-14" autoComplete={isLogin ? "current-password" : "new-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} aria-invalid={!!err.password} />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center opacity-70 hover:opacity-100">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {err.password && <p className="mt-1.5 text-xs text-[#b3261e]">{err.password}</p>}
            </div>
          </div>
          <p role="alert" className="mt-4 min-h-5 text-sm text-[#b3261e]">{err.form}</p>
          <button className="btn mt-4 w-full">{isLogin ? "Sign in" : "Create account"}</button>
          {isLogin && (
            <button type="button" className="btn btn-ghost mt-3 w-full" onClick={() => setF({ ...f, email: "demo@aurelle.com", password: "aurelle123" })}>Fill demo account</button>
          )}
          <p className="mt-8 text-center text-sm opacity-80">
            {isLogin ? "New to Aurelle? " : "Already a member? "}
            <Link href={isLogin ? "/register" : "/login"} className="u-link font-semibold">{isLogin ? "Create an account" : "Sign in"}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
