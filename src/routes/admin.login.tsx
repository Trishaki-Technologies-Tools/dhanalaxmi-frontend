import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { ADMIN_EMAIL, ADMIN_PASSWORD, useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Dhanalaxmi Jeweler's" },
      { name: "description", content: "Secure sign in for the Dhanalaxmi Jeweler's admin console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { signIn } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(email, password);
    if (success) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    setError("Those credentials don't match an admin account.");
  };

  return (
    <div className="grid min-h-screen bg-maroon-deep lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <p className="font-display text-2xl">Dhanalaxmi Jeweler's</p>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-70">Admin Console</p>
          <h1 className="mt-4 max-w-md font-display text-5xl leading-[1.05]">
            Manage every gram of the house.
          </h1>
          <p className="mt-5 max-w-sm text-sm opacity-80">
            Catalogue, categories, landing-page banners, promotions, orders and customers — all from
            one console.
          </p>
        </div>
        <p className="text-xs opacity-60">Authorised personnel only</p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-14">
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={submit}
          className="w-full max-w-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-maroon/25 bg-maroon-soft px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-maroon">
            <ShieldCheck className="size-3.5" /> Secure area
          </span>
          <h2 className="mt-5 font-display text-3xl">Admin sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your admin credentials to open the dashboard.
          </p>

          <label className="mt-7 block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border px-3 focus-within:border-maroon focus-within:ring-1 focus-within:ring-maroon/30">
              <Mail className="size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dhanalaxmi.com"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                required
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Password
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border px-3 focus-within:border-maroon focus-within:ring-1 focus-within:ring-maroon/30">
              <Lock className="size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                required
              />
            </div>
          </label>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            className="btn-luxe mt-7 w-full rounded-full bg-maroon py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Sign in to dashboard
          </button>

          <div className="mt-6 rounded-lg border border-dashed border-maroon/30 bg-maroon-soft/50 p-4 text-xs text-muted-foreground">
            <p className="font-semibold uppercase tracking-[0.16em] text-maroon">Demo access</p>
            <p className="mt-1.5">
              {ADMIN_EMAIL} · {ADMIN_PASSWORD}
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}