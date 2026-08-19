import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalog } from "@/lib/catalog-store";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroCarousel() {
  const { banners } = useCatalog();
  const slides = banners.filter((b) => b.active);
  const [index, setIndex] = useState(0);
  const go = useCallback((dir: number) => {
    setIndex((i) => (slides.length ? (i + dir + slides.length) % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(id);
  }, [go, slides.length]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

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
            className="absolute inset-0 bg-linear-to-r from-background/95 via-background/60 to-transparent"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex h-full max-w-[92rem] items-center px-6 lg:px-12">
        <div className="max-w-xl" key={`copy-${index}`}>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground"
          >
            {slide.eyebrow}
          </motion.p>
          <h1 className="mt-5 text-4xl font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {[slide.titleTop, slide.titleBottom].filter(Boolean).map((line, i) => (
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
              search={slide.category ? { category: slide.category } : {}}
              className="btn-luxe shine-sweep inline-flex h-12 items-center border border-maroon px-9 text-sm uppercase tracking-[0.18em] text-maroon transition-colors hover:bg-maroon hover:text-primary-foreground"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </div>
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-foreground/60 transition-colors hover:text-maroon lg:left-5"
      >
        <ChevronLeft className="size-8" strokeWidth={1} />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-foreground/60 transition-colors hover:text-maroon lg:right-5"
      >
        <ChevronRight className="size-8" strokeWidth={1} />
      </button>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`size-2 rounded-full transition-all ${
              i === index ? "w-6 bg-maroon" : "bg-foreground/30 hover:bg-maroon/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}