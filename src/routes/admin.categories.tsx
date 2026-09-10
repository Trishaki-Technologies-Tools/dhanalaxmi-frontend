import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/catalog";
import { deleteCategory, saveCategory, slugify, useCatalog } from "@/lib/catalog-store";
import { AdminButton, Field, Panel } from "@/components/admin/ui";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { categories, products } = useCatalog();
  const [editing, setEditing] = useState<{ draft: Category; originalSlug?: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      e.target.value = "";
    }
  };

  const update = (patch: Partial<Category>) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));

  const submit = async () => {
    if (!editing) return;
    const { draft, originalSlug } = editing;
    if (!draft.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    await saveCategory({ ...draft, slug: draft.slug || slugify(draft.name) }, originalSlug);
    toast.success(originalSlug ? "Category updated" : "Category added");
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Catalogue</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Categories drive shop filters, the mega menu and homepage sections.
          </p>
        </div>
        <AdminButton
          onClick={() =>
            setEditing({ draft: { slug: "", name: "", tagline: "", image: "" } })
          }
        >
          <Plus className="size-4" /> Add category
        </AdminButton>
      </div>

      {editing && (
        <Panel
          title={editing.originalSlug ? "Edit category" : "New category"}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Name" value={editing.draft.name} onChange={(v) => update({ name: v })} />
            <Field
              label="Slug"
              value={editing.draft.slug}
              placeholder="auto from name"
              onChange={(v) => update({ slug: slugify(v) })}
            />
            <Field
              label="Tagline"
              value={editing.draft.tagline}
              onChange={(v) => update({ tagline: v })}
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
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton onClick={submit}>Save category</AdminButton>
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </AdminButton>
          </div>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => (
          <div key={c.slug} className="rounded-[1.25rem] border border-border bg-background p-4">
            <div className="flex items-center gap-4">
              {c.image ? (
                <img src={c.image} alt="" className="size-16 rounded-lg object-cover bg-muted/30" />
              ) : (
                <div className="size-16 rounded-lg bg-muted/30 flex items-center justify-center border border-dashed border-border">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">No Img</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.tagline}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-maroon">
                  {products.filter((p) => p.category === c.slug).length} products
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <AdminButton
                variant="outline"
                onClick={() => setEditing({ draft: { ...c }, originalSlug: c.slug })}
              >
                <Pencil className="size-3.5" /> Edit
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={() => {
                  deleteCategory(c.slug);
                  toast.success("Category removed");
                }}
              >
                <Trash2 className="size-3.5" /> Delete
              </AdminButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}