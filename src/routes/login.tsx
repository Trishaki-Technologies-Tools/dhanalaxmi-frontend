import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, KeyRound, Phone, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/auth-layout";
import { useAuth, normalizePhone } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Sign in with your phone number and OTP to track orders, manage wishlists and access exclusive previews at Dhanalaxmi Jeweler's.",
      },
      { property: "og:title", content: "Sign In — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Phone + OTP sign in for orders, wishlists and private silver previews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

const fieldClass =
  "h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/20";

function LoginPage() {
  const navigate = useNavigate();
  const { pendingOtp, pendingPhone, requestOtp, verifyOtp, cancelOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    requestOtp(normalized);
    setCode("");
    toast.success("OTP generated — shown below for testing.");
  };

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtp(code);
    if (!success) {
      toast.error("Incorrect OTP. Please try again.");
      return;
    }
    toast.success("Signed in successfully.");
    navigate({ to: "/orders" });
  };

  return (
    <AuthLayout
      title={pendingOtp ? "Enter your OTP" : "Sign in with your phone"}
      subtitle={
        pendingOtp
          ? `We sent a 6-digit code to +91 ${pendingPhone}. Enter it below to continue.`
          : "Use your mobile number — we'll send a one-time password to verify it."
      }
    >
      {!pendingOtp ? (
        <form className="space-y-4" onSubmit={sendOtp}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
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
                inputMode="numeric"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className={fieldClass}
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            type="submit"
            className="btn-luxe shine-sweep flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Send OTP <ArrowRight className="size-4" />
          </motion.button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={confirmOtp}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="rounded-xl border border-maroon/30 bg-maroon-soft px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-maroon">Test mode OTP</p>
            <p className="font-price mt-1 text-2xl tracking-[0.32em] text-maroon">{pendingOtp}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Displayed here for testing — SMS delivery will be wired later.
            </p>
          </motion.div>

          <div className="space-y-2">
            <label htmlFor="otp" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              One-time password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
              <input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                className={`${fieldClass} tracking-[0.3em]`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-luxe shine-sweep flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Verify & continue <ArrowRight className="size-4" />
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={cancelOtp}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline"
            >
              Change number
            </button>
            <button
              type="button"
              onClick={() => {
                requestOtp(pendingPhone ?? phone);
                setCode("");
                toast.success("New OTP generated.");
              }}
              className="flex items-center gap-1.5 text-maroon underline-offset-4 hover:underline"
            >
              <RotateCcw className="size-3.5" /> Resend OTP
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Dhanalaxmi?{" "}
        <Link
          to="/signup"
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-maroon hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
