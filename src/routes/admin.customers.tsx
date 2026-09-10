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
  createdAt: number;
};

function AdminCustomers() {
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.customers.getAll().catch(() => ({ customers: [] })),
      api.orders.getAllAdmin().catch(() => ({ orders: [] })),
    ]).then(([custRes, ordRes]) => {
      if (custRes?.customers) setCustomersList(custRes.customers);
      if (ordRes?.orders) {
        setAllOrders(
          ordRes.orders.map((o: any) => ({
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
            lines: (o.items || []).map((item: any) => ({
              slug: item.productSlug,
              name: item.productName,
              image: item.productImage,
              price: Number(item.price),
              qty: item.quantity,
            })),
          }))
        );
      }
      setLoading(false);
    });
  }, []);

  const rows = useMemo(() => {
    const map = new Map<string, Row>();

    // 1. Add all registered customers from the User database table
    customersList.forEach((u) => {
      const phone = u.phone || "";
      if (!phone) return;
      
      const defaultAddr = u.addresses?.find((a: any) => a.isDefault) || u.addresses?.[0];
      const orderCount = u.orders?.length || 0;
      const totalSpend = (u.orders || []).reduce(
        (sum: number, o: any) => (o.status !== "CANCELLED" ? sum + Number(o.totalAmount || 0) : sum),
        0
      );
      const lastOrderTime = (u.orders || []).reduce((max: number, o: any) => {
        const t = new Date(o.createdAt).getTime();
        return t > max ? t : max;
      }, 0);

      map.set(phone, {
        phone,
        name: u.name || "Customer",
        email: u.email || "—",
        city: defaultAddr?.city || "—",
        orders: orderCount,
        spend: totalSpend,
        last: lastOrderTime || new Date(u.createdAt).getTime(),
        createdAt: new Date(u.createdAt).getTime(),
      });
    });

    // 2. Augment / merge with orders (catches any guest orders not linked to a registered account)
    allOrders.forEach((o) => {
      if (!o.phone) return;
      const existing = map.get(o.phone);
      if (existing) {
        // If order details have newer info
        if (existing.orders === 0) {
          existing.orders = 1;
          if (o.status === "active") existing.spend = o.total;
          existing.last = o.createdAt;
        }
        if (o.address?.city && existing.city === "—") existing.city = o.address.city;
        if (o.address?.email && existing.email === "—") existing.email = o.address.email;
        if (o.address?.name && (!existing.name || existing.name.startsWith("Customer "))) {
          existing.name = o.address.name;
        }
      } else {
        map.set(o.phone, {
          phone: o.phone,
          name: o.address?.name ?? "Customer",
          email: o.address?.email ?? "—",
          city: o.address?.city ?? "—",
          orders: 1,
          spend: o.status === "active" ? o.total : 0,
          last: o.createdAt,
          createdAt: o.createdAt,
        });
      }
    });

    const list = [...map.values()].sort((a, b) => b.spend - a.spend || b.last - a.last);
    const q = query.trim().toLowerCase();
    return q
      ? list.filter(
          (r) =>
            r.phone.includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q),
        )
      : list;
  }, [customersList, allOrders, query]);

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Relationships</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Customers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All registered accounts & patrons across the store.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill label="Total Customers" value={String(rows.length)} />
        <StatPill label="Lifetime Value" value={formatINR(totalSpend)} />
        <StatPill
          label="Avg. Spend per Customer"
          value={formatINR(
            rows.length ? Math.round(totalSpend / Math.max(1, rows.length)) : 0,
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
                    {r.orders > 0 ? (
                      new Date(r.last).toLocaleDateString("en-IN")
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-mist px-2 py-0.5 text-[11px] text-muted-foreground">
                        Joined {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    )}
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