import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { orderStages, stageIndexFor, useOrders } from "@/lib/orders";
import { Panel, StatPill } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { products, categories, banners } = useCatalog();
  const { allOrders, now } = useOrders();

  const live = allOrders.filter((o) => (o.status ?? "active") === "active");
  const revenue = live.reduce((sum, o) => sum + o.total, 0);
  const pending = live.filter((o) => stageIndexFor(o, now) < 4).length;
  const customers = new Set(allOrders.map((o) => o.phone)).size;
  const lowStock = products.filter((p) => p.stock <= 5);
  const recent = [...allOrders].slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Overview</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything the storefront shows is managed from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Revenue" value={formatINR(revenue)} hint={`${live.length} live orders`} />
        <StatPill label="Awaiting delivery" value={String(pending)} hint="Not yet delivered" />
        <StatPill label="Customers" value={String(customers)} hint="Unique phone numbers" />
        <StatPill
          label="Catalogue"
          value={String(products.length)}
          hint={`${categories.length} categories · ${banners.length} banners`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Recent orders"
          action={
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-maroon"
            >
              Manage <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet. Place a test order from the storefront to see it here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Stage</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="py-3 font-medium">{o.id}</td>
                      <td className="py-3 text-muted-foreground">
                        {o.address?.name ?? o.phone}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {(o.status ?? "active") === "cancelled"
                          ? "Cancelled"
                          : orderStages[stageIndexFor(o, now)]}
                      </td>
                      <td className="py-3 text-right">{formatINR(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Low stock"
          action={
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-maroon"
            >
              Products <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All pieces are comfortably stocked.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.slug} className="flex items-center gap-3">
                  <img src={p.image} alt="" className="size-10 rounded-md object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span className="text-xs font-semibold text-destructive">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}