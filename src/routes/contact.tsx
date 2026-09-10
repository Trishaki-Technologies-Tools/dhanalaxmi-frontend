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
                  className="mt-3 h-12 w-full rounded-full border border-border bg-secondary px-5 text-sm outline-none transition-colors focus:border-maroon"
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
                className="mt-3 w-full rounded-[1.25rem] border border-border bg-secondary p-5 text-sm outline-none transition-colors focus:border-maroon"
              />
            </div>
            <button className="w-full rounded-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50">
              Send enquiry
            </button>
          </form>
        </Reveal>

        <div className="space-y-6">
          {details.map(({ Icon, title, copy }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="luxe-card luxe-card-hover flex items-start gap-5 p-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-maroon/20 bg-maroon-soft">
                  <Icon className="size-4 text-maroon" />
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
              className="flex items-center justify-center gap-3 rounded-full bg-primary py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.36} className="overflow-hidden rounded-[1.25rem] border border-border">
            <iframe
              title="Shree Dhanlaxmi Jewellers location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.655227820347!2d74.50052971085691!3d15.822123245942123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf672b4044fdf5%3A0x2349dc2fddca62dd!2sShree%20Dhanlaxmi%20Jewellers!5e0!3m2!1sen!2sin!4v1789024804029!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-80 w-full"
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}