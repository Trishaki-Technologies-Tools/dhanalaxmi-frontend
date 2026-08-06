import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

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
    title: "Account",
    links: ["Sign In", "Create Account", "My Wishlist", "Order History"],
  },
  {
    title: "Policies",
    links: ["Privacy Policy", "Refund Policy", "Shipping Policy", "Terms & Conditions", "FAQs"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-primary-foreground">
      <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="font-display text-4xl">Dhanalaxmi Jeweler&apos;s</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.42em] text-silver">
              Sterling silver since 1978
            </p>
            <p className="mt-6 text-sm leading-relaxed opacity-65">
              Three generations of silversmiths crafting hallmarked 925 heirlooms — polished by
              hand, certified for life, delivered in signature keepsake boxes.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-10 items-center justify-center rounded-full border border-primary-foreground/20 transition-colors hover:border-silver hover:bg-silver hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="btn-luxe text-silver">{col.title}</p>
              <ul className="mt-6 space-y-3.5 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to={col.title === "Account" && l === "Sign In" ? "/login" : col.title === "Account" && l === "Create Account" ? "/signup" : "/shop"}
                      className="opacity-65 transition-opacity hover:opacity-100"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 hairline opacity-40" />

        <div className="mt-10 flex flex-col gap-3 text-xs opacity-60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Dhanalaxmi Jeweler&apos;s. All rights reserved.</p>
          <p>BIS Hallmarked · Insured Shipping · Secure Payments</p>
        </div>
      </div>
    </footer>
  );
}
