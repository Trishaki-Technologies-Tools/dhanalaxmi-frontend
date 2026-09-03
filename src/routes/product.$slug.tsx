import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BadgeCheck,
  Heart,
  Truck,
  RefreshCw,
  Scale,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import { formatINR, type Product } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { api } from "@/lib/api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await api.products.getBySlug(params.slug);
      if (!res.product) throw notFound();
      return { product: res.product as Product };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.name} — Dhanalaxmi Jeweler's`;
    const description = `${product.name} in 925 hallmarked sterling silver · ${product.weight}g · ${formatINR(product.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: loaded } = Route.useLoaderData();
  const { products } = useCatalog();
  const product = products.find((p) => p.slug === loaded.slug) ?? loaded;
  const [active, setActive] = useState(0);
  const { add, setOpen } = useCart();
  const { toggle, has } = useWishlist();
  const navigate = useNavigate();
  const gallery = [product.image, product.image, product.image, product.image];
  const related = products.filter((p) => p.slug !== product.slug && p.stock > 0).slice(0, 4);
  const isSoldOut = product.stock <= 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loaded.slug]);

  return (
    <div>
      <div className="mx-auto max-w-[88rem] px-6 py-10 lg:px-10">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-maroon">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/shop" className="transition-colors hover:text-maroon">
            Shop
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-10 grid gap-14 lg:grid-cols-2">
          <div>
            <Reveal className="overflow-hidden rounded-[1.25rem] border border-border bg-secondary">
              {gallery[active] ? (
                <img
                  src={gallery[active]}
                  alt={product.name}
                  width={900}
                  height={1100}
                  className="aspect-4/5 w-full object-cover transition-transform duration-700 hover:scale-110"
                />
              ) : (
                <div className="aspect-4/5 w-full flex items-center justify-center bg-muted/30 border-b border-border/50 text-xl text-muted-foreground uppercase tracking-widest font-display">
                  {product.name.slice(0, 2)}
                </div>
              )}
            </Reveal>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "overflow-hidden rounded-[1rem] border bg-secondary transition-colors",
                    active === i ? "border-maroon" : "border-border",
                  )}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      width={900}
                      height={1100}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full flex items-center justify-center bg-muted/30 text-xs text-muted-foreground uppercase tracking-widest">
                      {product.name.slice(0, 2)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-eyebrow">{product.categoryLabel}</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-current text-maroon" />
              {product.rating.toFixed(1)} · {product.reviews} reviews
              <span className="px-2">|</span>
              <span className={product.stock < 5 ? "text-foreground" : ""}>
                {product.stock < 5 ? `Only ${product.stock} left` : "In stock"}
              </span>
            </div>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-price text-5xl">{formatINR(product.price)}</span>
              <span className="text-lg text-muted-foreground line-through">
                {formatINR(product.mrp)}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inclusive of all taxes · Free insured shipping
            </p>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                disabled={isSoldOut}
                onClick={() => {
                  if (isSoldOut) return;
                  add(product.slug);
                  setOpen(true);
                  toast.success(`${product.name} added to your bag.`);
                }}
                className={cn(
                  "h-14 flex-1 rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em] shadow-luxe transition-colors",
                  isSoldOut 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:bg-maroon-deep active:bg-maroon-deep"
                )}
              >
                {isSoldOut ? "Out of Stock" : "Add to bag"}
              </button>
              <button
                onClick={() => product.id && toggle(product.id, product.name)}
                aria-label="Add to wishlist"
                className={cn(
                  "flex size-14 items-center justify-center rounded-full border transition-colors hover:bg-maroon-soft hover:border-maroon",
                  product.id && has(product.id) ? "border-maroon text-maroon" : "border-border text-foreground hover:text-maroon"
                )}
              >
                <Heart className={cn("size-5", product.id && has(product.id) && "fill-current")} />
              </button>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-y-6 border-t border-border pt-8 text-sm">
              {[
                ["Metal", product.metal],
                ["Net weight", `${product.weight} g`],
                ...(product.makingCharges ? [["Making charges", `${formatINR(product.makingCharges)} / g`]] : []),
                ["Hallmark", "BIS 925 assayed"],
                ["Occasion", product.occasion],
                ["Collection", product.collection],
                ["Delivery", "3–5 business days"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1.5">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                [BadgeCheck, "Hallmark certificate included"],
                [Truck, "Insured, tracked shipping"],
                [RefreshCw, "15-day easy returns"],
                [Scale, "Transparent weight card"],
                [ShieldCheck, "Lifetime polish & repair"],
              ].map(([Icon, label], i) => {
                const I = Icon as typeof BadgeCheck;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <I className="size-4 text-maroon" />
                    {label as string}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-[1.25rem] bg-secondary p-7">
              <p className="text-eyebrow">Care instructions</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Store in the pouch provided, away from perfume and moisture. Wipe with the
                included polish cloth after wear. Bring it in annually for a complimentary
                professional polish.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24 border-t border-border bg-secondary py-24">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-4xl">You may also love</h2>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:text-maroon"
            >
              Browse all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="glass-panel fixed inset-x-0 bottom-16 z-30 flex items-center justify-between gap-4 border-t px-6 py-3 md:bottom-0">
        <div>
          <p className="text-xs text-muted-foreground">{product.name}</p>
          <p className="font-price text-xl">{formatINR(product.price)}</p>
        </div>
        <button
          disabled={isSoldOut}
          onClick={() => {
            if (isSoldOut) return;
            add(product.slug);
            navigate({ to: "/checkout" });
          }}
          className={cn(
            "rounded-full px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
            isSoldOut
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-maroon-deep active:bg-maroon-deep"
          )}
        >
          {isSoldOut ? "Sold" : "Buy now"}
        </button>
      </div>
    </div>
  );
}