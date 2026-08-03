import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { formatINR, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block overflow-hidden rounded-[1.5rem] border border-border bg-card transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:border-silver hover:shadow-luxe"
    >
      <div className="shine-sweep relative overflow-hidden bg-pearl">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={900}
          height={1100}
          className="aspect-4/5 w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
        />
        {product.badge ? (
          <span className="glass-panel absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {product.badge}
          </span>
        ) : null}
        <span className="absolute right-4 top-4 flex flex-col gap-2">
          <span className="flex size-9 translate-x-3 items-center justify-center rounded-full bg-background/85 opacity-0 shadow-soft backdrop-blur transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-silver">
            <Heart className="size-4" />
          </span>
          <span className="flex size-9 translate-x-3 items-center justify-center rounded-full bg-background/85 opacity-0 shadow-soft backdrop-blur transition-all delay-75 duration-500 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-silver">
            <Eye className="size-4" />
          </span>
        </span>
        <span className="btn-luxe absolute inset-x-4 bottom-4 flex translate-y-4 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-silver hover:text-primary">
          <ShoppingBag className="size-4" /> Add to bag
        </span>
      </div>
      <div className="space-y-2 p-6">
        <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          {product.categoryLabel}
        </p>
        <h3 className="text-[1.4rem] leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-current text-foreground" />
          {product.rating.toFixed(1)} · {product.reviews} reviews
        </div>
        <div className="flex items-baseline gap-3 pt-1">
          <span className="font-price text-2xl">{formatINR(product.price)}</span>
          <span className="text-sm text-muted-foreground line-through">
            {formatINR(product.mrp)}
          </span>
          <span className="text-xs font-semibold text-silver-deep">{off}% off</span>
        </div>
      </div>
    </Link>
  );
}
