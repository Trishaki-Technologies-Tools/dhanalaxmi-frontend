import { useSyncExternalStore } from "react";
import {
  categories as defaultCategories,
  categoryImages,
  products as defaultProducts,
  type Category,
  type Product,
} from "@/lib/catalog";
import heroCinematic from "@/assets/hero-cinematic.jpg";
import heroEarrings from "@/assets/hero-earrings.jpg";
import heroModel from "@/assets/hero-model.jpg";

export type Banner = {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  copy: string;
  cta: string;
  category?: string | undefined;
  active: boolean;
};

export type PromoTile = {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  cta: string;
  image: string;
  dark: boolean;
  category?: string | undefined;
};

export type StoreSettings = {
  brandName: string;
  announcement: string;
  supportPhone: string;
  supportEmail: string;
  codFee: number;
  freeShippingAbove: number;
  popularCategories: string[];
  homeCategoryOrder: string[];
};

export type CatalogState = {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  promos: PromoTile[];
  settings: StoreSettings;
};

const STORAGE_KEY = "dj-catalog-v1";

export const defaultBanners: Banner[] = [
  {
    id: "b1",
    image: heroEarrings,
    alt: "Woman wearing an intricate hallmarked 925 sterling silver chandelier earring",
    eyebrow: "Earring Edit",
    titleTop: "Light That",
    titleBottom: "Moves With You",
    copy: "Our bestselling sterling silver earrings — filigree studs, jhumkas and drops, hallmarked at 92.5 purity.",
    cta: "Shop Earrings",
    category: "earrings",
    active: true,
  },
  {
    id: "b2",
    image: heroCinematic,
    alt: "Model wearing layered sterling silver necklaces",
    eyebrow: "The Silver Edit",
    titleTop: "Crafted In Silver.",
    titleBottom: "Designed Forever.",
    copy: "Hand-finished heirlooms across fourteen stations, assayed at 92.5 purity",
    cta: "Explore Collection",
    active: true,
  },
  {
    id: "b3",
    image: heroModel,
    alt: "Portrait of a model wearing silver earrings and pendant",
    eyebrow: "Festive Season",
    titleTop: "Timeless Pieces,",
    titleBottom: "Everyday Luxury",
    copy: "Free insured shipping, lifetime polish and certified hallmark on every order",
    cta: "Shop The Edit",
    active: true,
  },
];

export const defaultPromos: PromoTile[] = [
  {
    id: "p1",
    eyebrow: "2026 Fashion",
    titleTop: "Just Launched",
    titleBottom: "Temple Edit",
    cta: "See More",
    image: categoryImages.idols,
    dark: false,
    category: "idols",
  },
  {
    id: "p2",
    eyebrow: "Flat Discount",
    titleTop: "Necklaces &",
    titleBottom: "Body Jewels",
    cta: "Shop Now",
    image: categoryImages.chains,
    dark: false,
    category: "chains",
  },
  {
    id: "p3",
    eyebrow: "New Collection",
    titleTop: "Jewelry &",
    titleBottom: "Charm Rings",
    cta: "Shop Now",
    image: categoryImages.rings,
    dark: true,
    category: "rings",
  },
];

export const defaultSettings: StoreSettings = {
  brandName: "Dhanalaxmi Jeweler's",
  announcement: "Free insured shipping · Hallmarked 925 · Lifetime polish",
  supportPhone: "+91 98765 43210",
  supportEmail: "care@dhanalaxmijewelers.com",
  codFee: 100,
  freeShippingAbove: 0,
  popularCategories: ["earrings", "bracelets", "chains", "kada", "payal", "rings"],
  homeCategoryOrder: ["earrings", "bracelets", "chains", "kada", "payal", "rings", "pendants"],
};

function defaults(): CatalogState {
  return {
    products: defaultProducts.map((p) => ({ ...p })),
    categories: defaultCategories.map((c) => ({ ...c })),
    banners: defaultBanners.map((b) => ({ ...b })),
    promos: defaultPromos.map((p) => ({ ...p })),
    settings: { ...defaultSettings },
  };
}

let state: CatalogState = defaults();
const serverState: CatalogState = defaults();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** Called once on the client after hydration so SSR markup matches. */
export function hydrateCatalog() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<CatalogState>;
    state = {
      products: parsed.products?.length ? parsed.products : state.products,
      categories: parsed.categories?.length ? parsed.categories : state.categories,
      banners: parsed.banners?.length ? parsed.banners : state.banners,
      promos: parsed.promos?.length ? parsed.promos : state.promos,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    };
    emit();
  } catch {
    /* ignore */
  }
}

export function updateCatalog(patch: Partial<CatalogState>) {
  state = { ...state, ...patch };
  persist();
  emit();
}

export function resetCatalog() {
  state = defaults();
  persist();
  emit();
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function saveProduct(product: Product, originalSlug?: string) {
  const list = [...state.products];
  const idx = originalSlug ? list.findIndex((p) => p.slug === originalSlug) : -1;
  if (idx >= 0) list[idx] = product;
  else list.unshift(product);
  updateCatalog({ products: list });
}

export function deleteProduct(slug: string) {
  updateCatalog({ products: state.products.filter((p) => p.slug !== slug) });
}

export function saveCategory(category: Category, originalSlug?: string) {
  const list = [...state.categories];
  const idx = originalSlug ? list.findIndex((c) => c.slug === originalSlug) : -1;
  if (idx >= 0) list[idx] = category;
  else list.push(category);
  updateCatalog({ categories: list });
}

export function deleteCategory(slug: string) {
  updateCatalog({ categories: state.categories.filter((c) => c.slug !== slug) });
}

export function saveBanner(banner: Banner) {
  const list = [...state.banners];
  const idx = list.findIndex((b) => b.id === banner.id);
  if (idx >= 0) list[idx] = banner;
  else list.push(banner);
  updateCatalog({ banners: list });
}

export function deleteBanner(id: string) {
  updateCatalog({ banners: state.banners.filter((b) => b.id !== id) });
}

export function moveBanner(id: string, dir: -1 | 1) {
  const list = [...state.banners];
  const i = list.findIndex((b) => b.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  const a = list[i]!;
  const b = list[j]!;
  list[i] = b;
  list[j] = a;
  updateCatalog({ banners: list });
}

export function savePromo(promo: PromoTile) {
  const list = [...state.promos];
  const idx = list.findIndex((p) => p.id === promo.id);
  if (idx >= 0) list[idx] = promo;
  else list.push(promo);
  updateCatalog({ promos: list });
}

export function deletePromo(id: string) {
  updateCatalog({ promos: state.promos.filter((p) => p.id !== id) });
}

export function saveSettings(patch: Partial<StoreSettings>) {
  updateCatalog({ settings: { ...state.settings, ...patch } });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCatalog(): CatalogState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}