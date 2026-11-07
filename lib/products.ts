export type Family = "Floral" | "Woody" | "Fresh" | "Oriental" | "Citrus";
export type Gender = "Women" | "Men" | "Unisex";

export interface BottleSpec {
  shape: "square" | "round" | "tall";
  glass: string; // glass tint
  liquid: string;
  cap: {
    shape: "cyl" | "oct" | "box";
    color: string;
    metal: number;
    rough: number;
    crystal?: boolean;
    size: [number, number, number]; // w, h, d (cyl: radius*2, h, -)
  };
  collar: string; // neck ring colour
  label: { line1: string; line2?: string; color: string; plate?: string };
}

export interface Mood {
  bg: string;
  fg: string;
  accent: string;
}

export interface Product {
  slug: string;
  brand?: string; // undefined = Maison Aurelle
  name: string;
  line2?: string;
  family: Family;
  gender: Gender;
  concentration: string;
  tagline: string;
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  sizes: { ml: number; price: number }[];
  images: string[];
  cutout?: string; // transparent studio cut-out, shown whole on a tinted ground
  mood: Mood;
  longevity: number; // 1-10
  sillage: number; // 1-10
  seasons: string[];
  occasion: string;
  rating: number;
  reviews: number;
  badge?: "New" | "Bestseller" | "Limited";
  bottle?: BottleSpec; // procedural 3D model (Maison Aurelle only)
}

import { houses } from "./houses";

