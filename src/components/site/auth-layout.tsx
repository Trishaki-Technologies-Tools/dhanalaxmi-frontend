import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import editorialPortrait from "@/assets/editorial-portrait.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[88rem] lg:grid-cols-2">
        {/* Editorial image side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease }}
          className="relative hidden overflow-hidden lg:block"
        >
          <img
            src={editorialPortrait}
            alt="Model wearing Dhanalaxmi sterling silver jewelry"
            className="absolute inset-0 size-full object-cover"
            width={960}
            height={1280}
          />
          <div className="absolute inset-0 bg-linear-to-t from-maroon-deep/90 via-maroon-deep/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-silver">Dhanalaxmi Jeweler&apos;s</p>
              <p className="mt-4 max-w-sm font-display text-4xl leading-tight">
                Sterling silver, certified for life.
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">
                Every piece is BIS hallmarked, hand-polished across fourteen stations, and delivered in a signature keepsake box.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Form side */}
        <div className="relative flex flex-col justify-center bg-warm-white px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
          {/* Subtle silver halo decoration */}
          <div className="silver-halo pointer-events-none absolute -right-40 top-20 size-[28rem] opacity-40" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="relative mx-auto w-full max-w-md"
          >
            <Link
              to="/"
              className="mb-10 inline-flex flex-col leading-none"
            >
              <span className="font-display text-2xl tracking-[0.02em]">Dhanalaxmi</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.42em] text-muted-foreground">
                Jeweler&apos;s · 925
              </span>
            </Link>

            <div className="space-y-2">
              <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>

            <div className="mt-10">{children}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
