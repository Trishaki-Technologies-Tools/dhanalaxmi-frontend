import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, KeyRound, Phone, RotateCcw, User, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/auth-layout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content: "Join Dhanalaxmi Jeweler's with your mobile number and OTP for saved wishlists, express checkout and lifetime silver care.",
      },
      { property: "og:title", content: "Create Account — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Instant mobile OTP account creation for Dhanalaxmi Jeweler's hallmarked silver heirlooms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

const fieldClass =
  "h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-maroon/60 focus:ring-1 focus:ring-maroon/20";

function SignupPage() {
  const navigate = useNavigate();
  const { pendingOtp, pendingPhone, requestOtp, verifyOtp, cancelOtp } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("phone");
      return p ? p.replace(/\D/g, "").slice(-10) : "";
    } catch {
      return "";
    }
  });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"info" | "otp">("info");
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-bot check: silent drop if honeypot is filled
    if (botTrap) {
      console.warn("Bot detected via honeypot.");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter your full name (minimum 2 characters).");
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

    if (!agreedTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    // 3. Cooldown check
    if (countdown > 0) {
      toast.warning(`Please wait ${countdown}s before requesting a new OTP.`);
      return;
    }

    setLoading(true);
    try {
      await requestOtp(normalized, "signup");
      setCode("");
      setCountdown(60);
      setStep("otp");
      toast.success("OTP sent via SMS to +91 " + normalized);
    } catch (err: any) {
      const msg = err?.message || "";
      if (
        msg.includes("already exists") ||
        msg.includes("Please sign in") ||
        err?.status === 409
      ) {
        toast.info("An account already exists with this mobile number. Redirecting to Sign In...");
        setTimeout(() => {
          window.location.href = `/login?phone=${encodeURIComponent(normalized)}`;
        }, 1200);
      } else {
        toast.error(msg || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit OTP received on your mobile.");
      return;
    }

    setLoading(true);
    try {
      // Pass customer name and signup intent
      const success = await verifyOtp(code, name.trim(), "signup");
      if (!success) {
        toast.error("Incorrect OTP. Please check the code received on SMS.");
        return;
      }

      toast.success(`Welcome to Dhanalaxmi Jeweller's, ${name.trim()}!`);
      // DIRECT LOGIN: navigate straight to boutique without hitting signin page
      navigate({ to: "/shop" });
    } catch (err: any) {
      toast.error(err.message || "Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    const clean = phone.replace(/\D/g, "");
    const normalized = clean.length === 12 && clean.startsWith("91") ? clean.slice(2) : clean;
    setLoading(true);
    try {
      await requestOtp(normalized);
      setCountdown(60);
      toast.success("New OTP sent to your mobile number.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInfo = () => {
    cancelOtp();
    setStep("info");
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Dhanalaxmi Jeweler's — verified instantly via SMS. No passwords to remember."
    >
      <AnimatePresence mode="wait">
        {step === "info" ? (
          <motion.form
            key="info-step"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease }}
            className="space-y-4"
            onSubmit={handleSendOtp}
          >
            {/* Honeypot field invisible to humans, catches spambots */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_url"
                value={botTrap}
                onChange={(e) => setBotTrap(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  required
                  maxLength={13}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={fieldClass}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  +91 (India)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                We will send a 6-digit OTP code to this number via SMS.
              </p>
            </div>

            {/* Terms of Service & Privacy Policy Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-maroon"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-maroon underline underline-offset-2 hover:text-maroon-deep"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-maroon underline underline-offset-2 hover:text-maroon-deep"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !phone.trim()}
              className="btn-luxe shine-sweep mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
            >
              {loading ? "Sending OTP via SMS..." : "Get OTP & Verify"}
              <ArrowRight className="size-4" />
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-step"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease }}
            className="space-y-4"
            onSubmit={handleCreateAccount}
          >
            {/* User Greeting & Mobile summary banner */}
            <div className="rounded-xl border border-maroon/20 bg-[#F6D7B0]/30 p-3.5 text-xs text-maroon">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Namaste, {name}!</p>
                  <p className="text-maroon/80 mt-0.5">
                    OTP sent to <span className="font-mono font-medium">+91 {phone.replace(/\D/g, "").slice(-10)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToInfo}
                  className="text-[11px] font-semibold text-maroon underline underline-offset-2 hover:text-maroon-deep"
                >
                  Change
                </button>
              </div>
            </div>

            {/* 6-Digit OTP Field */}
            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Enter 6-digit OTP
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="· · · · · ·"
                  className={`${fieldClass} text-center font-mono text-lg tracking-[0.35em]`}
                />
              </div>
            </div>

            {/* Resend OTP Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {countdown > 0 ? (
                <span className="text-muted-foreground">Resend OTP in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center gap-1 font-medium text-maroon underline-offset-4 hover:underline"
                >
                  <RotateCcw className="size-3" /> Resend OTP via SMS
                </button>
              )}
              <span className="text-[11px] text-muted-foreground/80">Valid for 10 minutes</span>
            </div>

            {/* Direct Login Button */}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-luxe shine-sweep mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-maroon-deep active:bg-maroon-deep disabled:opacity-50"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Create Account & Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToInfo}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to Details
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-maroon" />
        <span>Permanent secure login · You stay signed in until you choose to log out</span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
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
