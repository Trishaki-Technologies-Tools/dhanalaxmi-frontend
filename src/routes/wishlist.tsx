import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2, PackageOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/site/product-card";
import { useCatalog } from "@/lib/catalog-store";
import { Reveal } from "@/components/site/reveal";
import { motion } from "framer-motion";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Dhanalaxmi Jeweler's" },
      { name: "description", content: "View your saved luxury silver pieces." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const { items } = useWishlist();
  const { products } = useCatalog();

  if (!hydrated) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-maroon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center lg:px-10">
        <Heart className="mx-auto size-6 text-maroon" />
        <h1 className="mt-4 font-display text-4xl">Sign in to view your wishlist</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Keep track of your favorite pieces and save them for later.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const savedProducts = products.filter((p) => p.id && items.includes(p.id));

  return (
    <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
      <div className="flex flex-col items-center text-center">
        <p className="text-eyebrow text-maroon">Favorites</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">My Wishlist</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {savedProducts.length} item{savedProducts.length !== 1 ? "s" : ""} saved.
        </p>
      </div>

      {savedProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-secondary p-12 text-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-background text-muted-foreground shadow-soft">
            <PackageOpen className="size-6" />
          </span>
          <p className="mt-6 text-lg font-medium">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart icon on any product to save it here.
          </p>
          <Link
            to="/shop"
            className="mt-8 rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Explore collections
          </Link>
        </motion.div>
      ) : (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {savedProducts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
