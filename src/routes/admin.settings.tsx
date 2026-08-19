import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { resetCatalog, saveSettings, useCatalog, type StoreSettings } from "@/lib/catalog-store";
import { useAdmin } from "@/lib/admin";
import { AdminButton, Field, Panel, TextArea } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { settings, categories } = useCatalog();
  const { updateCredentials, email } = useAdmin();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [nextEmail, setNextEmail] = useState(email ?? "");
  const [nextPassword, setNextPassword] = useState("");

  useEffect(() => setDraft(settings), [settings]);

  const set = (patch: Partial<StoreSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleList = (key: "popularCategories" | "homeCategoryOrder", slug: string) => {
    const list = draft[key];
    set({
      [key]: list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug],
    } as Partial<StoreSettings>);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-maroon">Configuration</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Brand details, charges and which categories appear on the homepage.
        </p>
      </div>

      <Panel title="Store details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Brand name"
            value={draft.brandName}
            onChange={(v) => set({ brandName: v })}
          />
          <Field
            label="Support phone"
            value={draft.supportPhone}
            onChange={(v) => set({ supportPhone: v })}
          />
          <Field
            label="Support email"
            value={draft.supportEmail}
            onChange={(v) => set({ supportEmail: v })}
          />
          <Field
            label="COD handling fee (₹)"
            type="number"
            value={draft.codFee}
            onChange={(v) => set({ codFee: Number(v) })}
          />
          <Field
            label="Free shipping above (₹)"
            type="number"
            value={draft.freeShippingAbove}
            onChange={(v) => set({ freeShippingAbove: Number(v) })}
          />
          <TextArea
            label="Announcement"
            value={draft.announcement}
            onChange={(v) => set({ announcement: v })}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Popular categories strip
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => toggleList("popularCategories", c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    draft.popularCategories.includes(c.slug)
                      ? "border-maroon bg-maroon text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-maroon"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Homepage product sections
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => toggleList("homeCategoryOrder", c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    draft.homeCategoryOrder.includes(c.slug)
                      ? "border-maroon bg-maroon text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-maroon"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AdminButton
            onClick={() => {
              saveSettings(draft);
              toast.success("Settings saved");
            }}
          >
            Save settings
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => {
              resetCatalog();
              toast.success("Catalogue reset to defaults");
            }}
          >
            Reset catalogue to defaults
          </AdminButton>
        </div>
      </Panel>

      <Panel title="Admin credentials">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Admin email" value={nextEmail} onChange={setNextEmail} />
          <Field
            label="New password"
            type="password"
            value={nextPassword}
            placeholder="Leave blank to keep current"
            onChange={setNextPassword}
          />
        </div>
        <div className="mt-5">
          <AdminButton
            onClick={() => {
              if (!nextEmail.trim()) {
                toast.error("Email is required");
                return;
              }
              updateCredentials(nextEmail.trim(), nextPassword || undefined);
              setNextPassword("");
              toast.success("Credentials updated");
            }}
          >
            Update credentials
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
}