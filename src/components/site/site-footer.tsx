import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import logo from "@/assets/image.png";

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
    <footer className="mt-24 border-t border-maroon/15 bg-[#F6D7B0] text-maroon">
      <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-8 xl:gap-12">
          <div className="max-w-sm sm:col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Dhanalaxmi Logo" className="h-12 w-auto object-contain" />
              <div className="flex flex-col items-center leading-none pt-1">
                <span className="font-['Cinzel',_serif] text-2xl font-bold tracking-[0.05em] text-maroon">
                  DHANALAXMI
                </span>
                <span className="mt-1 font-['Cinzel',_serif] text-[10px] font-semibold tracking-[0.42em] text-maroon/80">
                  JEWELLERS
                </span>
              </div>
            </div>
            <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.42em] text-maroon/75">
              Sterling silver since 1978
            </p>
            <p className="mt-6 text-sm leading-relaxed text-maroon/80">
              Three generations of silversmiths crafting hallmarked 925 heirlooms — polished by
              hand, certified for life, delivered in signature keepsake boxes.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Facebook, Youtube, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-10 items-center justify-center rounded-full border border-maroon/25 text-maroon transition-colors hover:border-maroon hover:bg-maroon hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-maroon">{col.title}</p>
              <ul className="mt-6 space-y-3.5 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to={
                        l === "Sign In"
                          ? "/login"
                          : l === "Create Account"
                            ? "/signup"
                            : l === "Order Tracking"
                              ? "/track"
                              : l === "Order History"
                                ? "/orders"
                                : l === "My Profile"
                                  ? "/account"
                                  : l === "My Wishlist"
                                    ? "/wishlist"
                                    : l === "Privacy Policy"
                                      ? "/privacy"
                                      : l === "Terms & Conditions" || l === "Refund Policy" || l === "Shipping Policy"
                                        ? "/terms"
                                        : "/shop"
                      }
                      className="text-maroon/75 transition-colors hover:text-maroon hover:font-medium"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 h-px w-full bg-maroon/15" />

        <div className="mt-10 flex flex-col gap-3 text-xs text-maroon/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dhanalaxmi Jeweler&apos;s. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-maroon hover:underline">
              Terms of Service
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-maroon hover:underline">
              Privacy Policy
            </Link>
            <span>·</span>
            <span>BIS Hallmarked · Insured Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
