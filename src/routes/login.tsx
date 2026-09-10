import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, KeyRound, Phone, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [botTrap, setBotTrap] = useState("");
  const [countdown, setCountdown] = useState(0);

  // 60-second cooldown timer for SMS OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-bot check: silent drop if honeypot is filled
    if (botTrap) {
      console.warn("Bot detected via honeypot.");
      return;
    }

    // 1. Strict Indian Mobile Validation (TRAI standards)
    const clean = phone.replace(/\D/g, "");
    const normalized = clean.length === 12 && clean.startsWith("91") ? clean.slice(2) : clean;

    if (normalized.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^[6-9]/.test(normalized)) {
      toast.error("Invalid mobile number. Indian mobile numbers must start with 6, 7, 8, or 9.");
      return;
    }

    // 2. Reject obvious fake patterns
    const dummyPatterns = ["9876543210", "9876543211", "9123456789", "9000000000", "8000000000", "7000000000"];
    if (/^(\d)\1{9}$/.test(normalized) || dummyPatterns.includes(normalized)) {
      toast.error("Please enter a valid personal mobile number.");
      return;
    }

    // 3. Cooldown check
    if (countdown > 0) {
      toast.warning(`Please wait ${countdown}s before requesting a new OTP.`);
      return;
    }

    setLoading(true);
    try {
      await requestOtp(normalized);
      setCode("");
      setCountdown(60); // start 60s cooldown
      toast.success("OTP sent via SMS to your mobile number.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const success = await verifyOtp(code);
      if (!success) {
        toast.error("Incorrect OTP. Please check the code received on SMS.");
        return;
      }
      toast.success("Signed in successfully.");
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={pendingOtp ? "Enter your OTP" : "Sign in with your phone"}
      subtitle={
        pendingOtp
          ? `We sent a 6-digit verification code to +91 ${pendingPhone}.`
          : "Use your mobile number — we'll send a one-time password to verify it."
      }
    >
      {!pendingOtp ? (
        <form className="space-y-4" onSubmit={sendOtp}>
          {/* Invisible honeypot trap for automated bots */}
          <input
            type="text"
            name="company_website"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

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
            disabled={loading}
            className="btn-luxe shine-sweep flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
          >
            {loading ? "Sending SMS OTP..." : "Get OTP on SMS"} <ArrowRight className="size-4" />
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
            className="rounded-xl border border-maroon/20 bg-maroon-soft/60 px-4 py-3"
          >
            <p className="text-xs font-medium text-maroon">
              SMS sent to <strong>+91 {pendingPhone}</strong>. It is valid for 10 minutes.
            </p>
          </motion.div>

          <div className="space-y-2">
            <label htmlFor="otp" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              6-digit OTP
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
                placeholder="Enter 6-digit code"
                className={`${fieldClass} tracking-[0.3em]`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-luxe shine-sweep flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"} <ArrowRight className="size-4" />
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
              disabled={loading || countdown > 0}
              onClick={async () => {
                if (countdown > 0) return;
                const target = pendingPhone ?? phone;
                setLoading(true);
                try {
                  await requestOtp(target);
                  setCode("");
                  setCountdown(60);
                  toast.success("New OTP sent via SMS.");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center gap-1.5 text-maroon underline-offset-4 hover:underline disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              {countdown > 0 ? `Resend OTP (${countdown}s)` : "Resend OTP"}
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
