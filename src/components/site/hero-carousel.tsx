import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroCinematic from "@/assets/hero-cinematic.jpg";
import heroEarrings from "@/assets/hero-earrings.jpg";
import heroModel from "@/assets/hero-model.jpg";

type Slide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string[];
  copy: string;
  cta: string;
  align: "left" | "right";
};

const slides: Slide[] = [
  {
    image: heroEarrings,
    alt: "Woman wearing an intricate hallmarked 925 sterling silver chandelier earring",
    eyebrow: "Earring Edit",
    title: ["Light That", "Moves With You"],
    copy: "Our bestselling sterling silver earrings — filigree studs, jhumkas and drops, hallmarked at 92.5 purity.",
    cta: "Shop Earrings",
    align: "left",
  },
  {
    image: heroCinematic,
    alt: "Model wearing layered sterling silver necklaces",
    eyebrow: "The Silver Edit",
    title: ["Crafted In Silver.", "Designed Forever."],
    copy: "Hand-finished heirlooms across fourteen stations, assayed at 92.5 purity",
    cta: "Explore Collection",
    align: "left",
  },
  {
    image: heroModel,
    alt: "Portrait of a model wearing silver earrings and pendant",
    eyebrow: "Festive Season",
    title: ["Timeless Pieces,", "Everyday Luxury"],
    copy: "Free insured shipping, lifetime polish and certified hallmark on every order",
    cta: "Shop The Edit",
    align: "left",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(id);
  }, [go]);

  const slide = slides[index]!;

  return (
    <section className="relative isolate h-[70vh] min-h-[26rem] w-full overflow-hidden bg-mist sm:h-[78vh]">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="size-full object-cover"
            width={1600}
            height={1000}
          />
          <div
            className={`absolute inset-0 ${
              slide.align === "left"
                ? "bg-linear-to-r from-background/95 via-background/60 to-transparent"
                : "bg-linear-to-l from-background/95 via-background/60 to-transparent"
            }`}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex h-full max-w-[92rem] items-center px-6 lg:px-12">
        <div
          className={`max-w-xl ${slide.align === "right" ? "ml-auto text-right" : ""}`}
          key={`copy-${index}`}
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground"
          >
            {slide.eyebrow}
          </motion.p>
          <h1 className="mt-5 text-4xl font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {slide.title.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
            className="mt-5 text-base text-muted-foreground"
          >
            {slide.copy}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
            className="mt-9"
          >
            <Link
              to="/shop"
              className="btn-luxe shine-sweep inline-flex h-12 items-center border border-foreground px-9 text-sm uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-primary-foreground"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-foreground/60 transition-colors hover:text-foreground lg:left-5"
      >
        <ChevronLeft className="size-8" strokeWidth={1} />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-foreground/60 transition-colors hover:text-foreground lg:right-5"
      >
        <ChevronRight className="size-8" strokeWidth={1} />
      </button>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.eyebrow}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`size-2 rounded-full transition-all ${
              i === index ? "w-6 bg-foreground" : "bg-foreground/30 hover:bg-foreground/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}