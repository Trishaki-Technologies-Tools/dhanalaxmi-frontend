import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Smartphone, ShieldCheck, EyeOff, Database, FileText } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Privacy Policy of Shree Dhanlaxmi Jewellers — how we safeguard your personal details, mobile OTP authentication, and transaction privacy.",
      },
      { property: "og:title", content: "Privacy Policy — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Our zero-spam pledge, secure encryption, and customer data privacy charter.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPage,
});

const privacyPoints = [
  {
    icon: Smartphone,
    title: "1. Information We Collect & Why",
    content:
      "We collect only what is strictly necessary to fulfill your orders and keep you securely authenticated: your Full Name, Mobile Number (for instant SMS OTP sign-in and delivery notifications), and Shipping Address (for insured courier delivery). We never collect unnecessary personal data or sell browsing data.",
  },
  {
    icon: Lock,
    title: "2. Zero Password Storage & SMS OTP Security",
    content:
      "To protect you against password leaks and credential stuffing attacks, Dhanalaxmi Jewellers utilizes passwordless 6-digit SMS OTP verification powered by MSG91 telecom gateways. Verification codes expire in 10 minutes and can only be used once.",
  },
  {
    icon: ShieldCheck,
    title: "3. 100% Encrypted & Safe Payment Handling",
    content:
      "We never store your credit/debit card numbers, CVVs, UPI PINs, or net banking passwords. All online payments are securely routed directly through RBI-authorized, PCI-DSS Level 1 compliant payment gateways via 256-bit SSL encryption.",
  },
  {
    icon: EyeOff,
    title: "4. No-Spam Pledge & Data Sharing Policy",
    content:
      "Your phone number and private details will NEVER be sold, rented, or shared with third-party advertising brokers. SMS messages sent to you are strictly transactional: verification OTPs, order confirmations, and dispatch tracking links.",
  },
  {
    icon: Database,
    title: "5. Persistent Secure Login & Device Sessions",
    content:
      "For your convenience, your trusted browser stores a secure cryptographic access token in local storage so you remain signed in across browser restarts without having to re-authenticate every visit. You can terminate your session anytime by clicking 'Sign Out'.",
  },
  {
    icon: FileText,
    title: "6. Your Rights & Data Deletion",
    content:
      "You have full ownership of your data. You may update your profile name, shipping addresses, and saved wishlists directly in your account dashboard. You can also request complete account and data removal by contacting our privacy officer.",
  },
];

function PrivacyPage() {
  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <SectionHeading
          eyebrow="Trust & Security"
          title="Privacy Policy"
          description="We honor your privacy as fiercely as we protect the hallmarked purity of our silver."
          align="left"
        />

        <div className="mt-6 text-xs text-muted-foreground">
          <span>Effective Date: September 2026</span> · <span>Committed to Indian Digital Personal Data Protection (DPDP) Standards</span>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {privacyPoints.map(({ icon: Icon, title, content }, index) => (
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

        {/* Reassurance Banner */}
        <Reveal delay={0.4} className="mt-16">
          <div className="rounded-3xl border border-maroon/25 bg-[#F6D7B0]/30 p-8 sm:p-12 text-foreground">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-maroon">
                Privacy Assurance
              </span>
              <h3 className="mt-2 font-display text-2xl font-semibold">
                Your confidence is our sacred heirloom
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                If you have any questions or requests regarding your personal data, reach out directly to
                our compliance team at <strong className="text-foreground">privacy@dhanalaxmijewellers.com</strong> or call our boutique at <strong className="text-foreground">+91 99026 86326</strong>.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/terms"
                  className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-maroon-deep transition-colors"
                >
                  Read Terms of Service
                </Link>
                <Link
                  to="/shop"
                  className="rounded-full border border-maroon/40 bg-background/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-maroon hover:bg-maroon hover:text-white transition-colors"
                >
                  Return to Boutique
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
