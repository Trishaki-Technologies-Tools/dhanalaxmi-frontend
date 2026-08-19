import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/catalog";
import { deleteCategory, saveCategory, slugify, useCatalog } from "@/lib/catalog-store";
import { AdminButton, Field, Panel } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const { categories, products } = useCatalog();
  const [editing, setEditing] = useState<{ draft: Category; originalSlug?: string } | null>(null);

  const update = (patch: Partial<Category>) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));

  const submit = () => {
    if (!editing) return;
    const { draft, originalSlug } = editing;
    if (!draft.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    saveCategory({ ...draft, slug: draft.slug || slugify(draft.name) }, originalSlug);
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
            <Field
              label="Image URL"
              value={editing.draft.image}
              onChange={(v) => update({ image: v })}
            />
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
              <img src={c.image} alt="" className="size-16 rounded-lg object-cover" />
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