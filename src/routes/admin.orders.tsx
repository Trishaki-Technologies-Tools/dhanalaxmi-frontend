import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatINR } from "@/lib/catalog";
import { orderStages, stageIndexFor, useOrders, type Order } from "@/lib/orders";
import { AdminButton, Panel, StatPill } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { now, updateOrder, cancelOrder } = useOrders();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.orders.getAllAdmin();
        if (res.orders) {
          const formattedOrders = res.orders.map((o: any) => ({
            id: o.orderNumber || String(o.id),
            phone: o.customerPhone || "",
            createdAt: new Date(o.createdAt).getTime(),
            total: Number(o.totalAmount),
            method: (o.paymentMethod || "UPI").toLowerCase(),
            paid: o.paymentStatus === "PAID",
            shipTo: `${o.customerName}, ${o.city}`,
            address: {
              name: o.customerName,
              email: o.customerEmail || "",
              phone: o.customerPhone,
              address: o.addressLine1,
              city: o.city,
              pincode: o.pincode,
            },
            status: (o.status === "CANCELLED" ? "cancelled" : "active") as Order["status"],
            lines: o.items.map((item: any) => ({
              slug: item.productSlug,
              name: item.productName,
              image: item.productImage,
              qty: item.quantity,
              price: Number(item.price),
            })),
          }));
          setAllOrders(formattedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch admin orders", err);
      }
    }
    load();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders.filter((o) => {
      const stage = orderStages[stageIndexFor(o, now)]!;
      const cancelled = (o.status ?? "active") === "cancelled";
      if (stageFilter === "cancelled" && !cancelled) return false;
      if (stageFilter !== "all" && stageFilter !== "cancelled" && (cancelled || stage !== stageFilter))
        return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.address?.name ?? "").toLowerCase().includes(q) ||
        (o.address?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [allOrders, now, query, stageFilter]);

  const revenue = allOrders
    .filter((o) => (o.status ?? "active") === "active")
    .reduce((s, o) => s + o.total, 0);
  const requests = allOrders.filter((o) => o.request).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Operations</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Move an order along the timeline, mark payment collected, or cancel it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill label="Orders" value={String(allOrders.length)} />
        <StatPill label="Revenue" value={formatINR(revenue)} hint="Excludes cancelled" />
        <StatPill label="Return requests" value={String(requests)} />
      </div>

      <Panel>
        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order ID, name, phone"
            className="w-64 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-maroon"
          />
          <select
            aria-label="Filter by stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-maroon"
          >
            <option value="all">All stages</option>
            {orderStages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {rows.map((o) => {
            const cancelled = (o.status ?? "active") === "cancelled";
            const stage = stageIndexFor(o, now);
            return (
              <div key={o.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.address?.name ?? "Guest"} · {o.phone}
                      {o.address?.city ? ` · ${o.address.city}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {o.lines.length} item{o.lines.length === 1 ? "" : "s"} ·{" "}
                      {new Date(o.createdAt).toLocaleString("en-IN")}
                    </p>
                    {o.request && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-maroon">
                        {o.request.type} requested — {o.request.reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg">{formatINR(o.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.method} · {o.paid ? "Paid" : "Pay on delivery"}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        cancelled ? "text-destructive" : "text-maroon"
                      }`}
                    >
                      {cancelled ? "Cancelled" : orderStages[stage]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Set stage for ${o.id}`}
                    value={String(stage)}
                    disabled={cancelled}
                    onChange={async (e) => {
                      const newStage = Number(e.target.value);
                      try {
                        const statusToUpdate = newStage === 4 ? "DELIVERED" : "PROCESSING";
                        await api.orders.updateAdmin(o.id, { status: statusToUpdate });
                        setAllOrders(all => all.map(ord => ord.id === o.id ? { ...ord, stageOverride: newStage } : ord));
                        toast.success(`${o.id} → ${orderStages[newStage]}`);
                      } catch (err) {
                        toast.error("Failed to update status");
                      }
                    }}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-maroon disabled:opacity-40"
                  >
                    {orderStages.map((s, i) => (
                      <option key={s} value={i}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {!o.paid && !cancelled && (
                    <AdminButton
                      variant="outline"
                      onClick={async () => {
                        try {
                          await api.orders.updateAdmin(o.id, { paymentStatus: "PAID" });
                          setAllOrders(all => all.map(ord => ord.id === o.id ? { ...ord, paid: true } : ord));
                          toast.success("Marked as paid");
                        } catch (err) {
                          toast.error("Failed to mark as paid");
                        }
                      }}
                    >
                      Mark paid
                    </AdminButton>
                  )}
                  {!cancelled && (
                    <AdminButton
                      variant="danger"
                      onClick={async () => {
                        try {
                          await api.orders.updateAdmin(o.id, { status: "CANCELLED" });
                          setAllOrders(all => all.map(ord => ord.id === o.id ? { ...ord, status: "cancelled" } : ord));
                          toast.success("Order cancelled");
                        } catch (err) {
                          toast.error("Failed to cancel order");
                        }
                      }}
                    >
                      Cancel order
                    </AdminButton>
                  )}
                  <a
                    href={`/admin/invoice?order=${o.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 hover:underline hover:text-maroon"
                  >
                    Print Invoice
                  </a>
                  <Link
                    to="/order/$id"
                    params={{ id: o.id }}
                    className="ml-4 text-xs uppercase tracking-[0.14em] text-maroon underline-offset-4 hover:underline"
                  >
                    Customer view
                  </Link>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders found.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}