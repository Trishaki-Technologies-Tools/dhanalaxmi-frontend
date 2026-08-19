import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteBanner,
  deletePromo,
  moveBanner,
  saveBanner,
  savePromo,
  useCatalog,
  type Banner,
  type PromoTile,
} from "@/lib/catalog-store";
import { AdminButton, Field, Panel, TextArea } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

function newBanner(): Banner {
  return {
    id: `b${Date.now()}`,
    image: "",
    alt: "",
    eyebrow: "New Edit",
    titleTop: "",
    titleBottom: "",
    copy: "",
    cta: "Shop Now",
    active: true,
  };
}

function newPromo(): PromoTile {
  return {
    id: `p${Date.now()}`,
    eyebrow: "",
    titleTop: "",
    titleBottom: "",
    cta: "Shop Now",
    image: "",
    dark: false,
  };
}

function AdminBanners() {
  const { banners, promos, categories } = useCatalog();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [promo, setPromo] = useState<PromoTile | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Landing page</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Banners & Promos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hero carousel slides and the three promo tiles on the homepage.
        </p>
      </div>

      {banner && (
        <Panel
          title="Hero slide"
          action={
            <button
              onClick={() => setBanner(null)}
              aria-label="Close editor"
              className="text-muted-foreground hover:text-maroon"
            >
              <X className="size-4" />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Eyebrow"
              value={banner.eyebrow}
              onChange={(v) => setBanner({ ...banner, eyebrow: v })}
            />
            <Field
              label="Title line 1"
              value={banner.titleTop}
              onChange={(v) => setBanner({ ...banner, titleTop: v })}
            />
            <Field
              label="Title line 2"
              value={banner.titleBottom}
              onChange={(v) => setBanner({ ...banner, titleBottom: v })}
            />
            <Field
              label="Button label"
              value={banner.cta}
              onChange={(v) => setBanner({ ...banner, cta: v })}
            />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Links to category
              </span>
              <select
                value={banner.category ?? ""}
                onChange={(e) =>
                  setBanner({ ...banner, category: e.target.value || undefined })
                }
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-maroon"
              >
                <option value="">Whole shop</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Image URL"
              value={banner.image}
              onChange={(v) => setBanner({ ...banner, image: v })}
            />
            <Field
              label="Image alt text"
              value={banner.alt}
              onChange={(v) => setBanner({ ...banner, alt: v })}
              className="sm:col-span-2"
            />
            <TextArea
              label="Body copy"
              value={banner.copy}
              onChange={(v) => setBanner({ ...banner, copy: v })}
              className="sm:col-span-2 lg:col-span-3"
            />
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton
              onClick={() => {
                saveBanner(banner);
                toast.success("Banner saved");
                setBanner(null);
              }}
            >
              Save slide
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => setBanner(null)}>
              Cancel
            </AdminButton>
          </div>
        </Panel>
      )}

      <Panel
        title="Hero carousel"
        action={
          <AdminButton onClick={() => setBanner(newBanner())}>
            <Plus className="size-4" /> Add slide
          </AdminButton>
        }
      >
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-3"
            >
              <img src={b.image} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-maroon">{b.eyebrow}</p>
                <p className="truncate text-sm font-medium">
                  {b.titleTop} {b.titleBottom}
                </p>
                <p className="truncate text-xs text-muted-foreground">{b.copy}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Move up"
                  onClick={() => moveBanner(b.id, -1)}
                  disabled={i === 0}
                  className="rounded-full border border-border p-2 text-muted-foreground disabled:opacity-30 hover:border-maroon hover:text-maroon"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  aria-label="Move down"
                  onClick={() => moveBanner(b.id, 1)}
                  disabled={i === banners.length - 1}
                  className="rounded-full border border-border p-2 text-muted-foreground disabled:opacity-30 hover:border-maroon hover:text-maroon"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  aria-label={b.active ? "Hide slide" : "Show slide"}
                  onClick={() => saveBanner({ ...b, active: !b.active })}
                  className="rounded-full border border-border p-2 text-muted-foreground hover:border-maroon hover:text-maroon"
                >
                  {b.active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </button>
                <button
                  aria-label="Edit slide"
                  onClick={() => setBanner({ ...b })}
                  className="rounded-full border border-border p-2 text-muted-foreground hover:border-maroon hover:text-maroon"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  aria-label="Delete slide"
                  onClick={() => {
                    deleteBanner(b.id);
                    toast.success("Slide removed");
                  }}
                  className="rounded-full border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <p className="text-sm text-muted-foreground">No slides — add one to fill the hero.</p>
          )}
        </div>
      </Panel>

      {promo && (
        <Panel
          title="Promo tile"
          action={
            <button
              onClick={() => setPromo(null)}
              aria-label="Close editor"
              className="text-muted-foreground hover:text-maroon"
            >
              <X className="size-4" />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Eyebrow"
              value={promo.eyebrow}
              onChange={(v) => setPromo({ ...promo, eyebrow: v })}
            />
            <Field
              label="Title line 1"
              value={promo.titleTop}
              onChange={(v) => setPromo({ ...promo, titleTop: v })}
            />
            <Field
              label="Title line 2"
              value={promo.titleBottom}
              onChange={(v) => setPromo({ ...promo, titleBottom: v })}
            />
            <Field
              label="Button label"
              value={promo.cta}
              onChange={(v) => setPromo({ ...promo, cta: v })}
            />
            <Field
              label="Image URL"
              value={promo.image}
              onChange={(v) => setPromo({ ...promo, image: v })}
            />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Links to category
              </span>
              <select
                value={promo.category ?? ""}
                onChange={(e) => setPromo({ ...promo, category: e.target.value || undefined })}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-maroon"
              >
                <option value="">Whole shop</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={promo.dark}
                onChange={(e) => setPromo({ ...promo, dark: e.target.checked })}
                className="size-4 accent-primary"
              />
              Dark maroon overlay
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <AdminButton
              onClick={() => {
                savePromo(promo);
                toast.success("Promo saved");
                setPromo(null);
              }}
            >
              Save tile
            </AdminButton>
            <AdminButton variant="ghost" onClick={() => setPromo(null)}>
              Cancel
            </AdminButton>
          </div>
        </Panel>
      )}

      <Panel
        title="Promo tiles"
        action={
          <AdminButton onClick={() => setPromo(newPromo())}>
            <Plus className="size-4" /> Add tile
          </AdminButton>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {promos.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-3">
              <img src={p.image} alt="" className="aspect-4/3 w-full rounded-lg object-cover" />
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-maroon">{p.eyebrow}</p>
              <p className="text-sm font-medium">
                {p.titleTop} {p.titleBottom}
              </p>
              <div className="mt-3 flex gap-2">
                <AdminButton variant="outline" onClick={() => setPromo({ ...p })}>
                  <Pencil className="size-3.5" /> Edit
                </AdminButton>
                <AdminButton
                  variant="danger"
                  onClick={() => {
                    deletePromo(p.id);
                    toast.success("Tile removed");
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}