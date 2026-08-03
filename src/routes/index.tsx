import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Gem,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Quote,
} from "lucide-react";
import heroModel from "@/assets/hero-model.jpg";
import editorialPortrait from "@/assets/editorial-portrait.jpg";
import editorialHands from "@/assets/editorial-hands.jpg";
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

const ease = [0.22, 1, 0.36, 1] as const;

const floatingCards = [
  { title: "925 Hallmarked", copy: "BIS certified purity", Icon: BadgeCheck },
  { title: "Free Shipping", copy: "Insured, pan-India", Icon: Truck },
  { title: "Trusted Since 1978", copy: "Three generations", Icon: Gem },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-warm-white">
      <div className="silver-halo pointer-events-none absolute -left-32 top-10 size-[38rem] opacity-70" />
      <div className="silver-halo animate-float-slow pointer-events-none absolute -right-24 bottom-0 size-[30rem] opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-silver to-transparent opacity-60" />

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-10 px-6 pb-14 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-20">
        <motion.div style={{ y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-eyebrow"
          >
            Est. 1978 · Sterling Silver Atelier
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.08, ease }}
            className="mt-6 text-[3rem] leading-[0.94] sm:text-[4.25rem] lg:text-[5.75rem]"
          >
            Crafted In Silver.
            <span className="block italic text-silver-deep">Designed For Forever.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-muted-foreground"
          >
            Hallmarked 925 heirlooms, hand-finished across fourteen stages by three generations of
            South Indian silversmiths — made to be worn, gifted and inherited.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/shop"
              className="btn-luxe shine-sweep group flex h-14 items-center gap-3 rounded-full bg-primary px-9 text-primary-foreground shadow-luxe transition-colors hover:bg-silver hover:text-primary"
            >
              Shop the collection
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/collections"
              className="btn-luxe flex h-14 items-center rounded-full border border-foreground/20 px-9 transition-colors hover:border-foreground hover:bg-mist"
            >
              Editorial lookbook
            </Link>
          </motion.div>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-7">
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

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-silver-tint/70 blur-[2px]" />
          <div className="absolute -right-4 -top-6 hidden size-40 rounded-full border border-silver/70 lg:block" />
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease }}
            className="relative overflow-hidden rounded-[2rem] shadow-luxe-lg"
          >
            <motion.img
              style={{ y: imgY }}
              src={heroModel}
              alt="Model wearing hallmarked 925 sterling silver earrings and layered necklace"
              width={960}
              height={1280}
              className="aspect-4/5 w-full scale-110 object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/25 via-transparent to-transparent" />
          </motion.div>

          <div className="mt-4 grid grid-cols-3 gap-3 lg:absolute lg:-left-10 lg:bottom-10 lg:mt-0 lg:block lg:space-y-4">
            {floatingCards.map(({ title, copy, Icon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.5 + i * 0.15, ease }}
                className="glass-card animate-float-slow flex items-center gap-3 px-3 py-3 lg:max-w-[15rem] lg:px-5 lg:py-4"
                style={{ animationDelay: `${i * 1.6}s` }}
              >
                <Icon className="size-4 shrink-0 text-silver-deep" />
                <div>
                  <p className="text-[11px] font-semibold leading-tight">{title}</p>
                  <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">{copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const marqueeWords = [
  "Hallmarked 925",
  "Hand Polished",
  "Lifetime Care",
  "Made In India",
  "Insured Delivery",
];

function EditorialCollections() {
  const featured = categories.slice(0, 4);
  return (
    <section className="bg-pearl py-20 lg:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="The Collections"
            title="An edit for every occasion"
            description="Photographed in our atelier — from everyday chains to temple idols cast in solid silver."
            align="left"
          />
          <Link
            to="/collections"
            className="btn-luxe flex items-center gap-2 border-b border-foreground/30 pb-1 transition-colors hover:border-foreground"
          >
            All collections <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4 lg:grid-rows-2">
          {featured.map((c, i) => (
            <Reveal
              key={c.slug}
              delay={i * 0.07}
              className={
                i === 0
                  ? "lg:col-span-2 lg:row-span-2"
                  : i === 3
                    ? "lg:col-span-2"
                    : ""
              }
            >
              <Link
                to="/shop"
                className="shine-sweep group relative block h-full overflow-hidden rounded-[1.5rem]"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className={`w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] ${
                    i === 0 ? "aspect-4/5 lg:h-full" : "aspect-4/3 lg:h-full"
                  }`}
                />
                <div className="editorial-overlay absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground lg:p-8">
                  <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">{c.tagline}</p>
                  <h3 className={`mt-2 ${i === 0 ? "text-4xl lg:text-5xl" : "text-2xl"}`}>
                    {c.name}
                  </h3>
                  <span className="btn-luxe mt-4 inline-flex translate-y-4 items-center gap-2 rounded-full bg-background px-5 py-2.5 text-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    Discover <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const whyCards = [
  { Icon: BadgeCheck, title: "Hallmarked Silver", copy: "Every piece BIS assayed at 92.5 purity." },
  { Icon: Gem, title: "Premium Quality", copy: "Fourteen finishing stations, zero shortcuts." },
  { Icon: Headphones, title: "Lifetime Support", copy: "Free re-polish and repair, forever." },
  { Icon: ShieldCheck, title: "Secure Payments", copy: "Encrypted checkout, trusted gateways." },
  { Icon: Truck, title: "Fast Delivery", copy: "Insured dispatch within 24 hours." },
];

function Index() {
  return (
    <div>
      <Hero />

      <div className="overflow-hidden border-y border-border bg-ink py-4 text-primary-foreground">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {marqueeWords.map((w) => (
                <span
                  key={w + dup}
                  className="flex items-center gap-8 px-8 font-display text-2xl italic opacity-90 sm:text-3xl"
                >
                  {w}
                  <Sparkles className="size-3.5 text-silver" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <EditorialCollections />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Best Sellers" title="Most loved this season" align="left" />
            <Link
              to="/shop"
              className="btn-luxe flex items-center gap-2 border-b border-foreground/30 pb-1 transition-colors hover:border-foreground"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial diptych */}
      <section className="bg-mist py-20 lg:py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-warm-white" />
                <img
                  src={editorialPortrait}
                  alt="Model wearing a sterling silver leaf pendant"
                  loading="lazy"
                  width={960}
                  height={1280}
                  className="relative aspect-4/5 w-full rounded-[1.5rem] object-cover shadow-luxe"
                />
              </div>
            </Reveal>
            <div className="lg:col-span-4 lg:pl-4">
              <SectionHeading
                eyebrow="The Silver Story"
                title="Photographed, never staged."
                description="Our campaigns are shot on real patrons in natural light — because silver should be judged the way it will be worn."
                align="left"
              />
              <div className="mt-8 space-y-5">
                {[
                  ["01", "Design & wax carving", "Sketched in-house, carved by master hands."],
                  ["02", "Casting in 925 silver", "Certified grain, zero recycled fillers."],
                  ["03", "Hand polish & hallmark", "Mirror lustre, BIS assayed and stamped."],
                ].map(([n, t, c], i) => (
                  <Reveal key={n} delay={i * 0.1} className="flex gap-5 border-t border-border pt-5">
                    <span className="font-price text-lg text-silver-deep">{n}</span>
                    <div>
                      <p className="text-lg">{t}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.15} className="lg:col-span-3">
              <div className="space-y-5">
                <img
                  src={editorialHands}
                  alt="Silver bangle and stacked rings on a model's hands"
                  loading="lazy"
                  width={1408}
                  height={1008}
                  className="aspect-3/4 w-full rounded-[1.5rem] object-cover shadow-soft lg:translate-y-8"
                />
                <div className="glass-card p-6 lg:translate-y-8">
                  <p className="font-price text-4xl">14</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Finishing stations per piece
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-silver-tint/60 py-20 lg:py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <SectionHeading
            eyebrow="Why Dhanalaxmi"
            title="The quiet luxury standard"
            description="Five promises that accompany every keepsake box."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {whyCards.map(({ Icon, title, copy }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="luxe-card luxe-card-hover h-full bg-background p-7">
                  <span className="flex size-12 items-center justify-center rounded-full bg-silver-tint">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-6 text-xl">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="New Arrivals" title="Fresh from the atelier" align="left" />
            <Link
              to="/shop"
              className="btn-luxe flex items-center gap-2 border-b border-foreground/30 pb-1 transition-colors hover:border-foreground"
            >
              Shop new <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(4, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-pearl py-20 lg:py-28">
        <div className="silver-halo pointer-events-none absolute -left-20 top-20 size-[26rem] opacity-60" />
        <div className="relative mx-auto max-w-[88rem] px-6 lg:px-10">
          <SectionHeading eyebrow="Patron Stories" title="Words from our clients" />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
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
                <figure className="glass-card relative h-full overflow-hidden p-9">
                  <Quote className="absolute -right-2 -top-4 size-24 text-silver/40" />
                  <div className="relative flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-3.5 fill-current text-foreground" />
                    ))}
                  </div>
                  <blockquote className="relative mt-6 font-display text-xl leading-relaxed">
                    {quote}
                  </blockquote>
                  <figcaption className="relative mt-8 flex items-center gap-3 border-t border-border pt-6">
                    <span className="flex size-10 items-center justify-center rounded-full bg-silver-tint font-price text-base">
                      {name!.charAt(0)}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {name} · {city}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 pb-10 lg:px-10">
        <Reveal className="grid overflow-hidden rounded-[1.75rem] bg-ink text-primary-foreground lg:grid-cols-2">
          <div className="relative min-h-[18rem]">
            <img
              src={craftImage}
              alt="Silversmith setting a stone into a silver pendant"
              loading="lazy"
              width={1400}
              height={1000}
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <div className="p-10 lg:p-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-silver">The Silver Letter</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              Private previews, <span className="italic">first.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-70">
              Join our list for numbered drops, atelier stories and concierge appointments for
              weddings and temple commissions.
            </p>
            <form
              className="mt-9 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Email address"
                className="h-13 w-full rounded-full border border-primary-foreground/25 bg-transparent px-6 text-sm outline-none transition-colors placeholder:text-primary-foreground/50 focus:border-silver"
              />
              <button className="btn-luxe shine-sweep flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-background px-8 text-foreground transition-colors hover:bg-silver">
                Join <ArrowRight className="size-4" />
              </button>
            </form>
            <Link
              to="/contact"
              className="btn-luxe mt-8 inline-flex items-center gap-2 border-b border-primary-foreground/30 pb-1 transition-colors hover:border-silver"
            >
              Book a consultation <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
