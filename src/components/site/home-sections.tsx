import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories, categoryImages, products, formatINR, type Category } from "@/lib/catalog";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { ProductCard } from "@/components/site/product-card";

const promos = [
  {
    eyebrow: "2026 Fashion",
    title: ["Just Launched", "Temple Edit"],
    cta: "See More",
    image: categoryImages.idols,
    dark: false,
  },
  {
    eyebrow: "Flat Discount",
    title: ["Necklaces &", "Body Jewels"],
    cta: "Shop Now",
    image: categoryImages.chains,
    dark: false,
  },
  {
    eyebrow: "New Collection",
    title: ["Jewelry &", "Charm Rings"],
    cta: "Shop Now",
    image: categoryImages.rings,
    dark: true,
  },
];

export function PromoTriptych() {
  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto grid max-w-[92rem] gap-6 px-6 md:grid-cols-3 lg:px-12">
        {promos.map((p, i) => (
          <Reveal key={p.eyebrow} delay={i * 0.08}>
            <Link to="/shop" className="group relative block h-full overflow-hidden">
              <img
                src={p.image}
                alt={p.title.join(" ")}
                loading="lazy"
                width={900}
                height={700}
                className="aspect-4/3 w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div
                className={`absolute inset-0 ${
                  p.dark
                    ? "bg-linear-to-r from-ink/85 via-ink/40 to-transparent"
                    : "bg-linear-to-r from-background/80 via-background/30 to-transparent"
                }`}
              />
              <div
                className={`absolute inset-y-0 left-0 flex flex-col justify-center p-8 ${
                  p.dark ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.28em] opacity-70">{p.eyebrow}</p>
                <p className="mt-3 text-2xl font-light leading-tight">
                  {p.title.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </p>
                <span className="btn-luxe mt-5 w-fit border-b border-current pb-1 text-[11px] uppercase tracking-[0.2em]">
                  {p.cta}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const popularOrder = ["earrings", "bracelets", "chains", "kada", "payal", "rings"];

export function PopularCategories() {
  const items = popularOrder
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-[92rem] px-6 lg:px-12">
        <h2 className="text-center text-3xl font-light tracking-tight sm:text-4xl">
          Popular Categories
        </h2>
        <div className="mt-12 grid grid-cols-3 gap-8 lg:grid-cols-6">
          {items.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Link to="/shop" className="group flex flex-col items-center gap-5">
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-mist">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </span>
                <span className="border-b border-transparent pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors group-hover:border-foreground">
                  {c.name}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const categoryOrder = [
  "earrings",
  "bracelets",
  "chains",
  "kada",
  "payal",
  "rings",
  "pendants",
];

export function ShopByCategory() {
  const sections = categoryOrder
    .map((slug) => {
      const category = categories.find((c) => c.slug === slug);
      const items = products.filter((p) => p.category === slug).slice(0, 5);
      return { slug, category, items };
    })
    .filter((s) => s.category && s.items.length > 0);

  return (
    <div className="bg-background">
      {sections.map(({ slug, category, items }, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <section
            key={slug}
            className={isEven ? "bg-background py-12 lg:py-16" : "bg-pearl py-12 lg:py-16"}
          >
            <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
                  eyebrow="Shop by Category"
                  title={category!.name}
                  align="left"
                />
                <Link
                  to="/shop"
                  className="btn-luxe group flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-6 py-2.5 text-sm transition-all hover:bg-foreground hover:text-primary-foreground"
                >
                  View more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {items.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 0.06}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}