const own: Product[] = [
  {
    slug: "midnight-oud",
    name: "Midnight Oud",
    family: "Oriental",
    gender: "Unisex",
    concentration: "Extrait de Parfum",
    tagline: "Smoke, resin and a gilded dark.",
    description:
      "A nocturnal incense of aged agarwood, smouldering over black leather and warm resins. Midnight Oud is poured at 28% concentration and rests for ninety days before it is bottled — a scent that arrives long after you have left the room.",
    notes: {
      top: ["Saffron", "Black Pepper", "Bergamot"],
      heart: ["Laotian Oud", "Rose Absolute", "Incense"],
      base: ["Black Leather", "Amber", "Patchouli"],
    },
    sizes: [
      { ml: 50, price: 11800 },
      { ml: 100, price: 17900 },
    ],
    images: ["/images/6.jpg", "/images/7.jpg", "/images/8.jpg"],
    mood: { bg: "#120d09", fg: "#f2e3c4", accent: "#d4a24c" },
    longevity: 10,
    sillage: 9,
    seasons: ["Autumn", "Winter"],
    occasion: "Evening",
    rating: 4.9,
    reviews: 412,
    badge: "Bestseller",
    bottle: {
      shape: "square",
      glass: "#1a1208",
      liquid: "#3a230c",
      cap: { shape: "cyl", color: "#d1a24a", metal: 1, rough: 0.28, size: [0.92, 0.55, 0] },
      collar: "#d1a24a",
      label: { line1: "MIDNIGHT", line2: "OUD", color: "#e8c77a", plate: "#0b0907" },
    },
  },
  {
    slug: "aurora-bloom",
    name: "Aurora Bloom",
    family: "Floral",
    gender: "Women",
    concentration: "Eau de Parfum",
    tagline: "Peonies at first light.",
    description:
      "Dew-soaked peony and Bulgarian rose unfold over a soft musk skin. Aurora Bloom is the sound of a garden opening — luminous, tender, and unmistakably feminine without ever being sweet.",
    notes: {
      top: ["Pink Pepper", "Lychee", "Mandarin"],
      heart: ["Peony", "Bulgarian Rose", "Freesia"],
      base: ["White Musk", "Cedarwood", "Sandalwood"],
    },
    sizes: [
      { ml: 30, price: 5200 },
      { ml: 50, price: 7600 },
      { ml: 100, price: 11400 },
    ],
    images: ["/images/3.jpg", "/images/4.jpg", "/images/5.jpg"],
    mood: { bg: "#f7d5d2", fg: "#2b1114", accent: "#b9455c" },
    longevity: 7,
    sillage: 7,
    seasons: ["Spring", "Summer"],
    occasion: "Daytime",
    rating: 4.8,
    reviews: 538,
    badge: "Bestseller",
    bottle: {
      shape: "round",
      glass: "#f6c6c0",
      liquid: "#f4a9a4",
      cap: { shape: "oct", color: "#e2b873", metal: 1, rough: 0.12, crystal: false, size: [0.9, 0.5, 0] },
      collar: "#e2b873",
      label: { line1: "AURORA", line2: "BLOOM", color: "#8c5a2b" },
    },
  },
  {
    slug: "azure-homme",
    name: "Azure Homme",
    family: "Fresh",
    gender: "Men",
    concentration: "Eau de Parfum",
    tagline: "The sea at the edge of night.",
    description:
      "Cold sea spray, Calabrian bergamot and mineral cedar. Azure Homme is a deep-water fresh — clean, confident and quietly magnetic, with an ambergris trail that stays long after the tide goes out.",
    notes: {
      top: ["Sea Salt", "Bergamot", "Grapefruit"],
      heart: ["Marine Accord", "Geranium", "Sage"],
      base: ["Ambergris", "Cedar", "Vetiver"],
    },
    sizes: [
      { ml: 50, price: 7400 },
      { ml: 100, price: 10900 },
    ],
    images: ["/images/1.jpg", "/images/2.jpg", "/images/21.jpg"],
    mood: { bg: "#0d2a3c", fg: "#e8f3f8", accent: "#5cc1e8" },
    longevity: 7,
    sillage: 6,
    seasons: ["Spring", "Summer"],
    occasion: "Everyday",
    rating: 4.7,
    reviews: 391,
    badge: "New",
    bottle: {
      shape: "square",
      glass: "#2e86ab",
      liquid: "#0f5d82",
      cap: { shape: "cyl", color: "#1b1b1d", metal: 0.4, rough: 0.5, size: [0.95, 0.5, 0] },
      collar: "#0e0e10",
      label: { line1: "AZURE", line2: "HOMME", color: "#e6f4fb" },
    },
  },
  {
    slug: "citrus-veil",
    name: "Citrus Veil",
    family: "Citrus",
    gender: "Unisex",
    concentration: "Eau de Toilette",
    tagline: "Sunlight through a lemon grove.",
    description:
      "Amalfi lemon, neroli and white blossom lifted by a silver-bright musk. Citrus Veil is weightless and radiant — the freshest hour of a Mediterranean morning, bottled.",
    notes: {
      top: ["Amalfi Lemon", "Yuzu", "Petitgrain"],
      heart: ["Neroli", "Orange Blossom", "Jasmine"],
      base: ["White Musk", "Moss", "Cedar"],
    },
    sizes: [
      { ml: 50, price: 6200 },
      { ml: 100, price: 9200 },
    ],
    images: ["/images/9.jpg", "/images/10.jpg", "/images/11.jpg"],
    mood: { bg: "#f7e9a3", fg: "#2a2308", accent: "#a67c00" },
    longevity: 5,
    sillage: 5,
    seasons: ["Spring", "Summer"],
    occasion: "Daytime",
    rating: 4.6,
    reviews: 276,
    bottle: {
      shape: "square",
      glass: "#fff3a8",
      liquid: "#f1d44a",
      cap: { shape: "cyl", color: "#d9dde2", metal: 1, rough: 0.12, size: [0.88, 0.62, 0] },
      collar: "#c8ccd2",
      label: { line1: "CITRUS VEIL", color: "#9a7512", plate: "#f8f4ea" },
    },
  },
  {
    slug: "velvet-amber",
    name: "Velvet Amber",
    family: "Oriental",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    tagline: "Honeyed resin, warm as skin.",
    description:
      "Golden amber, Madagascan vanilla pods and tonka melt into a soft, enveloping glow. Velvet Amber is the scent of a cashmere evening — dense, comforting, and impossible to forget.",
    notes: {
      top: ["Cardamom", "Orange Zest", "Pink Pepper"],
      heart: ["Labdanum", "Benzoin", "Iris"],
      base: ["Vanilla Pod", "Tonka Bean", "Amber"],
    },
    sizes: [
      { ml: 50, price: 8400 },
      { ml: 100, price: 12600 },
    ],
    images: ["/images/12.jpg"],
    mood: { bg: "#e2b25a", fg: "#24150a", accent: "#7a3f0b" },
    longevity: 9,
    sillage: 8,
    seasons: ["Autumn", "Winter"],
    occasion: "Evening",
    rating: 4.9,
    reviews: 344,
    badge: "Limited",
    bottle: {
      shape: "round",
      glass: "#e8a53a",
      liquid: "#c77a14",
      cap: { shape: "cyl", color: "#b48b46", metal: 0.9, rough: 0.4, size: [1.0, 0.55, 0] },
      collar: "#b48b46",
      label: { line1: "VELVET", line2: "AMBER", color: "#e8d3a2", plate: "#8d6f3a" },
    },
  },
  {
    slug: "eleva-bloom",
    name: "Éléva Bloom",
    family: "Floral",
    gender: "Women",
    concentration: "Eau de Parfum",
    tagline: "A rose that learned to rise.",
    description:
      "Damask rose and raspberry blossom wrapped in cashmere musk, set in a faceted crystal flacon. Éléva Bloom is romantic, modern and effortlessly elevated.",
    notes: {
      top: ["Raspberry", "Bergamot", "Pear"],
      heart: ["Damask Rose", "Magnolia", "Peony"],
      base: ["Cashmere Musk", "Praline", "Blonde Woods"],
    },
    sizes: [
      { ml: 30, price: 5400 },
      { ml: 50, price: 7900 },
      { ml: 100, price: 11900 },
    ],
    images: ["/images/13.jpg", "/images/14.jpg", "/images/15.jpg"],
    mood: { bg: "#f9d9df", fg: "#2d1018", accent: "#c23b62" },
    longevity: 7,
    sillage: 7,
    seasons: ["Spring", "Autumn"],
    occasion: "Date night",
    rating: 4.8,
    reviews: 301,
    badge: "New",
    bottle: {
      shape: "square",
      glass: "#f4b5c0",
      liquid: "#ef9aae",
      cap: { shape: "oct", color: "#fbe9ee", metal: 0, rough: 0.05, crystal: true, size: [1.0, 0.6, 0] },
      collar: "#d8a85a",
      label: { line1: "ÉLÉVA", line2: "BLOOM", color: "#3a1a22" },
    },
  },
  {
    slug: "santal-reserve",
    name: "Santal Réserve",
    family: "Woody",
    gender: "Men",
    concentration: "Eau de Parfum",
    tagline: "Creamy sandalwood, slow-aged.",
    description:
      "Mysore-style sandalwood, tonka and smoked cedar under a hand-turned walnut cap. Santal Réserve is warm, creamy and grounded — a modern classic for those who prefer to be remembered quietly.",
    notes: {
      top: ["Cardamom", "Bergamot", "Nutmeg"],
      heart: ["Sandalwood", "Cedarwood", "Iris"],
      base: ["Tonka Bean", "Vanilla", "Smoked Vetiver"],
    },
    sizes: [
      { ml: 50, price: 8200 },
      { ml: 100, price: 12400 },
    ],
    images: ["/images/17.jpg", "/images/16.jpg"],
    mood: { bg: "#5a3921", fg: "#f6e8d2", accent: "#e8aa5e" },
    longevity: 8,
    sillage: 6,
    seasons: ["Autumn", "Winter"],
    occasion: "Work & evening",
    rating: 4.8,
    reviews: 258,
    bottle: {
      shape: "square",
      glass: "#e49a3a",
      liquid: "#b9651a",
      cap: { shape: "box", color: "#3b2113", metal: 0.1, rough: 0.55, size: [1.05, 0.5, 0.62] },
      collar: "#d9aa55",
      label: { line1: "SANTAL", line2: "RÉSERVE", color: "#fbe9c6" },
    },
  },
  {
    slug: "velor-noir",
    name: "Vélor Noir",
    family: "Woody",
    gender: "Men",
    concentration: "Eau de Parfum",
    tagline: "Black suede after dark.",
    description:
      "Suede, blackcurrant and smoked guaiac wood over a dark amber fade. Vélor Noir is sharp-tailored and sensual, finished in a gradient flacon that deepens from clear to ink.",
    notes: {
      top: ["Blackcurrant", "Pink Pepper", "Lemon"],
      heart: ["Suede", "Guaiac Wood", "Violet Leaf"],
      base: ["Dark Amber", "Oakmoss", "Musk"],
    },
    sizes: [
      { ml: 50, price: 8800 },
      { ml: 100, price: 13200 },
    ],
    images: ["/images/18.jpg", "/images/19.jpg", "/images/20.jpg"],
    mood: { bg: "#16120f", fg: "#efe2c8", accent: "#c9a15a" },
    longevity: 8,
    sillage: 8,
    seasons: ["Autumn", "Winter"],
    occasion: "Evening",
    rating: 4.7,
    reviews: 223,
    bottle: {
      shape: "square",
      glass: "#2a2118",
      liquid: "#6b4a1d",
      cap: { shape: "box", color: "#14110f", metal: 0.1, rough: 0.85, size: [1.0, 0.42, 0.62] },
      collar: "#c9a15a",
      label: { line1: "VÉLOR", line2: "NOIR", color: "#e8cf9a" },
    },
  },
  {
    slug: "red-diamond",
    name: "Red Diamond",
    family: "Oriental",
    gender: "Men",
    concentration: "Eau de Toilette",
    tagline: "Cut from pure intensity.",
    description:
      "Red apple, cinnamon bark and black amber with a spiced woody drydown. Red Diamond is bold, polished and deliberately loud — the scent of walking into the room first.",
    notes: {
      top: ["Red Apple", "Cinnamon", "Mandarin"],
      heart: ["Clove", "Geranium", "Nutmeg"],
      base: ["Black Amber", "Cedar", "Patchouli"],
    },
    sizes: [
      { ml: 50, price: 6800 },
      { ml: 100, price: 9800 },
    ],
    images: ["/images/22.jpg"],
    mood: { bg: "#3b1014", fg: "#f8e5e2", accent: "#ef5a4c" },
    longevity: 6,
    sillage: 7,
    seasons: ["Autumn", "Winter"],
    occasion: "Night out",
    rating: 4.5,
    reviews: 187,
    bottle: {
      shape: "square",
      glass: "#b01d28",
      liquid: "#9c1220",
      cap: { shape: "box", color: "#f0f3f6", metal: 0, rough: 0.04, crystal: true, size: [0.95, 0.5, 0.6] },
      collar: "#c0c4c9",
      label: { line1: "RED DIAMOND", color: "#ffffff" },
    },
  },
];

