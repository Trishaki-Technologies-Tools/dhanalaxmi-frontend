import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export function CartDrawer() {
  const { open, setOpen, items, count, subtotal, savings, setQty, remove, clear } = useCart();
  const { toggle } = useWishlist();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-foreground/45 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Shopping bag"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[26rem] flex-col bg-background shadow-luxe"
          >
            <header className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-eyebrow text-maroon">Your bag</p>
                <p className="font-display text-2xl">{count} item{count === 1 ? "" : "s"}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close bag"
                className="flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-maroon-soft hover:text-maroon"
              >
                <X className="size-4" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-maroon">
                  <ShoppingBag className="size-6" />
                </span>
                <p className="text-sm text-muted-foreground">
                  Your bag is empty. Explore hallmarked 925 silver crafted for everyday luxury.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-primary px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {items.map(({ product, qty, lineTotal }) => (
                    <div key={product.slug} className="flex gap-4">
                      <Link
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        onClick={() => setOpen(false)}
                        className="shrink-0 overflow-hidden rounded-lg border border-border bg-pearl"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-20 object-cover"
                          />
                        ) : (
                          <div className="size-20 flex items-center justify-center bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground border border-dashed border-border/50">
                            {product.name.slice(0, 2)}
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-[8px] uppercase tracking-[0.2em] text-maroon">
                          {product.categoryLabel}
                        </p>
                        <p className="line-clamp-1 text-sm">{product.name}</p>
                        <p className="font-price text-sm">{formatINR(lineTotal)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center rounded-full border border-border">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => setQty(product.slug, qty - 1)}
                              className="flex size-7 items-center justify-center rounded-full transition-colors hover:text-maroon"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-6 text-center text-xs">{qty}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => setQty(product.slug, qty + 1)}
                              className="flex size-7 items-center justify-center rounded-full transition-colors hover:text-maroon"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <button
                            aria-label={`Remove ${product.name}`}
                            onClick={() => {
                              remove(product.slug);
                              toast(`${product.name} removed from bag.`, {
                                action: {
                                  label: "Save to Wishlist",
                                  onClick: () => {
                                    if (product.id) toggle(product.id, product.name);
                                  },
                                },
                                duration: 5000,
                              });
                            }}
                            className="text-muted-foreground transition-colors hover:text-maroon"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <footer className="border-t border-border px-6 py-6">
                  <div className="space-y-2 border-b border-border/50 pb-3 mb-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Total Weight
                      </span>
                      <span className="text-sm font-medium">
                        {items.reduce((acc, { product, qty }) => acc + (product.weight || 0) * qty, 0).toFixed(2)}g
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Making Charges
                      </span>
                      <span className="text-sm font-medium">
                        {formatINR(items.reduce((acc, { product, qty }) => acc + (product.makingCharges || 0) * (product.weight || 0) * qty, 0))}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        GST (5%)
                      </span>
                      <span className="text-sm font-medium">
                        {formatINR(subtotal - (subtotal / 1.05))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Total
                    </span>
                    <span className="font-price text-2xl">{formatINR(subtotal)}</span>
                  </div>
                  {savings > 0 ? (
                    <p className="mt-1 text-[11px] text-maroon">
                      You save {formatINR(savings)} on this order
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Free insured shipping · Inclusive of all taxes
                  </p>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-5 block w-full rounded-full bg-primary py-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={() => {
                      clear();
                      toast("Bag cleared.");
                    }}
                    className="mt-3 w-full text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-maroon"
                  >
                    Clear bag
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
