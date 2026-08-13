import rings from "@/assets/cat-rings.jpg";
import chains from "@/assets/cat-chains.jpg";
import earrings from "@/assets/cat-earrings.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import pendants from "@/assets/cat-pendants.jpg";
import idols from "@/assets/cat-idols.jpg";

import pRing1 from "@/assets/p-rings-1.jpg";
import pRing2 from "@/assets/p-rings-2.jpg";
import pRing3 from "@/assets/p-rings-3.jpg";
import pRing4 from "@/assets/p-rings-4.jpg";
import pRing5 from "@/assets/p-rings-5.jpg";
import pRing6 from "@/assets/p-rings-6.jpg";
import pChain1 from "@/assets/p-chains-1.jpg";
import pChain2 from "@/assets/p-chains-2.jpg";
import pChain3 from "@/assets/p-chains-3.jpg";
import pChain4 from "@/assets/p-chains-4.jpg";
import pChain5 from "@/assets/p-chains-5.jpg";
import pChain6 from "@/assets/p-chains-6.jpg";
import pBrac1 from "@/assets/p-bracelets-1.jpg";
import pBrac2 from "@/assets/p-bracelets-2.jpg";
import pBrac3 from "@/assets/p-bracelets-3.jpg";
import pBrac4 from "@/assets/p-bracelets-4.jpg";
import pBrac5 from "@/assets/p-bracelets-5.jpg";
import pBrac6 from "@/assets/p-bracelets-6.jpg";
import pEar1 from "@/assets/p-earrings-1.jpg";
import pEar2 from "@/assets/p-earrings-2.jpg";
import pEar3 from "@/assets/p-earrings-3.jpg";
import pEar4 from "@/assets/p-earrings-4.jpg";
import pEar5 from "@/assets/p-earrings-5.jpg";
import pEar6 from "@/assets/p-earrings-6.jpg";
import pPen1 from "@/assets/p-pendants-1.jpg";
import pPen2 from "@/assets/p-pendants-2.jpg";
import pPen3 from "@/assets/p-pendants-3.jpg";
import pPen4 from "@/assets/p-pendants-4.jpg";
import pPen5 from "@/assets/p-pendants-5.jpg";
import pPen6 from "@/assets/p-pendants-6.jpg";
import pKada1 from "@/assets/p-kada-1.jpg";
import pKada2 from "@/assets/p-kada-2.jpg";
import pKada3 from "@/assets/p-kada-3.jpg";
import pKada4 from "@/assets/p-kada-4.jpg";
import pKada5 from "@/assets/p-kada-5.jpg";
import pPayal1 from "@/assets/p-payal-1.jpg";
import pPayal2 from "@/assets/p-payal-2.jpg";
import pPayal3 from "@/assets/p-payal-3.jpg";
import pPayal4 from "@/assets/p-payal-4.jpg";
import pPayal5 from "@/assets/p-payal-5.jpg";

export const categoryImages = { rings, chains, earrings, bracelets, pendants, idols };

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "rings", name: "Silver Rings", tagline: "Hand-finished bands", image: rings },
  { slug: "chains", name: "Silver Chains", tagline: "Everyday heirlooms", image: chains },
  { slug: "bracelets", name: "Bracelets", tagline: "Sculpted for the wrist", image: bracelets },
  { slug: "kada", name: "Kada", tagline: "Solid silver strength", image: pKada1 },
  { slug: "payal", name: "Payal", tagline: "Anklets that sing", image: pPayal1 },
  { slug: "anklets", name: "Anklets", tagline: "Quiet movement", image: bracelets },
  { slug: "pendants", name: "Pendants", tagline: "Signature motifs", image: pendants },
  { slug: "earrings", name: "Earrings", tagline: "Light and luminous", image: earrings },
  { slug: "idols", name: "Silver Idols", tagline: "Devotion in 92.5", image: idols },
  { slug: "gifting", name: "Gift Collection", tagline: "Wrapped by hand", image: pendants },
  { slug: "temple", name: "Temple Collection", tagline: "Heritage forms", image: idols },
  { slug: "wedding", name: "Wedding Collection", tagline: "For the vows", image: rings },
];

export type Product = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  mrp: number;
  image: string;
  weight: number;
  metal: string;
  occasion: string;
  collection: string;
  badge?: string | undefined;
  rating: number;
  reviews: number;
  stock: number;
  popularity: number;
  description: string;
};

