import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatINR, type Product } from "@/lib/catalog";
import { deleteProduct, saveProduct, slugify, useCatalog } from "@/lib/catalog-store";
import { AdminButton, Field, Panel, TextArea } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function emptyProduct(categorySlug: string, categoryLabel: string): Product {
  return {
    slug: "",
    name: "",
    category: categorySlug,
    categoryLabel,
    price: 0,
    mrp: 0,
    image: "",
    weight: 0,
    metal: "925 Sterling Silver",
    occasion: "Everyday",
    collection: "Signature",
    rating: 4.7,
    reviews: 0,
    stock: 10,
    popularity: 50,
    description: "",
  };
}

function AdminProducts() {
  const { products, categories } = useCatalog();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{ draft: Product; originalSlug?: string } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (filter === "all" || p.category === filter) &&
        (!q || p.name.toLowerCase().includes(q) || p.category.includes(q)),
    );
  }, [products, query, filter]);

  const startNew = () => {
    const first = categories[0]!;
    setEditing({ draft: emptyProduct(first.slug, first.name) });
  };

  const update = (patch: Partial<Product>) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));

  const submit = () => {
    if (!editing) return;
    const draft = editing.draft;
    if (!draft.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const category = categories.find((c) => c.slug === draft.category);
    const next: Product = {
      ...draft,
      slug: draft.slug || slugify(draft.name),
      categoryLabel: category?.name ?? draft.categoryLabel,
      image: draft.image || category?.image || "",
    };
    saveProduct(next, editing.originalSlug);
    toast.success(editing.originalSlug ? "Product updated" : "Product added");
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Catalogue</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} pieces live on the storefront.
          </p>
        </div>
        <AdminButton onClick={startNew}>
          <Plus className="size-4" /> Add product
        </AdminButton>
      </div>

      {editing && (
        <Panel
          title={editing.originalSlug ? "Edit product" : "New product"}
          action={
            <button
              onClick={() => setEditing(null)}
              aria-label="Close editor"
              className="text-muted-foreground hover:text-maroon"
            >
              <X className="size-4" />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" value={editing.draft.name} onChange={(v) => update({ name: v })} />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Category
              </span>
              <select
                value={editing.draft.category}
                onChange={(e) => update({ category: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-maroon"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Price (₹)"
              type="number"
              value={editing.draft.price}
              onChange={(v) => update({ price: Number(v) })}
            />
            <Field
              label="MRP (₹)"
              type="number"
              value={editing.draft.mrp}
              onChange={(v) => update({ mrp: Number(v) })}
            />
            <Field
              label="Weight (g)"
              type="number"
              value={editing.draft.weight}
              onChange={(v) => update({ weight: Number(v) })}
            />
            <Field
              label="Stock"
              type="number"
              value={editing.draft.stock}
              onChange={(v) => update({ stock: Number(v) })}
            />
            <Field
              label="Occasion"
              value={editing.draft.occasion}
              onChange={(v) => update({ occasion: v })}
            />
            <Field
              label="Badge (optional)"
              value={editing.draft.badge ?? ""}
              onChange={(v) => update({ badge: v || undefined })}
            />
            <Field
              label="Image URL"
              value={editing.draft.image}
              placeholder="https://…"
              onChange={(v) => update({ image: v })}
            />
            <TextArea
              label="Description"
              value={editing.draft.description}
              onChange={(v) => update({ description: v })}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton onClick={submit}>Save product</AdminButton>
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </AdminButton>
          </div>
        </Panel>
      )}

      <Panel>
        <div className="flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-56 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-maroon"
          />
          <select
            value={filter}
            aria-label="Filter by category"
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-maroon"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.slug} className="border-t border-border">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="size-10 rounded-md object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{p.categoryLabel}</td>
                  <td className="py-3">{formatINR(p.price)}</td>
                  <td className="py-3 text-muted-foreground">{p.weight}g</td>
                  <td className="py-3">
                    <span className={p.stock <= 5 ? "text-destructive" : "text-muted-foreground"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Edit ${p.name}`}
                        onClick={() => setEditing({ draft: { ...p }, originalSlug: p.slug })}
                        className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-maroon hover:text-maroon"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        aria-label={`Delete ${p.name}`}
                        onClick={() => {
                          deleteProduct(p.slug);
                          toast.success("Product removed");
                        }}
                        className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No products match.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}