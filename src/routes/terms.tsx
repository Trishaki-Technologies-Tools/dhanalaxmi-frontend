import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, Sparkles, Scale, RefreshCw, PhoneCall, CheckCircle } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Terms and conditions for purchasing BIS hallmarked 925 sterling silver jewelry from Shree Dhanlaxmi Jewellers.",
      },
      { property: "og:title", content: "Terms of Service — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Our customer charter, purity guarantees, shipping policies, and service terms.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    icon: ShieldCheck,
    title: "1. BIS 925 Hallmarking & Silver Purity Guarantee",
    content:
      "Every piece of jewelry crafted and sold by Shree Dhanlaxmi Jewellers is guaranteed 92.5% sterling silver purity, carrying the mandatory Bureau of Indian Standards (BIS) hallmark and maker's stamp. Each order is accompanied by a certificate of authenticity and a transparent itemized tax invoice stating exact gross and net silver weight.",
  },
  {
    icon: Sparkles,
    title: "2. Lifetime Complimentary Polish & Care",
    content:
      "Silver naturally undergoes oxidation when exposed to air and moisture. We provide lifetime complimentary professional sonic cleaning and hand polishing for all original Dhanalaxmi Jewellers creations. Customers may bring their pieces to our Belagavi boutique or courier them to our service atelier (courier transit charges apply).",
  },
  {
    icon: Truck,
    title: "3. Fully Insured Pan-India Transit",
    content:
      "All online orders are dispatched in tamper-evident, sealed tamper-proof security packaging with comprehensive door-to-door transit insurance. Once dispatched, tracking details are sent via SMS. In the rare event of transit damage or package loss, Shree Dhanlaxmi Jewellers will provide an expedited replacement or a 100% full refund.",
  },
  {
    icon: RefreshCw,
    title: "4. 7-Day Easy Exchange Policy",
    content:
      "We offer a 7-day exchange window from the date of delivery for unworn, unaltered items in their original condition with security tags and authentication certificates intact. Custom engravings, personalized nameplates, and made-to-order bespoke articles are final sale.",
  },
  {
    icon: Scale,
    title: "5. Transparent Daily Silver Pricing",
    content:
      "All product prices reflect live prevailing silver bullion rates combined with artisan making charges and applicable GST. Prices are locked at the exact moment of order placement and will not fluctuate retroactively.",
  },
  {
    icon: PhoneCall,
    title: "6. Mobile OTP Authentication & Account Integrity",
    content:
      "To safeguard customer security and prevent unauthorized access, accounts are tied to your verified mobile number via SMS OTP. Customers are responsible for safeguarding device access. We will never ask for your banking passwords or OTP over phone calls or messages.",
  },
];

function TermsPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <SectionHeading
          eyebrow="Legal & Customer Charter"
          title="Terms of Service"
          description="Clear, transparent terms grounded in four decades of trusted silversmithing and hallmarked craftsmanship."
          align="left"
        />

        <div className="mt-6 text-xs text-muted-foreground">
          <span>Last revised: September 2026</span> · <span>Applicable to all online & showroom orders</span>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {sections.map(({ icon: Icon, title, content }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <div className="luxe-card h-full bg-card/60 p-7 sm:p-9 border border-border/70 hover:border-maroon/30 transition-all rounded-2xl shadow-sm">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F6D7B0]/60 text-maroon">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground leading-snug">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Contact & Boutique Details Banner */}
        <Reveal delay={0.4} className="mt-16">
          <div className="rounded-3xl border border-maroon/25 bg-[#F6D7B0]/30 p-8 sm:p-12 text-foreground">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-maroon">
                Showroom & Concierge
              </span>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                Have questions about our terms or custom orders?
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Visit our showroom at Shree Dhanlaxmi Jewellers, Kirloskar Road, Belagavi, Karnataka 590001,
                or reach our personal jewelry concierge at <strong className="text-foreground">+91 99026 86326</strong>.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-maroon-deep transition-colors"
                >
                  Contact Concierge
                </Link>
                <Link
                  to="/shop"
                  className="rounded-full border border-maroon/40 bg-background/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-maroon hover:bg-maroon hover:text-white transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
