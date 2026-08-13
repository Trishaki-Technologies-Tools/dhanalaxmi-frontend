import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";

const items = [
  { label: "Home", to: "/", Icon: Home },
  { label: "Shop", to: "/shop", Icon: LayoutGrid },
  { label: "Wishlist", to: "/shop", Icon: Heart },
] as const;

export function MobileDock() {
  const { count, setOpen } = useCart();
  return (
    <>
      <a
        href="https://wa.me/919876543210"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-luxe transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50 md:bottom-8"
      >
        <MessageCircle className="size-5" />
      </a>
      <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-3 md:hidden">
        {items.map(({ label, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            activeProps={{ className: "text-maroon" }}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          <ShoppingBag className="size-[18px]" />
          {count > 0 ? (
            <span className="absolute -top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
              {count}
            </span>
          ) : null}
          Bag
        </button>
      </nav>
    </>
  );
}