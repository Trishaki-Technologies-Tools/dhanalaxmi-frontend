import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, ShoppingBag, MessageCircle } from "lucide-react";

const items = [
  { label: "Home", to: "/", Icon: Home },
  { label: "Shop", to: "/shop", Icon: LayoutGrid },
  { label: "Wishlist", to: "/shop", Icon: Heart },
  { label: "Bag", to: "/shop", Icon: ShoppingBag },
] as const;

export function MobileDock() {
  return (
    <>
      <a
        href="https://wa.me/919876543210"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-luxe transition-colors hover:bg-silver hover:text-primary md:bottom-8"
      >
        <MessageCircle className="size-5" />
      </a>
      <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-3 md:hidden">
        {items.map(({ label, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}