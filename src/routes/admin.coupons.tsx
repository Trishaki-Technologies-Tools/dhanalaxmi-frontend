import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminButton, Field, Panel } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await api.coupons.getAllAdmin();
      setCoupons(res.coupons);
    } catch (err) {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const update = (patch: any) => setEditing((e: any) => ({ ...e, ...patch }));

  const submit = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await api.coupons.update(editing.id, {
          ...editing,
          discountValue: Number(editing.discountValue),
          minOrderValue: editing.minOrderValue ? Number(editing.minOrderValue) : null,
        });
        toast.success("Coupon updated");
      } else {
        await api.coupons.create({
          ...editing,
          discountValue: Number(editing.discountValue),
          minOrderValue: editing.minOrderValue ? Number(editing.minOrderValue) : null,
        });
        toast.success("Coupon created");
      }
      setEditing(null);
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to save coupon");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.coupons.delete(String(id));
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Marketing</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Coupons</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage discount codes and promotions.
          </p>
        </div>
        <AdminButton
          onClick={() =>
            setEditing({
              code: "",
              discountType: "PERCENT",
              discountValue: 10,
              minOrderValue: "",
              active: true,
            })
          }
        >
          <Plus className="size-4" /> Add coupon
        </AdminButton>
      </div>

      {editing && (
        <Panel
          title={editing.id ? "Edit coupon" : "New coupon"}
          action={
            <button
              onClick={() => setEditing(null)}
              className="text-muted-foreground hover:text-maroon"
            >
              <X className="size-4" />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Coupon Code" value={editing.code} onChange={(v) => update({ code: v.toUpperCase() })} />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Type</span>
              <select
                value={editing.discountType}
                onChange={(e) => update({ discountType: e.target.value })}
                className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none focus:border-maroon"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </label>
            <Field
              label="Discount Value"
              type="number"
              value={editing.discountValue}
              onChange={(v) => update({ discountValue: v })}
            />
            <Field
              label="Min Order Value (₹)"
              type="number"
              value={editing.minOrderValue || ""}
              onChange={(v) => update({ minOrderValue: v })}
              placeholder="Optional"
            />
            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => update({ active: e.target.checked })}
              />
              <span className="text-sm font-semibold">Active</span>
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton onClick={submit}>Save coupon</AdminButton>
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </AdminButton>
          </div>
        </Panel>
      )}

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-4 py-3">{c.minOrderValue ? `₹${c.minOrderValue}` : "None"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                      c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(c)}
                    className="mr-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-maroon"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-muted-foreground hover:text-maroon"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
