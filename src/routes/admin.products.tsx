import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Pencil, Plus, Trash2, X, Loader2, Upload, Download, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { formatINR, type Product } from "@/lib/catalog";
import { deleteProduct, saveProduct, slugify, useCatalog } from "@/lib/catalog-store";
import { AdminButton, Field, Panel, TextArea } from "@/components/admin/ui";
import { api } from "@/lib/api";

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
    makingCharges: 0,
    image: "",
    weight: 0,
    metal: "925 Sterling Silver",
    occasion: "",
    collection: "",
    rating: 5,
    reviews: 0,
    stock: 0,
    popularity: 50,
    description: "",
  };
}

function AdminProducts() {
  const { products, categories } = useCatalog();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<{ draft: Product; originalSlug?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [silverRate, setSilverRate] = useState<number>(0);

  useEffect(() => {
    api.settings.getSilverRate().then(res => {
      if (res.silverRate) setSilverRate(res.silverRate);
    }).catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingImage(true);
    try {
      const res = await api.upload.image(file);
      update({ image: res.url });
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return toast.error("No products to export");
    const headers = ["slug", "name", "category", "weight", "makingCharges", "stock", "image", "description"];
    const csvRows = [headers.join(",")];
    for (const p of products) {
      const row = headers.map(h => {
        let val = (p as any)[h] || "";
        if (typeof val === "string") val = `"${val.replace(/"/g, '""')}"`;
        return val;
      });
      csvRows.push(row.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dhanalaxmi_products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        if (lines.length <= 1) return toast.error("Empty CSV");
        
        const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
        let imported = 0;
        
        for (let i = 1; i < lines.length; i++) {
          // Simple regex to split by comma ignoring commas inside quotes
          const rowMatches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
          const row = rowMatches.map(c => c.trim().replace(/^"|"$/g, ""));
          
          const draft: any = {};
          headers.forEach((h, idx) => {
            draft[h] = row[idx] || "";
          });
          
          if (!draft.name || !draft.category) continue;
          
          const category = categories.find(c => c.slug === draft.category) || categories[0];
          if (!category) continue;
          
          const weight = Number(draft.weight) || 0;
          const makingCharges = Number(draft.makingCharges) || 0;
          const price = Math.round((weight * silverRate + weight * makingCharges) * 1.03);
          
          const product: Product = {
            ...emptyProduct(category.slug, category.name),
            slug: draft.slug || slugify(draft.name),
            name: draft.name,
            weight,
            makingCharges,
            price,
            mrp: Math.round(price * 1.2),
            stock: Number(draft.stock) || 0,
            image: draft.image || category.image,
            description: draft.description || "",
          };
          await saveProduct(product, product.slug);
          imported++;
        }
        toast.success(`Imported ${imported} products successfully`);
      } catch (err) {
        toast.error("Failed to parse CSV");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

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

  const startEdit = (p: Product) => {
    const weight = p.weight || 0;
    const makingCharges = p.makingCharges || 0;
    const computedPrice = weight > 0 && silverRate > 0
      ? Math.round((weight * silverRate + weight * makingCharges) * 1.03)
      : Math.round(p.price || 0);

    setEditing({
      draft: {
        ...p,
        price: computedPrice,
        mrp: Math.round(p.mrp && p.mrp > computedPrice ? p.mrp : computedPrice * 1.2),
      },
      originalSlug: p.slug,
    });
  };

  const update = (patch: Partial<Product>) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));

  const submit = async () => {
    if (!editing) return;
    const draft = editing.draft;
    if (!draft.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const category = categories.find((c) => c.slug === draft.category);
    let finalPrice = draft.price;
    let finalMrp = draft.mrp;
    
    if (!finalPrice || finalPrice === 0) {
      finalPrice = Math.round(((draft.weight || 0) * silverRate + (draft.weight || 0) * (draft.makingCharges || 0)) * 1.03);
      finalMrp = Math.round(finalPrice * 1.2);
    }

    const next: Product = {
      ...draft,
      slug: draft.slug || slugify(draft.name),
      categoryLabel: category?.name ?? draft.categoryLabel,
      image: draft.image || category?.image || "",
      price: finalPrice,
      mrp: finalMrp,
    };
    await saveProduct(next, editing.originalSlug);
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
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <AdminButton onClick={submit}>
              {editing.originalSlug ? "Update product" : "Add product"}
            </AdminButton>
          ) : (
            <>
              <AdminButton variant="outline" onClick={handleExportCSV}>
                <Download className="size-4 mr-1.5" /> Export
              </AdminButton>
              <label className="cursor-pointer">
                <div className="flex h-10 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-medium transition-colors hover:bg-muted/50 text-foreground">
                  <UploadCloud className="size-4 mr-1.5" /> Import
                </div>
                <input type="file" accept=".csv" className="sr-only" onChange={handleImportCSV} />
              </label>
              <AdminButton onClick={startNew}>
                <Plus className="size-4 mr-1.5" /> Add product
              </AdminButton>
            </>
          )}
        </div>
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
            <Field label="Name" placeholder="Product name" value={editing.draft.name} onChange={(v) => update({ name: v })} />
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
              label="Weight (g)"
              type="number"
              placeholder="e.g. 14.5"
              value={editing.draft.weight ? editing.draft.weight : ""}
              onChange={(v) => {
                const weight = v === "" ? 0 : Number(v);
                const makingCharges = editing.draft.makingCharges || 0;
                const price = weight > 0 ? Math.round((weight * silverRate + weight * makingCharges) * 1.03) : 0;
                const mrp = Math.round(price * 1.2);
                update({ weight, price, mrp });
              }}
            />
            <Field
              label="Making charges / gm (₹ / gram)"
              type="number"
              placeholder="e.g. 45"
              value={editing.draft.makingCharges ? editing.draft.makingCharges : ""}
              onChange={(v) => {
                const makingCharges = v === "" ? 0 : Number(v);
                const weight = editing.draft.weight || 0;
                const price = weight > 0 ? Math.round((weight * silverRate + weight * makingCharges) * 1.03) : 0;
                const mrp = Math.round(price * 1.2);
                update({ makingCharges, price, mrp });
              }}
            />
            <Field
              label="Price (₹) — Final Selling Price"
              type="number"
              placeholder="Auto-calculated (matches Grand Total)"
              value={editing.draft.price ? editing.draft.price : ""}
              onChange={(v) => update({ price: v === "" ? 0 : Number(v) })}
            />
            <Field
              label="MRP (₹)"
              type="number"
              placeholder="Auto-calculated or custom"
              value={editing.draft.mrp ? editing.draft.mrp : ""}
              onChange={(v) => update({ mrp: v === "" ? 0 : Number(v) })}
            />
            <Field
              label="Stock"
              type="number"
              placeholder="e.g. 10"
              value={editing.draft.stock ? editing.draft.stock : ""}
              onChange={(v) => update({ stock: v === "" ? 0 : Number(v) })}
            />
            <Field
              label="Occasion"
              placeholder="e.g. Everyday, Festive, Wedding"
              value={editing.draft.occasion}
              onChange={(v) => update({ occasion: v })}
            />
            <Field
              label="Badge (optional)"
              placeholder="e.g. Most Loved, Trending, New"
              value={editing.draft.badge ?? ""}
              onChange={(v) => update({ badge: v || undefined })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Image</label>
              <div className="flex items-center gap-3">
                {editing.draft.image ? (
                  <img src={editing.draft.image} alt="Preview" className="size-10 rounded object-cover border border-border" />
                ) : (
                  <div className="size-10 rounded border border-dashed border-border flex items-center justify-center bg-muted/30">
                    <span className="text-[10px] text-muted-foreground">None</span>
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editing.draft.image}
                    placeholder="https://…"
                    onChange={(e) => update({ image: e.target.value })}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-maroon"
                  />
                  <label className="relative flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted/50">
                    {isUploadingImage ? <Loader2 className="size-4 animate-spin text-maroon" /> : <Upload className="size-4 text-muted-foreground" />}
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                </div>
              </div>
            </div>
            <TextArea
              label="Description"
              placeholder="Product description, silver purity, craftsmanship..."
              value={editing.draft.description}
              onChange={(v) => update({ description: v })}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>

          <div className="mt-6 rounded-lg border border-maroon/20 bg-maroon-soft p-4 sm:p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-maroon">Price Preview Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">Silver Rate</p>
                <p className="font-semibold">{formatINR(silverRate)} / gm (per gram)</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Silver Amount</p>
                <p className="font-semibold">{formatINR((editing.draft.weight || 0) * silverRate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Making Amount</p>
                <p className="font-semibold">{formatINR((editing.draft.weight || 0) * (editing.draft.makingCharges || 0))}</p>
              </div>
              <div>
                <p className="text-maroon text-xs font-semibold">Grand Total (inc. 3% GST)</p>
                <p className="text-lg font-bold text-maroon">
                  {formatINR(
                    ((editing.draft.weight || 0) * silverRate + (editing.draft.weight || 0) * (editing.draft.makingCharges || 0)) * 1.03
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <AdminButton onClick={submit}>
              {editing.originalSlug ? "Update product" : "Add product"}
            </AdminButton>
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
                <th className="pb-3">Making / gm</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Total Amt</th>
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
                  <td className="py-3">{formatINR(p.makingCharges || 0)}</td>
                  <td className="py-3 text-muted-foreground">{p.weight}g</td>
                  <td className="py-3 font-semibold text-maroon">{formatINR(p.price || 0)}</td>
                  <td className="py-3">
                    <span className={p.stock <= 5 ? "text-destructive" : "text-muted-foreground"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Edit ${p.name}`}
                        onClick={() => startEdit(p)}
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