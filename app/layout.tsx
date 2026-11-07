import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
// Primary UI font: TT Lakes, as used by the reference site (commercial typeface —
// make sure you hold a licence before shipping to production).
const sans = localFont({
  src: [
    { path: "./fonts/ttlakes-medium.woff2", weight: "400 500", style: "normal" },
    { path: "./fonts/ttlakes-demibold.woff2", weight: "600 700", style: "normal" },
  ],
  variable: "--font-primary",
  display: "swap",
});
const condensed = localFont({
  src: [
    { path: "./fonts/ttlakes-condensed-medium.woff2", weight: "400 500", style: "normal" },
    { path: "./fonts/ttlakes-condensed-demibold.woff2", weight: "600 700", style: "normal" },
  ],
  variable: "--font-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Maison Aurelle — Parfum d’auteur", template: "%s · Maison Aurelle" },
  description: "Hand-blended fragrances, aged ninety days. Explore the Maison Aurelle collection in 3D.",
};
export const viewport: Viewport = { themeColor: "#f6f0e4", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${condensed.variable}`}>
      <body>
        <Providers>
          <Preloader />
          <Cursor />
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
