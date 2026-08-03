import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, BadgeCheck, Gem, Sparkles, Truck, RefreshCw, Quote } from "lucide-react";
import heroImage from "@/assets/hero-silver.jpg";
import craftImage from "@/assets/craft.jpg";
import { categories, products } from "@/lib/catalog";
import { ProductCard } from "@/components/site/product-card";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dhanalaxmi Jeweler's — Luxury 925 Silver Jewelry" },
      {
        name: "description",
        content:
          "Discover hallmarked 925 sterling silver rings, chains, pendants and temple idols — hand-finished heirlooms with insured shipping and lifetime polish.",
      },
      { property: "og:title", content: "Dhanalaxmi Jeweler's — Luxury 925 Silver Jewelry" },
      {
        property: "og:description",
        content: "Hand-finished hallmarked sterling silver heirlooms since 1978.",
      },
    ],
  }),
  component: Index,
});

const trust = [
  { Icon: BadgeCheck, title: "BIS Hallmarked", copy: "Every piece certified 925 purity." },
  { Icon: Truck, title: "Insured Delivery", copy: "Complimentary across India." },
  { Icon: RefreshCw, title: "15-Day Returns", copy: "No-questions exchange window." },
  { Icon: Gem, title: "Lifetime Polish", copy: "Free re-polish, forever." },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-secondary">
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sterling silver pendant necklace and ring on white marble"
          width={1920}
          height={1200}
          className="size-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto flex min-h-[86vh] max-w-[88rem] flex-col justify-center px-6 py-28 lg:px-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-eyebrow"
        >
          Est. 1978 · Sterling Silver Atelier
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-3xl text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]"
        >
          Silver, shaped with
          <span className="block italic">quiet devotion.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground"
        >
          Hallmarked 925 heirlooms hand-finished across fourteen stages by three generations of
          South Indian silversmiths.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/shop"
            className="group flex h-14 items-center gap-3 rounded-full bg-primary px-9 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-luxe transition-colors hover:bg-silver hover:text-primary"
          >
            Shop Now
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/collections"
            className="flex h-14 items-center rounded-full border border-foreground/20 px-9 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-foreground"
          >
            Explore Collection
          </Link>
        </motion.div>

        <div className="mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-border/70 pt-8">
          {[
            ["47", "Years of craft"],
            ["92.5", "Purity, always"],
            ["1.2L+", "Happy patrons"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-price text-3xl sm:text-4xl">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Index() {
  return (
    <div>
      <Hero />

      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-[88rem] gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {trust.map(({ Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 0.08} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 py-28 lg:px-10">
        <SectionHeading
          eyebrow="The Collections"
          title="Curated for every occasion"
          description="From everyday chains to temple idols cast in solid silver — each edit is designed, hallmarked and finished in our own atelier."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.08}>
              <Link
                to="/shop"
                className="luxe-card luxe-card-hover group block overflow-hidden bg-secondary"
              >
                <div className="overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    width={900}
                    height={1100}
                    className="aspect-4/5 w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                  />
                </div>
                <div className="flex items-center justify-between p-7">
                  <div>
                    <h3 className="text-2xl">{c.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {c.tagline}
                    </p>
                  </div>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Best Sellers"
              title="Most loved this season"
              align="left"
            />
            <Link
              to="/shop"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 py-28 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-[1.25rem]">
            <img
              src={craftImage}
              alt="Silversmith setting a stone into a silver pendant"
              loading="lazy"
              width={1400}
              height={1000}
              className="w-full object-cover"
            />
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Craftsmanship"
              title="Fourteen hands. One heirloom."
              description="Wax carving, casting, filing, stone-setting, tumbling and a rhodium seal — our pieces pass through fourteen dedicated stations before they are boxed."
              align="left"
            />
            <div className="mt-10 space-y-6">
              {[
                ["01", "Design & wax carving", "Sketched in-house, carved by master hands."],
                ["02", "Casting in 925 silver", "Certified grain, zero recycled fillers."],
                ["03", "Hand polish & hallmark", "Mirror lustre, BIS assayed and stamped."],
              ].map(([n, t, c], i) => (
                <Reveal key={n} delay={i * 0.1} className="flex gap-6 border-t border-border pt-6">
                  <span className="font-price text-xl text-silver-deep">{n}</span>
                  <div>
                    <p className="text-lg">{t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{c}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <SectionHeading
            eyebrow="New Arrivals"
            title="Fresh from the atelier"
            description="Newly hallmarked pieces, released in small numbered batches."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(4, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 py-28 lg:px-10">
        <SectionHeading
          eyebrow="Patron Stories"
          title="Words from our clients"
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            [
              "The finish is far beyond what I expected at this price. My anklets still look new after two years.",
              "Sridevi R.",
              "Chennai",
            ],
            [
              "Bought a Laxmi idol for our new home. The detailing is temple-grade — genuinely heirloom quality.",
              "Arvind K.",
              "Bengaluru",
            ],
            [
              "Packaging, certificate, polish cloth — everything felt like a luxury boutique experience.",
              "Nandini M.",
              "Hyderabad",
            ],
          ].map(([quote, name, city], i) => (
            <Reveal key={name} delay={i * 0.08}>
              <figure className="luxe-card luxe-card-hover h-full p-9">
                <Quote className="size-6 text-silver-deep" />
                <blockquote className="mt-6 text-xl leading-relaxed">{quote}</blockquote>
                <figcaption className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {name} · {city}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 pb-8 lg:px-10">
        <Reveal className="relative overflow-hidden rounded-[1.25rem] bg-primary px-8 py-24 text-center text-primary-foreground sm:px-16">
          <Sparkles className="animate-float mx-auto size-6 text-silver" />
          <h2 className="mx-auto mt-8 max-w-2xl text-4xl leading-tight sm:text-5xl">
            Book a private silver consultation
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed opacity-70">
            Our concierge will help you choose weights, finishes and engraving for weddings,
            gifting and temple commissions.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-background px-9 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-silver"
          >
            Talk to a concierge <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
