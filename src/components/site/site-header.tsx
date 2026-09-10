import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  User,
  X,
  ChevronDown,
  Package,
  MapPin,
  Truck,
  LogOut,
  UserRound,
} from "lucide-react";
import { useCatalog } from "@/lib/catalog-store";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/image.png";

const announcements = [
  "Complimentary insured shipping across India",
  "925 BIS hallmarked sterling silver",
  "15-day easy returns & lifetime polish",
  "Concierge support · +91 98765 43210",
];

const nav = [
  { label: "Home", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/shop" },
  { label: "Best Sellers", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-maroon-deep py-2.5 text-primary-foreground">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {announcements.map((a) => (
              <span
                key={a + dup}
                className="flex items-center gap-8 px-8 text-[11px] uppercase tracking-[0.28em] opacity-80"
              >
                {a}
                <span className="size-1 rounded-full bg-silver" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { categories } = useCatalog();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState(false);
  const { count, setOpen } = useCart();
  const { isAuthenticated, phone, signOut } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate({ to: "/search", search: { q } });
  };

  const accountLinks = isAuthenticated
    ? ([
        { label: "My profile", to: "/account", Icon: UserRound },
        { label: "Address book", to: "/account", Icon: MapPin },
        { label: "Order history", to: "/orders", Icon: Package },
      ] as const)
    : ([
        { label: "Sign in", to: "/login", Icon: UserRound },
        { label: "Create account", to: "/signup", Icon: User },
        { label: "Track order", to: "/track", Icon: Truck },
      ] as const);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div
        className={cn(
          "border-b border-maroon/15 bg-[#F6D7B0] text-maroon transition-all duration-500",
          scrolled ? "shadow-luxe" : "",
        )}
        onMouseLeave={() => setMega(false)}
      >
        <div className="mx-auto flex max-w-[88rem] items-center gap-6 px-6 py-4 lg:px-10">
          <button
            aria-label="Open menu"
            className="lg:hidden text-maroon"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <Menu className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Dhanalaxmi Logo" className="h-9 sm:h-12 w-auto object-contain" />
            <div className="flex flex-col items-center leading-none pt-1">
              <span className="font-['Cinzel',_serif] text-base font-bold tracking-[0.05em] sm:text-xl text-maroon">
                DHANALAXMI
              </span>
              <span className="mt-1 font-['Cinzel',_serif] text-[6.5px] sm:text-[8.5px] font-semibold tracking-[0.42em] text-maroon/80">
                JEWELLERS
              </span>
            </div>
          </Link>

          <nav className="mx-auto hidden items-center gap-8 lg:flex">
            {nav.map((item) => {
              const isShop = item.label === "Shop";
              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setMega(isShop)}
                  className="relative"
                >
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-maroon/80 transition-colors hover:text-maroon"
                    activeProps={{ className: "text-maroon font-bold" }}
                  >
                    {item.label}
                    {isShop ? <ChevronDown className="size-3" /> : null}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-5 lg:ml-0 text-maroon">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="transition-opacity hover:opacity-70"
            >
              <Search className="size-[18px]" />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden transition-opacity hover:opacity-60 sm:block"
            >
              <Heart className="size-[18px]" />
            </Link>
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setAccount(true)}
              onMouseLeave={() => setAccount(false)}
            >
              <button
                aria-label="Account"
                aria-expanded={account}
                onClick={() => setAccount((v) => !v)}
                className="flex items-center gap-1 transition-opacity hover:opacity-60"
              >
                <User className="size-[18px]" />
                <ChevronDown className="size-3" />
              </button>
              <AnimatePresence>
                {account ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="absolute right-0 top-full z-50 w-60 overflow-hidden rounded-2xl border border-border bg-background pt-1 text-foreground shadow-luxe"
                  >
                    <p className="px-5 pb-2 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {isAuthenticated ? `+91 ${phone}` : "My account"}
                    </p>
                    <ul className="pb-2">
                      {accountLinks.map(({ label, to, Icon }) => (
                        <li key={label}>
                          <Link
                            to={to}
                            onClick={() => setAccount(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-maroon-soft hover:text-maroon"
                          >
                            <Icon className="size-4 text-maroon" /> {label}
                          </Link>
                        </li>
                      ))}
                      {isAuthenticated ? (
                        <li className="border-t border-border">
                          <button
                            onClick={() => {
                              signOut();
                              setAccount(false);
                            }}
                            className="flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-maroon-soft hover:text-maroon"
                          >
                            <LogOut className="size-4 text-maroon" /> Sign out
                          </button>
                        </li>
                      ) : null}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <button
              aria-label="Cart"
              onClick={() => setOpen(true)}
              className="relative transition-opacity hover:opacity-60"
            >
              <ShoppingBag className="size-[18px]" />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-maroon text-[9px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-maroon/15 bg-[#F6D7B0]"
            >
              <form
                onSubmit={submitSearch}
                className="mx-auto flex max-w-[88rem] items-center gap-3 px-6 py-4 lg:px-10"
              >
                <Search className="size-4 text-maroon" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search earrings, kada, payal, chains…"
                  aria-label="Search products"
                  className="flex-1 bg-transparent py-2 text-sm text-maroon placeholder:text-maroon/60 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-maroon px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-maroon-deep"
                >
                  Search
                </button>
                <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                  <X className="size-4 text-maroon" />
                </button>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {mega ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-background text-foreground shadow-luxe lg:block"
            >
              <div className="mx-auto grid max-w-[88rem] gap-10 px-10 py-12 lg:grid-cols-[1fr_1fr_20rem]">
                <div>
                  <p className="text-eyebrow">Shop by category</p>
                  <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    {categories.slice(0, 6).map((c) => (
                      <li key={c.slug}>
                    <Link
                          to="/shop"
                          search={{ category: c.slug }}
                          className="text-muted-foreground transition-colors hover:text-maroon"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-eyebrow">Curated edits</p>
                  <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    {categories.slice(6).map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/collections"
                          className="text-muted-foreground transition-colors hover:text-maroon"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/collections" className="luxe-card luxe-card-hover overflow-hidden">
                  <img
                    src={categories[9]?.image || categories[0]?.image || ""}
                    alt="Wedding collection"
                    loading="lazy"
                    width={900}
                    height={1100}
                    className="aspect-16/10 w-full object-cover"
                  />
                  <div className="p-5">
                    <p className="text-eyebrow">Featured</p>
                    <p className="mt-2 text-lg">The Wedding Vault</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobile ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobile(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-[80vw] max-w-sm overflow-y-auto border-r border-border bg-background text-foreground shadow-luxe lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-border">
                <span className="text-eyebrow">Menu</span>
                <button aria-label="Close menu" onClick={() => setMobile(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <ul className="px-6 py-4">
                {nav.map((item) => (
                  <li key={item.label} className="border-b border-border/70 last:border-0">
                    <Link
                      to={item.to}
                      onClick={() => setMobile(false)}
                      className="block py-4 text-sm uppercase tracking-[0.2em]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                
                <li className="mt-8 mb-2">
                  <span className="text-eyebrow">Account</span>
                </li>
                {accountLinks.map(({ label, to }) => (
                  <li key={label} className="border-b border-border/70 last:border-0">
                    <Link
                      to={to}
                      onClick={() => setMobile(false)}
                      className="block py-4 text-sm uppercase tracking-[0.2em] text-maroon"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}