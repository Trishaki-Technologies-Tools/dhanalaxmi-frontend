import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/reveal";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Boutique — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Visit our Coimbatore boutique or reach our silver concierge by phone, WhatsApp or email for commissions and gifting.",
      },
      { property: "og:title", content: "Contact & Boutique — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Boutique address, hours and concierge contacts.",
      },
    ],
  }),
  component: ContactPage,
});

const details = [
  { Icon: MapPin, title: "Boutique", copy: "18 Raja Street, RS Puram, Coimbatore 641002" },
  { Icon: Phone, title: "Phone", copy: "+91 98765 43210" },
  { Icon: Mail, title: "Email", copy: "care@dhanalaxmijewelers.in" },
  { Icon: Clock, title: "Hours", copy: "Mon–Sat · 10:00 to 20:00 IST" },
];

function ContactPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
      <SectionHeading
        eyebrow="Contact"
        title="Speak with our silver concierge"
        description="Commissions, engraving, bulk gifting or a simple sizing question — we answer within one business day."
        align="left"
      />

      <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <form
            className="luxe-card space-y-6 p-8 sm:p-12"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thank you — our concierge will reply within one business day.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            {[
              { label: "Full name", type: "text", name: "name" },
              { label: "Email", type: "email", name: "email" },
              { label: "Phone", type: "tel", name: "phone" },
            ].map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="text-eyebrow">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  required
                  className="mt-3 h-12 w-full rounded-full border border-border bg-secondary px-5 text-sm outline-none transition-colors focus:border-foreground"
                />
              </div>
            ))}
            <div>
              <label htmlFor="message" className="text-eyebrow">
                How can we help?
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-3 w-full rounded-[1.25rem] border border-border bg-secondary p-5 text-sm outline-none transition-colors focus:border-foreground"
              />
            </div>
            <button className="h-13 w-full rounded-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-silver hover:text-primary">
              Send enquiry
            </button>
          </form>
        </Reveal>

        <div className="space-y-6">
          {details.map(({ Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="luxe-card luxe-card-hover flex items-start gap-5 p-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-eyebrow">{title}</p>
                  <p className="mt-2 text-lg">{copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.3}>
            <a
              href="https://wa.me/919876543210"
              className="flex items-center justify-center gap-3 rounded-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-silver hover:text-primary"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.36} className="overflow-hidden rounded-[1.25rem] border border-border">
            <iframe
              title="Boutique location map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=76.94%2C10.98%2C77.02%2C11.03&layer=mapnik"
              className="h-72 w-full"
              loading="lazy"
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}