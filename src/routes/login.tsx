import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/site/auth-layout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content: "Sign in to your Dhanalaxmi Jeweler's account to track orders, manage wishlists and access exclusive previews.",
      },
      { property: "og:title", content: "Sign In — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Access your account for orders, wishlists and private silver previews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track orders, save your wishlist, and receive private previews first."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="space-y-2"
        >
          <label htmlFor="email" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
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
              placeholder="Enter your password"
              className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/10"
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
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex items-center justify-between"
        >
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="size-4 rounded-md border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link
            to="/login"
            className="text-sm text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          type="submit"
          className="btn-luxe shine-sweep flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
        >
          Sign In <ArrowRight className="size-4" />
        </motion.button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease }}
        className="mt-8"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-warm-white px-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm transition-colors hover:bg-maroon-soft hover:border-maroon/40 active:bg-maroon-soft"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm transition-colors hover:bg-maroon-soft hover:border-maroon/40 active:bg-maroon-soft"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.04 4.06-.84 1.45.17 2.46.84 3.18 1.73-2.89 1.68-2.39 5.98.22 7.13-.57 1.5-1.31 2.99-2.54 4.21zM12.03 7.25c-.15-2.55 2.11-4.69 4.65-4.74.35 2.8-2.29 5.05-4.65 4.74z" />
            </svg>
            Apple
          </button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline"
        >
          Create one
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
