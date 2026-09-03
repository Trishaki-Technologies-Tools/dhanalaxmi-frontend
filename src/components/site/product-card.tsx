import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { formatINR, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const { add, setOpen } = useCart();
  const { toggle, has } = useWishlist();
  const isSoldOut = product.stock <= 0;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-maroon hover:shadow-luxe"
    >
      <div className="shine-sweep relative overflow-hidden bg-pearl">
        {isSoldOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
            <span className="text-[10px] font-bold text-white bg-maroon px-2 py-1 uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={700}
            height={900}
            className={`aspect-[3/4] w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] ${isSoldOut ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="aspect-[3/4] w-full flex items-center justify-center bg-muted/30 border border-dashed border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{product.name.slice(0, 2)}</span>
          </div>
        )}
        {product.badge ? (
          <span className="glass-panel absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]">
            {product.badge}
          </span>
        ) : null}
        <span className="absolute right-3 top-3 flex flex-col gap-1.5">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.id) toggle(product.id, product.name);
            }}
            className={cn(
              "flex size-8 translate-x-3 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-soft backdrop-blur transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-maroon-soft hover:text-maroon",
              product.id && has(product.id) && "text-maroon opacity-100 translate-x-0 bg-maroon-soft"
            )}
          >
            <Heart className={cn("size-3.5", product.id && has(product.id) && "fill-current")} />
          </span>
          <span className="flex size-8 translate-x-3 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-soft backdrop-blur transition-all delay-75 duration-500 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-maroon-soft hover:text-maroon">
            <Eye className="size-3.5" />
          </span>
        </span>
        {!isSoldOut ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Add ${product.name} to bag`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              add(product.slug);
              setOpen(true);
            }}
            className="btn-luxe absolute inset-x-2 bottom-2 z-20 flex translate-y-4 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-2 py-2 text-[11px] text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-maroon-deep active:bg-maroon-deep"
          >
            <ShoppingBag className="size-3" /> Add to bag
          </span>
        ) : (
          <span className="btn-luxe absolute inset-x-2 bottom-2 z-20 flex translate-y-4 items-center justify-center gap-1.5 rounded-full bg-muted px-2 py-2 text-[11px] font-semibold text-muted-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Sold Out
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-[8px] uppercase tracking-[0.2em] text-maroon">
          {product.categoryLabel}
        </p>
        <h3 className="line-clamp-1 text-sm leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Star className="size-2.5 fill-current text-maroon" />
          {product.rating.toFixed(1)} · {product.reviews} reviews
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5 pt-0.5">
          <span className={`font-price text-base ${isSoldOut ? 'text-muted-foreground line-through' : ''}`}>
            {formatINR(product.price)}
          </span>
          <span className="text-[10px] text-muted-foreground line-through">
            {formatINR(product.mrp)}
          </span>
          <span className={`text-[9px] font-semibold ${isSoldOut ? 'text-muted-foreground' : 'text-maroon'}`}>
            {off}% off
          </span>
        </div>
      </div>
    </Link>
  );
}
