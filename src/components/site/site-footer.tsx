import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, MessageCircle, ArrowRight } from "lucide-react";

const columns = [
  {
    title: "Collections",
    links: ["Silver Rings", "Silver Chains", "Bracelets & Anklets", "Pendants", "Silver Idols"],
  },
  {
    title: "Quick Links",
    links: ["New Arrivals", "Best Sellers", "Gift Cards", "Order Tracking", "Compare Products"],
  },
  {
    title: "Policies",
    links: ["Privacy Policy", "Refund Policy", "Shipping Policy", "Terms & Conditions", "FAQs"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-secondary">
      <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="font-display text-3xl">Dhanalaxmi Jeweler&apos;s</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.42em] text-muted-foreground">
              Sterling silver since 1978
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Three generations of silversmiths crafting hallmarked 925 heirlooms — polished by
              hand, certified for life, delivered in signature keepsake boxes.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-silver"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-eyebrow">{col.title}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to="/shop"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[1.25rem] border border-border bg-background p-8 sm:p-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">The Silver Letter</p>
              <h3 className="mt-3 text-3xl">Private previews, first.</h3>
            </div>
            <form
              className="flex w-full max-w-md items-center gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Email address"
                className="h-12 w-full rounded-full border border-border bg-secondary px-5 text-sm outline-none transition-colors focus:border-foreground"
              />
              <button className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-silver hover:text-primary">
                Join <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Dhanalaxmi Jeweler&apos;s. All rights reserved.</p>
          <p>BIS Hallmarked · Insured Shipping · Secure Payments</p>
        </div>
      </div>
    </footer>
  );
}