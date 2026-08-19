import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/orders";
import { useProfile, type Address } from "@/lib/profile";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Profile & Address Book — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Manage your Dhanalaxmi Jeweler's profile details and saved delivery addresses for faster silver jewellery checkout.",
      },
      { property: "og:title", content: "My Profile & Address Book — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Edit your profile and keep multiple saved addresses for one-tap checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/25";

type Draft = Omit<Address, "id">;

const emptyDraft: Draft = {
  label: "Home",
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

function AccountPage() {
  const { isAuthenticated, hydrated, phone, signOut } = useAuth();
  const { orders } = useOrders();
  const {
    profile,
    addresses,
    saveProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  } = useProfile();

  const [form, setForm] = useState(profile);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-maroon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center lg:px-10">
        <Phone className="mx-auto size-6 text-maroon" />
        <h1 className="mt-4 font-display text-4xl">Sign in to view your profile</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Verify your mobile number with an OTP to manage your profile and address book.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          Sign in with phone
        </Link>
      </div>
    );
  }

  const startEdit = (a: Address) => {
    setEditingId(a.id);
    setDraft({
      label: a.label,
      name: a.name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      pincode: a.pincode,
      isDefault: a.isDefault ?? false,
    });
    setShowForm(true);
  };

  const submitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateAddress(editingId, draft);
      toast.success("Address updated");
    } else {
      addAddress(draft);
      toast.success("Address saved to your address book");
    }
    setEditingId(null);
    setDraft(emptyDraft);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-[76rem] px-6 py-20 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-eyebrow text-maroon">My account</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">
            {profile.name || "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            +91 {phone} · {orders.length} order{orders.length === 1 ? "" : "s"} placed
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-2 rounded-full border border-maroon/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon transition-colors hover:bg-maroon-soft"
          >
            <Package className="size-3.5" /> Order history
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-maroon hover:text-maroon"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[24rem_1fr] lg:items-start">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="luxe-card p-7"
        >
          <h2 className="flex items-center gap-2 font-display text-2xl">
            <UserRound className="size-4 text-maroon" /> Profile
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile(form);
              toast.success("Profile saved");
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label htmlFor="pname" className="text-eyebrow">
                Full name
              </label>
              <input
                id="pname"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pemail" className="text-eyebrow">
                Email
              </label>
              <input
                id="pemail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pphone" className="text-eyebrow">
                Phone
              </label>
              <input id="pphone" value={phone ?? ""} readOnly className={`${inputClass} opacity-70`} />
            </div>
            <div>
              <label htmlFor="pbday" className="text-eyebrow">
                Birthday
              </label>
              <input
                id="pbday"
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
            >
              Save profile
            </button>
          </form>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="luxe-card p-7 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <MapPin className="size-4 text-maroon" /> Address book
            </h2>
            <button
              onClick={() => {
                setEditingId(null);
                setDraft({ ...emptyDraft, name: profile.name, phone: phone ?? "" });
                setShowForm((v) => !v);
              }}
              className="flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-maroon-deep"
            >
              <Plus className="size-3.5" /> Add address
            </button>
          </div>

          {showForm ? (
            <form onSubmit={submitAddress} className="mt-6 grid gap-4 rounded-2xl bg-maroon-soft/50 p-5 sm:grid-cols-2">
              <div>
                <label className="text-eyebrow" htmlFor="alabel">
                  Label
                </label>
                <input
                  id="alabel"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="Home / Office"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-eyebrow" htmlFor="aname">
                  Full name
                </label>
                <input
                  id="aname"
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-eyebrow" htmlFor="aaddr">
                  Address
                </label>
                <input
                  id="aaddr"
                  required
                  value={draft.address}
                  onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-eyebrow" htmlFor="acity">
                  City
                </label>
                <input
                  id="acity"
                  required
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-eyebrow" htmlFor="apin">
                  PIN code
                </label>
                <input
                  id="apin"
                  required
                  value={draft.pincode}
                  onChange={(e) => setDraft({ ...draft, pincode: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-eyebrow" htmlFor="aphone">
                  Phone
                </label>
                <input
                  id="aphone"
                  required
                  value={draft.phone}
                  onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
                >
                  {editingId ? "Update address" : "Save address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="rounded-full border border-border px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-maroon hover:text-maroon"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {addresses.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No saved addresses yet. Save one and checkout will fill itself in.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {addresses.map((a) => (
                <article
                  key={a.id}
                  className={`rounded-2xl border p-5 ${
                    a.isDefault ? "border-maroon bg-maroon-soft/40" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon">
                      {a.label || "Address"}
                    </p>
                    {a.isDefault ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-maroon">
                        <BadgeCheck className="size-3.5" /> Default
                      </span>
                    ) : null}
                  </div>
                  <address className="mt-3 space-y-1 text-sm not-italic text-muted-foreground">
                    <p className="text-foreground">{a.name}</p>
                    <p>{a.address}</p>
                    <p>
                      {a.city} {a.pincode}
                    </p>
                    <p>+91 {a.phone}</p>
                  </address>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    <button
                      onClick={() => startEdit(a)}
                      className="flex items-center gap-1.5 text-maroon hover:underline"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </button>
                    {!a.isDefault ? (
                      <button
                        onClick={() => {
                          setDefaultAddress(a.id);
                          toast.success("Default address updated");
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-maroon"
                      >
                        <Star className="size-3.5" /> Set default
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        removeAddress(a.id);
                        toast.success("Address removed");
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-maroon"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