const base: Array<[string, string, string, number, number, string, number, string, string?]> = [
  // Bracelets
  ["Nithya Cuff Bracelet", "bracelets", "Bracelets", 5990, 7200, pBrac1, 14.8, "Everyday", "Bestseller"],
  ["Mira Charm Bracelet", "bracelets", "Bracelets", 4490, 5400, pBrac2, 11.2, "Gifting"],
  ["Ira Braided Bracelet", "bracelets", "Bracelets", 3890, 4700, pBrac3, 9.6, "Everyday"],
  ["Saanvi Beaded Bangle", "bracelets", "Bracelets", 4190, 5100, pBrac4, 10.4, "Festive", "New"],
  ["Diya Line Bracelet", "bracelets", "Bracelets", 7490, 8900, pBrac5, 13.1, "Wedding", "Trending"],
  ["Aria Bar Link Bracelet", "bracelets", "Bracelets", 3290, 3900, pBrac6, 8.2, "Everyday"],
  // Chains
  ["Kanaka Link Chain", "chains", "Silver Chains", 6890, 8400, pChain1, 18.4, "Everyday", "Trending"],
  ["Samrat Curb Chain", "chains", "Silver Chains", 8490, 9900, pChain2, 26.3, "Wedding"],
  ["Nira Fine Box Chain", "chains", "Silver Chains", 3590, 4300, pChain3, 7.8, "Everyday", "New"],
  ["Veda Rope Chain", "chains", "Silver Chains", 7290, 8600, pChain4, 21.5, "Festive"],
  ["Arjun Figaro Chain", "chains", "Silver Chains", 6490, 7700, pChain5, 19.2, "Everyday"],
  ["Rohan Snake Chain", "chains", "Silver Chains", 5890, 7000, pChain6, 16.4, "Gifting"],
  // Rings
  ["Aarohi Eternity Band", "rings", "Silver Rings", 4290, 5200, pRing1, 6.2, "Wedding", "Bestseller"],
  ["Vaidehi Stackable Ring", "rings", "Silver Rings", 2190, 2700, pRing2, 3.1, "Everyday", "New"],
  ["Kavya Bridal Ring Set", "rings", "Silver Rings", 11900, 14500, pRing3, 15.4, "Wedding", "Trending"],
  ["Advik Signet Ring", "rings", "Silver Rings", 5490, 6500, pRing4, 9.8, "Everyday"],
  ["Riya Twisted Rope Ring", "rings", "Silver Rings", 2790, 3400, pRing5, 4.0, "Gifting"],
  ["Anvi Engraved Band", "rings", "Silver Rings", 3490, 4200, pRing6, 5.6, "Festive"],
  // Earrings
  ["Meera Teardrop Earrings", "earrings", "Earrings", 3450, 4100, pEar1, 5.1, "Festive", "Bestseller"],
  ["Tara Hoop Earrings", "earrings", "Earrings", 2790, 3300, pEar2, 4.2, "Everyday"],
  ["Nyra Solitaire Studs", "earrings", "Earrings", 2290, 2800, pEar3, 2.6, "Everyday", "New"],
  ["Reva Temple Jhumkas", "earrings", "Earrings", 6890, 8200, pEar4, 12.8, "Temple", "Trending"],
  ["Kiara Huggie Hoops", "earrings", "Earrings", 1990, 2400, pEar5, 2.2, "Everyday"],
  ["Saira Pearl Drops", "earrings", "Earrings", 3990, 4700, pEar6, 4.8, "Gifting"],
  // Pendants
  ["Ishira Solitaire Pendant", "pendants", "Pendants", 4590, 5500, pPen1, 5.8, "Gifting", "Bestseller"],
  ["Rudra Temple Pendant", "pendants", "Pendants", 2890, 3600, pPen2, 4.4, "Temple", "New"],
  ["Anika Heart Pendant", "pendants", "Pendants", 2490, 3000, pPen3, 3.6, "Gifting"],
  ["Ojas Engraved Locket", "pendants", "Pendants", 5290, 6300, pPen4, 8.4, "Festive"],
  ["Neel Minimal Bar Pendant", "pendants", "Pendants", 2190, 2600, pPen5, 3.0, "Everyday"],
  ["Chandra Moon Pendant", "pendants", "Pendants", 3390, 4000, pPen6, 4.6, "Festive", "Trending"],
  // Other
  ["Laxmi Devotional Idol", "idols", "Silver Idols", 18900, 22500, idols, 96.0, "Gifting"],
  ["Anaya Rope Anklet", "anklets", "Anklets", 3990, 4800, bracelets, 12.6, "Festive"],
  // Kada
  ["Veer Classic Silver Kada", "kada", "Kada", 8990, 10800, pKada1, 42.5, "Everyday", "Bestseller"],
  ["Shivaya Temple Kada", "kada", "Kada", 11900, 14200, pKada2, 56.2, "Temple", "Trending"],
  ["Rudraksh Rope Kada", "kada", "Kada", 7490, 8900, pKada3, 34.8, "Everyday"],
  ["Bhairav Hammered Kada", "kada", "Kada", 9890, 11800, pKada4, 46.4, "Festive", "New"],
  ["Simha Tiger Kada", "kada", "Kada", 13900, 16500, pKada5, 62.0, "Wedding"],
  // Payal
  ["Ghungroo Bell Payal", "payal", "Payal", 5490, 6600, pPayal1, 24.6, "Festive", "Bestseller"],
  ["Nitya Fine Chain Payal", "payal", "Payal", 3290, 3900, pPayal2, 11.8, "Everyday", "New"],
  ["Meenal Oxidised Payal", "payal", "Payal", 4290, 5100, pPayal3, 16.4, "Festive"],
  ["Vadhu Bridal Payal", "payal", "Payal", 8490, 10200, pPayal4, 32.5, "Wedding", "Trending"],
  ["Tara Star Charm Payal", "payal", "Payal", 3990, 4700, pPayal5, 14.2, "Gifting"],
];

export const products: Product[] = base.map(
  ([name, category, categoryLabel, price, mrp, image, weight, occasion, badge], i) => ({
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    category,
    categoryLabel,
    price,
    mrp,
    image,
    weight,
    metal: "925 Sterling Silver",
    occasion,
    collection: occasion === "Temple" ? "Temple" : occasion === "Wedding" ? "Wedding" : "Signature",
    badge,
    rating: 4.6 + ((i % 4) * 0.1),
    reviews: 38 + i * 17,
    stock: i % 7 === 0 ? 3 : 24,
    popularity: 100 - i * 4,
    description:
      "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages, this piece is finished with a rhodium seal that resists tarnish and keeps its mirror lustre for years.",
  }),
);

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);