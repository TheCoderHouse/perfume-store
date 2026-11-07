# Maison Aurelle — premium perfume store

A static-data, 3D-enabled e-commerce storefront built with **Next.js 16 (App Router)**, React 19, Tailwind CSS v4, React Three Fiber, GSAP + Lenis and Framer Motion.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Pages

`/` home · `/shop` (filters + sort) · `/product/[slug]` (3D viewer, gallery, notes, reviews) · `/cart` · `/checkout` · `/order-confirmation` · `/login` · `/register` · `/account` · `/wishlist` · `/about` · `/contact` · 404

## Notes

- All data lives in `lib/products.ts` (static). Cart, wishlist and the demo auth/orders are persisted in `localStorage` via Zustand.
- Demo login: `demo@aurelle.com` / `aurelle123`. Promo code: `AURELLE10`.
- The 3D bottles are procedural (react-three-fiber) and driven by the `bottle` spec of each product.
