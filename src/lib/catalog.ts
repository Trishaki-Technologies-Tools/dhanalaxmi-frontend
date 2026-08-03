import rings from "@/assets/cat-rings.jpg";
import chains from "@/assets/cat-chains.jpg";
import earrings from "@/assets/cat-earrings.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import pendants from "@/assets/cat-pendants.jpg";
import idols from "@/assets/cat-idols.jpg";

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
  ["Aarohi Eternity Band", "rings", "Silver Rings", 4290, 5200, rings, 6.2, "Wedding", "Bestseller"],
  ["Kanaka Link Chain", "chains", "Silver Chains", 6890, 8400, chains, 18.4, "Everyday", "Trending"],
  ["Meera Teardrop Earrings", "earrings", "Earrings", 3450, 4100, earrings, 5.1, "Festive"],
  ["Nithya Cuff Bracelet", "bracelets", "Bracelets", 5990, 7200, bracelets, 14.8, "Everyday"],
  ["Rudra Temple Pendant", "pendants", "Pendants", 2890, 3600, pendants, 4.4, "Temple", "New"],
  ["Laxmi Devotional Idol", "idols", "Silver Idols", 18900, 22500, idols, 96.0, "Gifting"],
  ["Vaidehi Stackable Ring", "rings", "Silver Rings", 2190, 2700, rings, 3.1, "Everyday", "New"],
  ["Anaya Rope Anklet", "anklets", "Anklets", 3990, 4800, bracelets, 12.6, "Festive"],
  ["Ishira Solitaire Pendant", "pendants", "Pendants", 4590, 5500, pendants, 5.8, "Gifting", "Bestseller"],
  ["Tara Hoop Earrings", "earrings", "Earrings", 2790, 3300, earrings, 4.2, "Everyday"],
  ["Samrat Curb Chain", "chains", "Silver Chains", 8490, 9900, chains, 26.3, "Wedding"],
  ["Kavya Bridal Ring Set", "rings", "Silver Rings", 11900, 14500, rings, 15.4, "Wedding", "Trending"],
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