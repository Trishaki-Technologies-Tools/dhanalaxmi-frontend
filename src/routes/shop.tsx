import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { formatINR } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop 925 Silver Jewelry — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Shop hallmarked 925 sterling silver jewelry with filters for price, weight, category, occasion and collection.",
      },
      { property: "og:title", content: "Shop 925 Silver Jewelry — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Filter by price, weight, occasion and collection across our silver catalogue.",
      },
    ],
  }),
  component: ShopPage,
});

const occasions = ["Everyday", "Festive", "Wedding", "Temple", "Gifting"];
const sorts = ["Popularity", "Price: Low to High", "Price: High to Low", "Weight"] as const;

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border py-7">
      <p className="text-eyebrow">{title}</p>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

function ShopPage() {
  const { categories, products } = useCatalog();
  const search = Route.useSearch();
  const initialCategory = search.category?.toLowerCase();
  const isValidCategory = categories.some((c) => c.slug === initialCategory);

  const [maxPrice, setMaxPrice] = useState(20000);
  const [cats, setCats] = useState<string[]>(
    isValidCategory && initialCategory ? [initialCategory] : [],
  );
  const [occ, setOcc] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Popularity");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const visible = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        p.price <= maxPrice &&
        p.stock > 0 &&
        (cats.length === 0 || cats.includes(p.category)) &&
        (occ.length === 0 || occ.includes(p.occasion)),
    );
    const sorted = [...filtered];
    if (sort === "Price: Low to High") sorted.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") sorted.sort((a, b) => b.price - a.price);
    if (sort === "Weight") sorted.sort((a, b) => b.weight - a.weight);
    if (sort === "Popularity") sorted.sort((a, b) => b.popularity - a.popularity);
    return sorted;
  }, [products, maxPrice, cats, occ, sort]);

  const activeCategory = cats.length === 1 ? categories.find((c) => c.slug === cats[0]) : null;

  return (
    <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
      <Reveal>
        <p className="text-eyebrow">Shop</p>
        <h1 className="mt-4 text-5xl leading-tight sm:text-6xl">
          {activeCategory ? activeCategory.name : "The Silver Catalogue"}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="max-w-xl text-sm text-muted-foreground">
            {visible.length} hallmarked pieces · transparent weights · lifetime polish included
          </p>
          {activeCategory && (
            <Link
              to="/shop"
              search={{}}
              onClick={() => setCats([])}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors hover:bg-maroon hover:text-white"
            >
              <X className="size-3.5" /> Clear filter
            </Link>
          )}
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[17rem_1fr]">
        <aside
          className={cn(
            "lg:block",
            showFilters ? "block" : "hidden",
          )}
        >
          <FilterGroup title={`Price · up to ${formatINR(maxPrice)}`}>
            <input
              type="range"
              min={2000}
              max={20000}
              step={500}
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </FilterGroup>

          <FilterGroup title="Category">
            {categories.slice(0, 7).map((c) => (
              <label key={c.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={cats.includes(c.slug)}
                  onChange={() => toggle(cats, c.slug, setCats)}
                  className="size-4 accent-primary"
                />
                <span className="text-muted-foreground">{c.name}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Occasion">
            {occasions.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={occ.includes(o)}
                  onChange={() => toggle(occ, o, setOcc)}
                  className="size-4 accent-primary"
                />
                <span className="text-muted-foreground">{o}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Metal">
            <p className="text-sm text-muted-foreground">925 Sterling Silver</p>
            <p className="text-sm text-muted-foreground">Rhodium Sealed</p>
          </FilterGroup>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] lg:hidden"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <select
              value={sort}
              aria-label="Sort products"
              onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] outline-none"
            >
              {sorts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  aria-label={`${v} view`}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border border-border transition-colors",
                    view === v ? "bg-primary text-primary-foreground" : "hover:bg-maroon-soft hover:text-maroon",
                  )}
                >
                  {v === "grid" ? (
                    <LayoutGrid className="size-4" />
                  ) : (
                    <List className="size-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="luxe-card mt-12 p-16 text-center">
              <p className="font-display text-2xl">Nothing matches those filters</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Try widening the price range or clearing a category.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "mt-10 grid gap-3 sm:gap-5",
                view === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-2xl",
              )}
            >
              {visible.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-16 flex items-center justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={cn(
                  "size-10 rounded-full border border-border text-sm transition-colors",
                  n === 1 ? "bg-primary text-primary-foreground" : "hover:bg-maroon-soft hover:text-maroon",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}