import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search Silver Jewellery — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Search the Dhanalaxmi Jeweler's catalogue of hallmarked 925 silver earrings, chains, kada, payal, rings and pendants with live filters.",
      },
      { property: "og:title", content: "Search Silver Jewellery — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Find hallmarked 925 silver pieces by name, category, occasion and price.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const occasions = ["Everyday", "Festive", "Wedding", "Temple", "Gifting"];
const sorts = ["Relevance", "Price: Low to High", "Price: High to Low", "Weight"] as const;
const suggestions = ["Earrings", "Jhumkas", "Kada", "Payal", "Chain", "Bridal"];

function score(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.reduce((s, t) => (lower.includes(t) ? s + 1 : s), 0);
}

function SearchPage() {
  const { categories, products } = useCatalog();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [draft, setDraft] = useState(q);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [cats, setCats] = useState<string[]>([]);
  const [occ, setOcc] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof sorts)[number]>("Relevance");
  const [showFilters, setShowFilters] = useState(false);

  const terms = useMemo(
    () => q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean),
    [q],
  );

  const results = useMemo(() => {
    const matched = products
      .map((p) => ({
        product: p,
        relevance:
          terms.length === 0
            ? p.popularity / 100
            : score(`${p.name} ${p.categoryLabel} ${p.occasion} ${p.collection} ${p.metal}`, terms),
      }))
      .filter(({ product, relevance }) => {
        if (terms.length > 0 && relevance === 0) return false;
        if (product.stock <= 0) return false;
        if (product.price > maxPrice) return false;
        if (cats.length > 0 && !cats.includes(product.category)) return false;
        if (occ.length > 0 && !occ.includes(product.occasion)) return false;
        return true;
      });

    if (sort === "Price: Low to High") matched.sort((a, b) => a.product.price - b.product.price);
    else if (sort === "Price: High to Low") matched.sort((a, b) => b.product.price - a.product.price);
    else if (sort === "Weight") matched.sort((a, b) => b.product.weight - a.product.weight);
    else matched.sort((a, b) => b.relevance - a.relevance || b.product.popularity - a.product.popularity);

    return matched.map((m) => m.product);
  }, [products, terms, maxPrice, cats, occ, sort]);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = (value: string) => navigate({ search: { q: value } });

  return (
    <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
      <Reveal>
        <p className="text-eyebrow text-maroon">Search</p>
        <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">
          {q ? `Results for “${q}”` : "Find your piece"}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft.trim());
          }}
          className="mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-border bg-background px-5 py-2 focus-within:border-maroon focus-within:ring-2 focus-within:ring-maroon/20"
        >
          <SearchIcon className="size-4 text-maroon" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search earrings, kada, payal, chains…"
            aria-label="Search products"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          />
          {draft ? (
            <button type="button" aria-label="Clear" onClick={() => { setDraft(""); submit(""); }}>
              <X className="size-4 text-muted-foreground" />
            </button>
          ) : null}
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Popular
          </span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setDraft(s);
                submit(s);
              }}
              className="rounded-full border border-border px-4 py-1.5 text-xs transition-colors hover:border-maroon hover:text-maroon"
            >
              {s}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[17rem_1fr]">
        <aside className={cn("lg:block", showFilters ? "block" : "hidden")}>
          <div className="border-t border-border py-7">
            <p className="text-eyebrow">Price · up to {formatINR(maxPrice)}</p>
            <input
              type="range"
              min={2000}
              max={20000}
              step={500}
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-5 w-full accent-primary"
            />
          </div>
          <div className="border-t border-border py-7">
            <p className="text-eyebrow">Category</p>
            <div className="mt-5 space-y-3">
              {categories.slice(0, 8).map((c) => (
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
            </div>
          </div>
          <div className="border-t border-border py-7">
            <p className="text-eyebrow">Occasion</p>
            <div className="mt-5 space-y-3">
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
            </div>
          </div>
          {(cats.length > 0 || occ.length > 0 || maxPrice < 20000) && (
            <button
              onClick={() => {
                setCats([]);
                setOcc([]);
                setMaxPrice(20000);
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-maroon/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon transition-colors hover:bg-maroon-soft"
            >
              <X className="size-3.5" /> Reset filters
            </button>
          )}
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] lg:hidden"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <p className="text-sm text-muted-foreground">{results.length} pieces found</p>
            <select
              value={sort}
              aria-label="Sort results"
              onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
              className="ml-auto rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] outline-none"
            >
              {sorts.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {results.length === 0 ? (
            <div className="luxe-card mt-12 p-16 text-center">
              <SearchIcon className="mx-auto size-6 text-maroon" />
              <h2 className="mt-4 font-display text-2xl">No matches</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or browse the full catalogue.
              </p>
              <Link
                to="/shop"
                className="mt-7 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
              >
                Browse all
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
