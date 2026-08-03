import { createFileRoute } from "@tanstack/react-router";
import craftImage from "@/assets/craft.jpg";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Legacy — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Three generations of South Indian silversmiths crafting hallmarked 925 sterling silver heirlooms since 1978.",
      },
      { property: "og:title", content: "Our Legacy — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "The story, craft and standards behind Dhanalaxmi Jeweler's silver.",
      },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  ["Mission", "Make certified sterling silver the most trusted everyday luxury in India."],
  ["Vision", "A silver heirloom in every Indian home, made ethically and priced honestly."],
  ["Promise", "Transparent weights, hallmarked purity, lifetime polish and repair."],
];

function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
        <SectionHeading
          eyebrow="Since 1978"
          title="A family of silversmiths"
          description="What began as a single workbench in Coimbatore is now an atelier of forty-two artisans — still guided by the same rule our grandfather set: never compromise the purity, never rush the polish."
          align="left"
        />
        <Reveal delay={0.1} className="mt-16 overflow-hidden rounded-[1.25rem]">
          <img
            src={craftImage}
            alt="Artisan hand-setting a stone into silver jewelry"
            loading="lazy"
            width={1400}
            height={1000}
            className="w-full object-cover"
          />
        </Reveal>
      </section>

      <section className="border-y border-border bg-secondary py-24">
        <div className="mx-auto grid max-w-[88rem] gap-8 px-6 lg:grid-cols-3 lg:px-10">
          {pillars.map(([title, copy], i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="luxe-card luxe-card-hover h-full bg-background p-9">
                <p className="text-eyebrow">{title}</p>
                <p className="mt-5 text-xl leading-relaxed">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
        <SectionHeading eyebrow="The Process" title="From wax to keepsake box" />
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Design", "In-house sketches informed by temple architecture."],
            ["Casting", "Certified 925 grain, no recycled fillers."],
            ["Finishing", "Hand filing, tumbling and rhodium sealing."],
            ["Assay", "BIS hallmark, weight card and lifetime warranty."],
          ].map(([t, c], i) => (
            <Reveal key={t} delay={i * 0.08} className="border-t border-border pt-6">
              <p className="font-price text-xl text-silver-deep">0{i + 1}</p>
              <p className="mt-3 text-lg">{t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}