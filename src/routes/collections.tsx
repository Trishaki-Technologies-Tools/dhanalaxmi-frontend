import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/catalog";
import { Reveal, SectionHeading } from "@/components/site/reveal";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Silver Collections — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Explore curated 925 silver collections: rings, chains, anklets, pendants, temple idols, wedding and gifting edits.",
      },
      { property: "og:title", content: "Silver Collections — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Ten curated edits of hallmarked sterling silver jewelry.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
      <SectionHeading
        eyebrow="Collections"
        title="Ten edits, one standard of purity"
        description="Each collection is designed as a family — shared motifs, shared finish, endlessly stackable."
      />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 0.07}>
            <Link
              to="/shop"
              className="luxe-card luxe-card-hover group block overflow-hidden bg-secondary"
            >
              <div className="overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className="aspect-square w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
              </div>
              <div className="flex items-center justify-between p-7">
                <div>
                  <h2 className="text-2xl">{c.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {c.tagline}
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-maroon" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}