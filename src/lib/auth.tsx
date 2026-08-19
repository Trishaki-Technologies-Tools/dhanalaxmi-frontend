import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  phone: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  /** Demo OTP shown on screen. Replace with an SMS provider later. */
  pendingOtp: string | null;
  pendingPhone: string | null;
  requestOtp: (phone: string) => string;
  verifyOtp: (code: string) => boolean;
  cancelOtp: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "dj-auth-v1";

export function normalizePhone(input: string) {
  return input.replace(/\D/g, "").slice(-10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPhone(raw);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const requestOtp = useCallback((raw: string) => {
    const normalized = normalizePhone(raw);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingPhone(normalized);
    setPendingOtp(code);
    return code;
  }, []);

  const verifyOtp = useCallback(
    (code: string) => {
      if (!pendingOtp || !pendingPhone) return false;
      if (code.replace(/\D/g, "") !== pendingOtp) return false;
      setPhone(pendingPhone);
      try {
        window.localStorage.setItem(STORAGE_KEY, pendingPhone);
      } catch {
        /* ignore */
      }
      setPendingOtp(null);
      setPendingPhone(null);
      return true;
    },
    [pendingOtp, pendingPhone],
  );

  const cancelOtp = useCallback(() => {
    setPendingOtp(null);
    setPendingPhone(null);
  }, []);

  const signOut = useCallback(() => {
    setPhone(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      phone,
      isAuthenticated: Boolean(phone),
      hydrated,
      pendingOtp,
      pendingPhone,
      requestOtp,
      verifyOtp,
      cancelOtp,
      signOut,
    }),
    [phone, hydrated, pendingOtp, pendingPhone, requestOtp, verifyOtp, cancelOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
