import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatINR } from "@/lib/catalog";
import { type Order } from "@/lib/orders";
import { Panel, StatPill } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

type Row = {
  phone: string;
  name: string;
  email: string;
  city: string;
  orders: number;
  spend: number;
  last: number;
};

function AdminCustomers() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.orders.getAllAdmin().then((res) => {
      if (res.orders) {
        setAllOrders(
          res.orders.map((o: any) => ({
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
              price: Number(item.price),
              qty: item.quantity,
            })),
          }))
        );
      }
    });
  }, []);

  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    allOrders.forEach((o) => {
      const existing = map.get(o.phone);
      const row: Row = existing ?? {
        phone: o.phone,
        name: o.address?.name ?? "Guest",
        email: o.address?.email ?? "—",
        city: o.address?.city ?? "—",
        orders: 0,
        spend: 0,
        last: 0,
      };
      row.orders += 1;
      if ((o.status ?? "active") === "active") row.spend += o.total;
      row.last = Math.max(row.last, o.createdAt);
      if (o.address?.name) row.name = o.address.name;
      if (o.address?.email) row.email = o.address.email;
      if (o.address?.city) row.city = o.address.city;
      map.set(o.phone, row);
    });
    const list = [...map.values()].sort((a, b) => b.spend - a.spend);
    const q = query.trim().toLowerCase();
    return q
      ? list.filter(
          (r) =>
            r.phone.includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q),
        )
      : list;
  }, [allOrders, query]);

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Relationships</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Built from every order placed on the store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill label="Customers" value={String(rows.length)} />
        <StatPill label="Lifetime value" value={formatINR(totalSpend)} />
        <StatPill
          label="Avg. order"
          value={formatINR(
            allOrders.length ? Math.round(totalSpend / Math.max(1, allOrders.length)) : 0,
          )}
        />
      </div>

      <Panel>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone or email"
          className="w-64 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-maroon"
        />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="pb-3">Customer</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">City</th>
                <th className="pb-3">Orders</th>
                <th className="pb-3">Spend</th>
                <th className="pb-3">Last order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.phone} className="border-t border-border">
                  <td className="py-3">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="py-3 text-muted-foreground">{r.phone}</td>
                  <td className="py-3 text-muted-foreground">{r.city}</td>
                  <td className="py-3">{r.orders}</td>
                  <td className="py-3">{formatINR(r.spend)}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(r.last).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No customers yet.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}