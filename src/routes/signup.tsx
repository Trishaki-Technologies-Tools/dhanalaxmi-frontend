import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/auth-layout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content: "Join Dhanalaxmi Jeweler's for exclusive previews, saved wishlists, insured checkout and lifetime polish care.",
      },
      { property: "og:title", content: "Create Account — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Create your account for wishlists, private previews and concierge care.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      toast.error("Please fill in your name, mobile number, and password.");
      return;
    }

    setLoading(true);
    try {
      await register(name, phone, email, password);
      toast.success("Account created successfully!");
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Mobile number or email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join our world of hallmarked silver — save wishlists, track orders, and unlock private previews."
    >
      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="space-y-2"
        >
          <label htmlFor="name" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="space-y-2"
        >
          <label htmlFor="phone" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Mobile number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="space-y-2"
        >
          <label htmlFor="email" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Email address (optional)
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease }}
          className="space-y-2"
        >
          <label htmlFor="password" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-maroon"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease }}
          className="flex items-start gap-3"
        >
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 size-4 rounded-md border-border accent-primary"
          />
          <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
            I agree to the{" "}
            <Link to="/" className="text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/" className="text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease }}
          type="submit"
          disabled={loading}
          className="btn-luxe shine-sweep flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating Account
            </>
          ) : (
            <>
              Create Account <ArrowRight className="size-4" />
            </>
          )}
        </motion.button>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease }}
        className="mt-5 text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline"
        >
          Sign in
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
