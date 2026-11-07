"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FREE_SHIPPING_THRESHOLD, getProduct, PROMO, SHIPPING_FEE } from "./products";
import type { Mood } from "./products";

/* ---------- Cart ---------- */
export interface CartItem {
  slug: string;
  ml: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  promo: string | null;
  add: (slug: string, ml: number, qty?: number) => void;
  remove: (slug: string, ml: number) => void;
  setQty: (slug: string, ml: number, qty: number) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promo: null,
      add: (slug, ml, qty = 1) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.slug === slug && x.ml === ml);
        if (i >= 0) items[i] = { ...items[i], qty: Math.min(10, items[i].qty + qty) };
        else items.push({ slug, ml, qty });
        set({ items });
      },
      remove: (slug, ml) => set({ items: get().items.filter((x) => !(x.slug === slug && x.ml === ml)) }),
      setQty: (slug, ml, qty) =>
        set({
          items: get()
            .items.map((x) => (x.slug === slug && x.ml === ml ? { ...x, qty: Math.max(0, Math.min(10, qty)) } : x))
            .filter((x) => x.qty > 0),
        }),
      applyPromo: (code) => {
        if (code.trim().toUpperCase() === PROMO.code) {
          set({ promo: PROMO.code });
          return true;
        }
        return false;
      },
      clearPromo: () => set({ promo: null }),
      clear: () => set({ items: [], promo: null }),
    }),
    { name: "aurelle-cart", skipHydration: true },
  ),
);

export function cartTotals(items: CartItem[], promo: string | null) {
  const subtotal = items.reduce((sum, it) => {
    const p = getProduct(it.slug);
    const size = p?.sizes.find((s) => s.ml === it.ml);
    return sum + (size?.price ?? 0) * it.qty;
  }, 0);
  const discount = promo ? Math.round((subtotal * PROMO.pct) / 100) : 0;
  const after = subtotal - discount;
  const shipping = items.length === 0 || after >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const count = items.reduce((n, it) => n + it.qty, 0);
  return { subtotal, discount, shipping, total: after + shipping, count, remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - after) };
}

/* ---------- Wishlist ---------- */
interface WishState {
  slugs: string[];
  toggle: (slug: string) => void;
}
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set({ slugs: get().slugs.includes(slug) ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] }),
    }),
    { name: "aurelle-wishlist", skipHydration: true },
  ),
);

/* ---------- Auth (static demo, stored in the browser only) ---------- */
export interface User {
  name: string;
  email: string;
}
export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  address: string;
}
interface Account extends User {
  password: string;
}
interface AuthState {
  user: User | null;
  accounts: Account[];
  orders: Order[];
  lastOrder: Order | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  register: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  placeOrder: (o: Omit<Order, "id" | "date" | "status">) => Order;
}

const DEMO: Account = { name: "Aria Sharma", email: "demo@aurelle.com", password: "aurelle123" };
const SEED_ORDERS: Order[] = [
  {
    id: "AUR-20418",
    date: "2026-09-14",
    items: [{ slug: "midnight-oud", ml: 50, qty: 1 }],
    total: 11800,
    status: "Delivered",
    address: "12 Marine Drive, Mumbai 400020",
  },
  {
    id: "AUR-20977",
    date: "2026-10-29",
    items: [
      { slug: "aurora-bloom", ml: 30, qty: 1 },
      { slug: "citrus-veil", ml: 50, qty: 1 },
    ],
    total: 11400,
    status: "Shipped",
    address: "12 Marine Drive, Mumbai 400020",
  },
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [DEMO],
      orders: [],
      lastOrder: null,
      login: (email, password) => {
        const acc = get().accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
        if (!acc) return { ok: false, error: "We couldn't find an account with that email." };
        if (acc.password !== password) return { ok: false, error: "That password doesn't look right." };
        set({
          user: { name: acc.name, email: acc.email },
          orders: acc.email === DEMO.email && get().orders.length === 0 ? SEED_ORDERS : get().orders,
        });
        return { ok: true };
      },
      register: (name, email, password) => {
        if (get().accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase()))
          return { ok: false, error: "An account with this email already exists." };
        set({
          accounts: [...get().accounts, { name, email: email.trim(), password }],
          user: { name, email: email.trim() },
          orders: [],
        });
        return { ok: true };
      },
      logout: () => set({ user: null }),
      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: `AUR-${Math.floor(21000 + Math.random() * 78000)}`,
          date: new Date().toISOString().slice(0, 10),
          status: "Processing",
        };
        set({ orders: [order, ...get().orders], lastOrder: order });
        return order;
      },
    }),
    { name: "aurelle-auth", skipHydration: true },
  ),
);

/* ---------- UI (not persisted) ---------- */
interface UIState {
  cartOpen: boolean;
  menuOpen: boolean;
  ready: boolean; // preloader finished
  mood: Mood | null;
  onDark: boolean; // a dark full-bleed hero is under the header
  setOnDark: (v: boolean) => void;
  setCartOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setReady: (v: boolean) => void;
  setMood: (m: Mood | null) => void;
}
export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  ready: false,
  mood: null,
  onDark: false,
  setOnDark: (onDark) => set({ onDark }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setReady: (ready) => set({ ready }),
  setMood: (mood) => set({ mood }),
}));
