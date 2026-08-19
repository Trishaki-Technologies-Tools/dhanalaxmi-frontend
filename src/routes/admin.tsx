import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BadgeIndianRupee,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Internal admin console for managing the Dhanalaxmi Jeweler's catalogue, banners, orders and customers.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/banners", label: "Banners & Promos", icon: Images },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { isAdmin, hydrated, email, signOut } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAdmin && !isLoginRoute) navigate({ to: "/admin/login", replace: true });
    if (isAdmin && isLoginRoute) navigate({ to: "/admin", replace: true });
  }, [hydrated, isAdmin, isLoginRoute, navigate]);

  if (!hydrated) {
    return <div className="min-h-screen bg-pearl" />;
  }

  if (isLoginRoute || !isAdmin) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-pearl">
      <div className="mx-auto flex max-w-[100rem] flex-col lg:flex-row">
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-border lg:bg-background">
          <div className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="font-display text-lg leading-none">Dhanalaxmi</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-maroon">
                Admin Console
              </p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
            {nav.map(({ to, label, icon: Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors lg:rounded-lg ${
                    active
                      ? "bg-maroon text-primary-foreground"
                      : "text-muted-foreground hover:bg-maroon-soft hover:text-maroon"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden px-4 pb-6 lg:block">
            <div className="rounded-lg border border-border p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Signed in
              </p>
              <p className="mt-1 truncate text-sm">{email}</p>
              <button
                onClick={() => {
                  signOut();
                  navigate({ to: "/admin/login", replace: true });
                }}
                className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-maroon hover:text-maroon-deep"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </div>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-maroon"
            >
              <BadgeIndianRupee className="size-3.5" /> View storefront
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}