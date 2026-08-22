import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  MessageSquare,
  TicketPercent,
} from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const { isAdmin, hydrated, email, signOut } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLoginRoute = pathname === "/admin/login";

  const [silverRate, setSilverRate] = useState<number | "">("");
  const [updatingRate, setUpdatingRate] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api.settings.getSilverRate().then(res => {
        if (res.silverRate) setSilverRate(res.silverRate);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleUpdateSilverRate = async () => {
    if (!silverRate) return;
    setUpdatingRate(true);
    try {
      await api.settings.updateSilverRate({ rate: Number(silverRate) });
      toast.success("Silver rate updated globally");
    } catch (err) {
      toast.error("Failed to update silver rate");
    } finally {
      setUpdatingRate(false);
    }
  };

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
        <aside className="bg-maroon text-primary-foreground lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:flex lg:flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="font-display text-lg leading-none">Dhanalaxmi</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/70">
                Admin Console
              </p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible scrollbar-none">
            {nav.map(({ to, label, icon: Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors lg:rounded-lg ${
                    active
                      ? "bg-white text-maroon"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden px-4 pb-6 lg:flex lg:flex-col lg:gap-4">
            <div className="rounded-lg border border-white/20 bg-white/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Live Silver Rate
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/50">₹</span>
                  <input
                    type="number"
                    value={silverRate}
                    onChange={(e) => setSilverRate(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Rate / gram"
                    className="w-full rounded-md border border-white/20 bg-white/5 py-1.5 pl-6 pr-2 text-sm font-semibold text-white placeholder:text-white/40 outline-none focus:border-white/40"
                  />
                </div>
                <button
                  onClick={handleUpdateSilverRate}
                  disabled={updatingRate}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-maroon transition-colors hover:bg-white/90 disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-white/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                Signed in
              </p>
              <p className="mt-1 truncate text-sm">{email}</p>
              <button
                onClick={() => {
                  signOut();
                  navigate({ to: "/admin/login", replace: true });
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-white/10 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/20"
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </div>
            <Link
              to="/"
              className="inline-flex justify-center items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/60 hover:text-white"
            >
              <ArrowRight className="size-3.5" /> Back to Store
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