const CUTOUTS: Record<string, string> = {
  "chanel-no5": "/images/stone-1.png",
  "coco-mademoiselle": "/images/stone-2.png",
  "nectarine-blossom-honey": "/images/stone-3.png",
  "red-diamond": "/images/stone-4.png",
  "versace-eros": "/images/stone-5.png",
  "ysl-libre": "/images/stone-6.png",
};
const EXTRA: Record<string, string[]> = { "ysl-libre": ["/images/stone-7.png"] };

export const products: Product[] = [...own, ...houses].map((p) =>
  CUTOUTS[p.slug] ? { ...p, cutout: CUTOUTS[p.slug], images: [CUTOUTS[p.slug], ...(EXTRA[p.slug] ?? []), ...p.images] } : p,
);

export const brandOf = (p: Product) => p.brand ?? "Maison Aurelle";

export const families: { name: Family; blurb: string; slugs: string[] }[] = [
  { name: "Floral", blurb: "Petals, dew and soft musk.", slugs: ["aurora-bloom", "eleva-bloom", "ysl-libre", "la-vie-est-belle", "chanel-no5", "miss-dior"] },
  { name: "Woody", blurb: "Sandalwood, suede and cedar.", slugs: ["santal-reserve", "velor-noir", "ysl-myslf", "rose-cedar-10"] },
  { name: "Fresh", blurb: "Sea air and mineral light.", slugs: ["azure-homme", "acqua-di-gio", "versace-eros", "allure-homme-sport"] },
  { name: "Oriental", blurb: "Oud, amber and spice.", slugs: ["midnight-oud", "velvet-amber", "red-diamond", "coco-noir", "si-intense", "voce-viva"] },
  { name: "Citrus", blurb: "Sun-bright and weightless.", slugs: ["citrus-veil", "sun-di-gioia", "oyedo"] },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const startingPrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price));

export const PROMO = { code: "AURELLE10", pct: 10 };
export const FREE_SHIPPING_THRESHOLD = 10000;
export const SHIPPING_FEE = 350;
