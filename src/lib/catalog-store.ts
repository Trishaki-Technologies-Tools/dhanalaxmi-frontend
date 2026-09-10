import { useSyncExternalStore } from "react";
import {
  categories as defaultCategories,
  categoryImages,
  products as defaultProducts,
  type Category,
  type Product,
} from "@/lib/catalog";
import { api } from "@/lib/api";
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
export async function hydrateCatalog() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CatalogState>;
      state = {
        products: parsed.products?.length ? parsed.products : state.products,
        categories: parsed.categories?.length
          ? parsed.categories.map((c: any) => {
              const localMatch = defaultCategories.find((lc) => lc.slug === c.slug);
              const validImage = c.image && c.image.trim() !== "" ? c.image : (localMatch?.image || "");
              return { ...c, image: validImage };
            })
          : state.categories,
        banners: parsed.banners?.length ? parsed.banners : state.banners,
        promos: parsed.promos?.length ? parsed.promos : state.promos,
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      };
      emit();
    }

    // Fetch live products from MySQL backend API (with Cloudflare R2 images)
    try {
      const data = await api.products.getAll();
      if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
          const apiProducts: Product[] = data.products.map((p: any) => {
            const localMatch = defaultProducts.find((lp) => lp.slug === p.slug);
            let resolvedImage = p.image;
            if (resolvedImage && !resolvedImage.startsWith("http") && !resolvedImage.startsWith("/assets/")) {
              resolvedImage = `https://pub-942d3ce481d44239b1d6082803b50b4c.r2.dev/${resolvedImage}`;
            } else if (resolvedImage && resolvedImage.startsWith("/assets/") && localMatch) {
              resolvedImage = localMatch.image;
            }
            
            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              category: p.categorySlug || p.category?.slug || "bracelets",
              categoryLabel: p.categoryLabel || p.category?.name || "Silver Jewelry",
              price: Number(p.price) || 0,
              mrp: Number(p.mrp) || Math.round((Number(p.price) || 0) * 1.2),
              image: resolvedImage,
              weight: Number(p.weight) || 10.0,
              makingCharges: Number(p.makingCharges) || (Math.floor(Math.random() * 21) + 40),
              metal: p.metal || "925 Sterling Silver",
              occasion: p.occasion || "Everyday",
              collection: p.collection || "Signature",
              badge: p.badge || undefined,
              rating: Number(p.rating) || 4.8,
              reviews: Number(p.reviewsCount ?? p.reviews) || 24,
              stock: Number(p.stock) || 20,
              popularity: Number(p.popularity) || 85,
              description: p.description || "Crafted in 925 hallmarked sterling silver.",
            };
          });
          state = { ...state, products: apiProducts };
          persist();
          emit();
        }
      // Fetch categories
      try {
        const catRes = await api.categories.getAll();
        if (catRes.categories && catRes.categories.length > 0) {
          const apiCategories = catRes.categories.map((c: any) => {
            const localMatch = defaultCategories.find((lc) => lc.slug === c.slug);
            let resolvedImage = c.image;
            if (!resolvedImage || (!resolvedImage.startsWith("http") && !resolvedImage.startsWith("/assets/"))) {
              if (localMatch?.image) {
                resolvedImage = localMatch.image;
              }
            }
            return { ...c, image: resolvedImage || (localMatch?.image || "") };
          });
          state = { ...state, categories: apiCategories };
          persist();
          emit();
        }
      } catch (err) {}

      // Fetch banners & promos
      try {
        const banRes = await api.banners.getAll();
        if (banRes.banners || banRes.promos) {
          state = { 
            ...state, 
            banners: banRes.banners && banRes.banners.length > 0 ? banRes.banners : state.banners,
            promos: banRes.promos && banRes.promos.length > 0 ? banRes.promos : state.promos,
          };
          persist();
          emit();
        }
      } catch (err) {}

    } catch {
      /* Fallback to default/local catalog if offline */
    }
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

export async function saveProduct(product: Product, originalSlug?: string) {
  try {
    if (product.id) {
      await api.products.update(product.id, product);
    } else if (originalSlug) {
      await api.products.update(originalSlug, product);
    } else {
      const res = await api.products.create(product);
      if (res.product && res.product.id) product.id = res.product.id;
    }
  } catch (err) {
    console.error("Failed to sync product to DB", err);
  }

  const list = [...state.products];
  const idx = originalSlug ? list.findIndex((p) => p.slug === originalSlug) : -1;
  if (idx >= 0) list[idx] = product;
  else list.unshift(product);
  updateCatalog({ products: list });
}

export async function deleteProduct(slug: string) {
  const target = state.products.find((p) => p.slug === slug);
  try {
    if (target && target.id) {
      await api.products.delete(target.id);
    } else {
      await api.products.delete(slug);
    }
  } catch (err) {
    console.error("Failed to delete product from DB", err);
  }
  updateCatalog({ products: state.products.filter((p) => p.slug !== slug) });
}

export async function saveCategory(category: Category, originalSlug?: string) {
  try {
    if (originalSlug) {
      await api.categories.update(originalSlug, category);
    } else {
      await api.categories.create(category);
    }
  } catch (err) {
    console.error("Failed to sync category to DB", err);
  }
  const list = [...state.categories];
  const idx = originalSlug ? list.findIndex((c) => c.slug === originalSlug) : -1;
  if (idx >= 0) list[idx] = category;
  else list.push(category);
  updateCatalog({ categories: list });
}

export async function deleteCategory(slug: string) {
  try {
    await api.categories.delete(slug);
  } catch (err) {
    console.error("Failed to delete category from DB", err);
  }
  updateCatalog({ categories: state.categories.filter((c) => c.slug !== slug) });
}

export async function saveBanner(banner: Banner) {
  try {
    const exists = state.banners.some((b) => b.id === banner.id);
    if (exists && !banner.id.startsWith("new-")) {
      await api.banners.updateBanner(banner.id, banner);
    } else {
      const res = await api.banners.createBanner(banner);
      if (res.banner) banner.id = res.banner.id;
    }
  } catch (err) {
    console.error("Failed to sync banner to DB", err);
  }
  const list = [...state.banners];
  const idx = list.findIndex((b) => b.id === banner.id);
  if (idx >= 0) list[idx] = banner;
  else list.push(banner);
  updateCatalog({ banners: list });
}

export async function deleteBanner(id: string) {
  try {
    await api.banners.deleteBanner(id);
  } catch (err) {
    console.error("Failed to delete banner from DB", err);
  }
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

export async function savePromo(promo: PromoTile) {
  try {
    const exists = state.promos.some((p) => p.id === promo.id);
    if (exists && !promo.id.startsWith("new-")) {
      await api.banners.updatePromo(promo.id, promo);
    } else {
      const res = await api.banners.createPromo(promo);
      if (res.promo) promo.id = res.promo.id;
    }
  } catch (err) {
    console.error("Failed to sync promo to DB", err);
  }
  const list = [...state.promos];
  const idx = list.findIndex((p) => p.id === promo.id);
  if (idx >= 0) list[idx] = promo;
  else list.push(promo);
  updateCatalog({ promos: list });
}

export async function deletePromo(id: string) {
  try {
    await api.banners.deletePromo(id);
  } catch (err) {
    console.error("Failed to delete promo from DB", err);
  }
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