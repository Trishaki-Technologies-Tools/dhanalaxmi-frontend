import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
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
import heroCinematic from "@/assets/hero-cinematic.jpg";
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

const heroProofs = [
  { title: "925 Hallmarked", copy: "BIS assayed purity", Icon: BadgeCheck },
  { title: "Insured Shipping", copy: "Free, pan-India", Icon: Truck },
  { title: "Since 1978", copy: "Three generations", Icon: Gem },
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const glow = useTransform(scrollYProgress, [0, 1], [0.85, 0.2]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });

  return (
    <section
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative isolate overflow-hidden bg-ink text-primary-foreground"
    >
      {/* hairline grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        {[18, 38, 62, 82].map((l) => (
          <span key={l} className="absolute inset-y-0 w-px bg-silver" style={{ left: `${l}%` }} />
        ))}
      </div>
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute left-1/2 top-[-18%] size-[46rem] -translate-x-1/2 rounded-full bg-silver/20 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[92rem] px-6 pb-0 pt-12 lg:px-10 lg:pt-16">
        {/* top rail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease }}
          className="flex items-center justify-between border-b border-primary-foreground/15 pb-5 text-[10px] uppercase tracking-[0.32em] text-primary-foreground/60"
        >
          <span>Est. 1978 · Sterling Atelier</span>
          <span className="hidden sm:block">Vol. XI — The Silver Edit</span>
          <span className="flex items-center gap-2">
            <Sparkles className="size-3 text-silver" /> 92.5 Pure
          </span>
        </motion.div>

        {/* stacked editorial title over portrait */}
        <div className="relative pt-10 lg:pt-14">
          <motion.h1
            style={{ y: wordY }}
            className="pointer-events-none relative z-20 text-center font-display leading-[0.82] tracking-[-0.02em]"
          >
            {["Crafted", "In Silver"].map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 0.1 + i * 0.12, ease }}
                className={`block text-[19vw] lg:text-[13.5vw] ${
                  i === 1 ? "italic text-silver" : ""
                }`}
              >
                {w}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.6, delay: 0.35, ease }}
            style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }}
            className="relative z-10 mx-auto -mt-[9vw] w-[72%] overflow-hidden rounded-t-[999px] sm:w-[52%] lg:-mt-[7vw] lg:w-[34%]"
          >
            <motion.img
              style={{ y: imgY }}
              src={heroCinematic}
              alt="Model wearing layered hallmarked 925 sterling silver necklaces and sculptural earrings"
              width={1024}
              height={1408}
              className="aspect-3/4 w-full scale-110 object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/10 to-transparent" />
          </motion.div>

          {/* side copy */}
          <div className="relative z-20 -mt-[12vw] grid gap-10 pb-14 lg:-mt-[9vw] lg:grid-cols-3 lg:items-end lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease }}
              className="max-w-xs"
            >
              <p className="font-display text-3xl italic leading-tight text-silver">
                Designed for forever.
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-primary-foreground/65">
                Hallmarked 925 heirlooms, hand-finished across fourteen stages by three generations
                of South Indian silversmiths.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/shop"
                className="btn-luxe shine-sweep group flex h-14 items-center gap-3 rounded-full bg-background px-9 text-foreground transition-transform hover:-translate-y-0.5"
              >
                Shop the collection
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/collections"
                className="btn-luxe flex h-14 items-center rounded-full border border-primary-foreground/30 px-8 transition-colors hover:border-silver hover:text-silver"
              >
                Lookbook
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9, ease }}
              className="space-y-3 lg:ml-auto lg:w-[17rem]"
            >
              {heroProofs.map(({ title, copy, Icon }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 border-b border-primary-foreground/15 pb-3"
                >
                  <Icon className="size-4 shrink-0 text-silver" />
                  <p className="text-[11px] uppercase tracking-[0.18em]">{title}</p>
                  <p className="ml-auto text-[11px] text-primary-foreground/50">{copy}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* stat plinth */}
      <div className="relative border-t border-primary-foreground/15">
        <div className="mx-auto grid max-w-[92rem] grid-cols-3 divide-x divide-primary-foreground/15 px-6 lg:px-10">
          {[
            ["47", "Years of craft"],
            ["92.5", "Purity, always"],
            ["1.2L+", "Happy patrons"],
          ].map(([v, l], i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1 + i * 0.1, ease }}
              className="px-4 py-6 text-center first:pl-0 last:pr-0"
            >
              <p className="font-price text-3xl text-silver sm:text-4xl">{v}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-primary-foreground/50">
                {l}
              </p>
            </motion.div>
          ))}
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

      <div className="overflow-hidden border-b border-border bg-warm-white py-4 text-foreground">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {marqueeWords.map((w) => (
                <span
                  key={w + dup}
                  className="flex items-center gap-8 px-8 font-display text-2xl italic text-silver-deep sm:text-3xl"
                >
                  {w}
                  <Sparkles className="size-3.5 text-silver-deep/60" />
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
