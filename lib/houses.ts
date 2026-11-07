import type { Family, Gender, Mood, Product } from "./products";

type Seed = {
  slug: string;
  brand: string;
  name: string;
  family: Family;
  gender: Gender;
  concentration: string;
  tagline: string;
  notes: [string[], string[], string[]];
  prices: [number, number];
  images: number[];
  mood: Mood;
  ratings: [number, number]; // rating, reviews
  scores: [number, number]; // longevity, sillage
  seasons: string[];
  occasion: string;
  badge?: Product["badge"];
};

const make = (s: Seed): Product => ({
  slug: s.slug,
  brand: s.brand,
  name: s.name,
  family: s.family,
  gender: s.gender,
  concentration: s.concentration,
  tagline: s.tagline,
  description: `${s.tagline} ${s.brand} ${s.name} opens on ${s.notes[0].slice(0, 2).join(" and ").toLowerCase()}, flowers into ${s.notes[1][0].toLowerCase()} and settles on a ${s.notes[2][0].toLowerCase()} base — a ${s.family.toLowerCase()} signature authenticated and shipped by Maison Aurelle.`,
  notes: { top: s.notes[0], heart: s.notes[1], base: s.notes[2] },
  sizes: [
    { ml: 50, price: s.prices[0] },
    { ml: 100, price: s.prices[1] },
  ],
  images: s.images.map((n) => `/images/${n}.jpg`),
  mood: s.mood,
  longevity: s.scores[0],
  sillage: s.scores[1],
  seasons: s.seasons,
  occasion: s.occasion,
  rating: s.ratings[0],
  reviews: s.ratings[1],
  badge: s.badge,
});

export const houses: Product[] = [
  make({ slug: "chanel-no5", brand: "Chanel", name: "N°5", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "The icon that defined a century.", notes: [["Aldehydes", "Neroli", "Ylang-Ylang"], ["Jasmine", "Rose", "Iris"], ["Vanilla", "Sandalwood", "Vetiver"]], prices: [11800, 15900], images: [30, 38], mood: { bg: "#cfe0f1", fg: "#0e1b2b", accent: "#b8702f" }, ratings: [4.9, 1204], scores: [8, 7], seasons: ["All year"], occasion: "Signature", badge: "Bestseller" }),
  make({ slug: "ysl-libre", brand: "Yves Saint Laurent", name: "Libre", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "The freedom to live as you choose.", notes: [["Lavender", "Mandarin", "Black Currant"], ["Orange Blossom", "Jasmine"], ["Vanilla", "Musk", "Ambergris"]], prices: [9800, 13600], images: [45, 46, 47], mood: { bg: "#223a2f", fg: "#f2ead2", accent: "#d8b560" }, ratings: [4.8, 986], scores: [8, 8], seasons: ["Autumn", "Spring"], occasion: "Evening", badge: "Bestseller" }),
  make({ slug: "la-vie-est-belle", brand: "Lancôme", name: "La Vie Est Belle", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "Happiness, bottled in a ribbon.", notes: [["Black Currant", "Pear"], ["Iris", "Jasmine", "Orange Blossom"], ["Praline", "Vanilla", "Patchouli"]], prices: [9200, 12900], images: [29], mood: { bg: "#f4d9d3", fg: "#2b1520", accent: "#c2566b" }, ratings: [4.8, 1432], scores: [8, 8], seasons: ["All year"], occasion: "Daytime" }),
  make({ slug: "miss-dior", brand: "Dior", name: "Miss Dior", family: "Floral", gender: "Women", concentration: "Eau de Toilette", tagline: "A couture bow, a garden of roses.", notes: [["Mandarin", "Peony"], ["Rose", "Lily of the Valley"], ["Musk", "Patchouli"]], prices: [8800, 12200], images: [36], mood: { bg: "#f1dcd0", fg: "#3a2218", accent: "#b9785a" }, ratings: [4.7, 702], scores: [6, 6], seasons: ["Spring"], occasion: "Daytime" }),
  make({ slug: "ysl-mon-paris", brand: "Yves Saint Laurent", name: "Mon Paris", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "A love story, in a ribbon of black.", notes: [["Strawberry", "Raspberry", "Pear"], ["Datura", "Peony"], ["Patchouli", "White Musk"]], prices: [9400, 13200], images: [49, 50], mood: { bg: "#2a2a30", fg: "#f3e8ea", accent: "#e59ab0" }, ratings: [4.7, 611], scores: [7, 7], seasons: ["Spring", "Autumn"], occasion: "Date night", badge: "New" }),
  make({ slug: "sun-di-gioia", brand: "Giorgio Armani", name: "Sun di Gioia", family: "Citrus", gender: "Women", concentration: "Eau de Parfum", tagline: "A sun-warmed floral, pure joy.", notes: [["Bergamot", "Mandarin"], ["Jasmine", "Orange Blossom"], ["Amber", "Sandalwood"]], prices: [9600, 13400], images: [37], mood: { bg: "#f1ddc8", fg: "#3a2512", accent: "#c8862a" }, ratings: [4.6, 288], scores: [6, 6], seasons: ["Summer"], occasion: "Holiday" }),
  make({ slug: "si", brand: "Giorgio Armani", name: "Sì", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "A bold yes to life.", notes: [["Black Currant", "Mandarin"], ["Rose", "Freesia"], ["Vanilla", "Woods", "Amber"]], prices: [9900, 13800], images: [32], mood: { bg: "#0c1722", fg: "#f0dfd0", accent: "#d89b78" }, ratings: [4.8, 894], scores: [8, 7], seasons: ["Autumn", "Winter"], occasion: "Evening" }),
  make({ slug: "si-intense", brand: "Giorgio Armani", name: "Sì Intense", family: "Oriental", gender: "Women", concentration: "Eau de Parfum Intense", tagline: "Gold-flecked, velvet dark.", notes: [["Black Currant", "Bergamot"], ["Rose", "Jasmine"], ["Vanilla", "Patchouli", "Amber"]], prices: [11200, 15200], images: [42], mood: { bg: "#14110d", fg: "#f1dfb0", accent: "#d4a24c" }, ratings: [4.8, 466], scores: [9, 8], seasons: ["Winter"], occasion: "Evening", badge: "Limited" }),
  make({ slug: "coco-mademoiselle", brand: "Chanel", name: "Coco Mademoiselle", family: "Oriental", gender: "Women", concentration: "Eau de Parfum", tagline: "Fresh, sensual, unapologetic.", notes: [["Orange", "Bergamot"], ["Rose", "Jasmine"], ["Patchouli", "Vanilla", "Vetiver"]], prices: [12400, 16800], images: [41], mood: { bg: "#0f0d0e", fg: "#f5dfd8", accent: "#e39a8c" }, ratings: [4.9, 1105], scores: [8, 8], seasons: ["All year"], occasion: "Evening", badge: "Bestseller" }),
  make({ slug: "coco-noir", brand: "Chanel", name: "Coco Noir", family: "Oriental", gender: "Women", concentration: "Eau de Parfum", tagline: "Night in a black flacon.", notes: [["Grapefruit", "Bergamot"], ["Rose", "Jasmine"], ["Patchouli", "Sandalwood", "Tonka"]], prices: [12600, 17200], images: [40], mood: { bg: "#c8473d", fg: "#fff3ef", accent: "#ffd2a0" }, ratings: [4.7, 354], scores: [9, 8], seasons: ["Winter"], occasion: "Night out" }),
  make({ slug: "voce-viva", brand: "Valentino", name: "Voce Viva", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "Studded, sunlit, spoken out loud.", notes: [["Bergamot", "Mandarin"], ["Gardenia", "Orange Blossom"], ["Vanilla", "Bourbon"]], prices: [9400, 13200], images: [34, 35, 44], mood: { bg: "#0e3a3f", fg: "#ffe9d2", accent: "#ef6a3a" }, ratings: [4.7, 428], scores: [8, 7], seasons: ["Autumn", "Spring"], occasion: "Night out", badge: "New" }),
  make({ slug: "magie-noire", brand: "Lancôme", name: "Magie Noire", family: "Oriental", gender: "Women", concentration: "Eau de Toilette", tagline: "A vintage spell in amber.", notes: [["Bergamot", "Peach"], ["Gardenia", "Rose"], ["Oakmoss", "Sandalwood", "Amber"]], prices: [7600, 10400], images: [55], mood: { bg: "#2a1608", fg: "#f6dcb0", accent: "#e8963a" }, ratings: [4.5, 132], scores: [7, 6], seasons: ["Autumn"], occasion: "Evening" }),
  make({ slug: "miu-miu-eau-de-parfum", brand: "Miu Miu", name: "Eau de Parfum", family: "Floral", gender: "Women", concentration: "Eau de Parfum", tagline: "Faceted crystal, playful floral.", notes: [["Mandarin", "Pink Pepper"], ["Rose", "Iris"], ["Cedar", "Musk"]], prices: [9000, 12600], images: [56], mood: { bg: "#3a3850", fg: "#f6ece8", accent: "#7fd0cf" }, ratings: [4.6, 177], scores: [7, 6], seasons: ["Spring"], occasion: "Daytime" }),
  make({ slug: "nectarine-blossom-honey", brand: "Jo Malone London", name: "Nectarine Blossom & Honey", family: "Floral", gender: "Unisex", concentration: "Cologne", tagline: "A summer orchard, honey-lit.", notes: [["Nectarine", "Peach"], ["Jasmine", "Peach Blossom"], ["Honey", "Musk"]], prices: [7800, 11400], images: [26], mood: { bg: "#151412", fg: "#efe7d8", accent: "#c9a96a" }, ratings: [4.6, 521], scores: [5, 5], seasons: ["Summer"], occasion: "Daytime" }),
  make({ slug: "oyedo", brand: "Diptyque", name: "Oyédo", family: "Citrus", gender: "Unisex", concentration: "Eau de Toilette", tagline: "A Japanese citrus grove at dusk.", notes: [["Yuzu", "Lemon"], ["Cypress", "Juniper"], ["Cedar", "Musk"]], prices: [10400, 14400], images: [51], mood: { bg: "#1a1210", fg: "#f1dccb", accent: "#e0905a" }, ratings: [4.6, 209], scores: [6, 5], seasons: ["Spring", "Summer"], occasion: "Everyday" }),
  make({ slug: "rose-cedar-10", brand: "Morra", name: "Rose-Cedar 10", family: "Woody", gender: "Unisex", concentration: "Eau de Parfum", tagline: "A quiet rose over dry cedar.", notes: [["Pink Pepper", "Bergamot"], ["Rose", "Geranium"], ["Cedarwood", "Musk"]], prices: [6200, 8800], images: [52], mood: { bg: "#c9a77f", fg: "#2a1b0e", accent: "#7a4b1f" }, ratings: [4.5, 96], scores: [6, 5], seasons: ["Autumn"], occasion: "Everyday", badge: "New" }),
  make({ slug: "acqua-di-gio", brand: "Giorgio Armani", name: "Acqua di Giò", family: "Fresh", gender: "Men", concentration: "Eau de Toilette", tagline: "The Mediterranean, wearable.", notes: [["Bergamot", "Neroli", "Green Tangerine"], ["Sea Notes", "Jasmine", "Rosemary"], ["Cedar", "Musk", "Patchouli"]], prices: [8200, 11400], images: [33], mood: { bg: "#c9d8ea", fg: "#0f1e33", accent: "#3f6fa3" }, ratings: [4.8, 1560], scores: [6, 6], seasons: ["Summer"], occasion: "Everyday", badge: "Bestseller" }),
  make({ slug: "versace-eros", brand: "Versace", name: "Eros", family: "Fresh", gender: "Men", concentration: "Eau de Toilette", tagline: "Mint, apple and a Medusa's gaze.", notes: [["Mint", "Green Apple", "Lemon"], ["Tonka Bean", "Geranium"], ["Vanilla", "Cedar", "Oakmoss"]], prices: [7800, 10600], images: [39], mood: { bg: "#0e3b44", fg: "#e8f3f1", accent: "#2fb6b0" }, ratings: [4.7, 1318], scores: [8, 8], seasons: ["Spring", "Summer"], occasion: "Night out" }),
  make({ slug: "allure-homme-sport", brand: "Chanel", name: "Allure Homme Sport", family: "Fresh", gender: "Men", concentration: "Eau de Toilette", tagline: "Clean, athletic, effortlessly sharp.", notes: [["Orange", "Aldehydes", "Sea Notes"], ["Pepper", "Neroli"], ["Tonka", "Musk", "Vetiver"]], prices: [9800, 13400], images: [53], mood: { bg: "#2f3a38", fg: "#e8efec", accent: "#9ab3ad" }, ratings: [4.7, 640], scores: [6, 6], seasons: ["Spring", "Summer"], occasion: "Work" }),
  make({ slug: "stronger-with-you-intensely", brand: "Emporio Armani", name: "Stronger With You Intensely", family: "Oriental", gender: "Men", concentration: "Eau de Parfum", tagline: "Warm chestnut, spice and vanilla.", notes: [["Pink Pepper", "Juniper", "Violet Leaf"], ["Lavender", "Sage"], ["Vanilla", "Toasted Chestnut", "Amber"]], prices: [8400, 11800], images: [31], mood: { bg: "#2b3a40", fg: "#f1e6d8", accent: "#e08a3a" }, ratings: [4.8, 733], scores: [8, 7], seasons: ["Autumn", "Winter"], occasion: "Evening" }),
  make({ slug: "ysl-myslf", brand: "Yves Saint Laurent", name: "MYSLF", family: "Woody", gender: "Men", concentration: "Le Parfum", tagline: "Orange blossom, modern masculinity.", notes: [["Bergamot", "Calabrian Bergamot"], ["Orange Blossom"], ["Ambrofix", "Woody Notes", "Patchouli"]], prices: [10400, 14200], images: [43], mood: { bg: "#141414", fg: "#eeeeee", accent: "#bdbdbd" }, ratings: [4.7, 384], scores: [8, 8], seasons: ["All year"], occasion: "Work & evening", badge: "New" }),
];
