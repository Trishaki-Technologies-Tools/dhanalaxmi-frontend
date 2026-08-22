import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken, removeAuthToken, getAuthToken } from "./api";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
};

type AuthContextValue = {
  phone: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  pendingOtp: string | null;
  pendingPhone: string | null;
  requestOtp: (phone: string) => string;
  verifyOtp: (code: string) => Promise<boolean>;
  login: (identifier: string, password?: string) => Promise<boolean>;
  register: (name: string, phone: string, email?: string, password?: string) => Promise<boolean>;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Sync profile on mount if token exists
  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.auth.getProfile();
          if (res.user) {
            setUser(res.user);
            setPhone(res.user.phone);
          }
        } catch (err) {
          // Token expired or invalid
          removeAuthToken();
        }
      } else {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) setPhone(raw);
        } catch {
          /* ignore */
        }
      }
      setHydrated(true);
    }
    loadProfile();
  }, []);

  const requestOtp = useCallback((raw: string) => {
    const normalized = normalizePhone(raw);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingPhone(normalized);
    setPendingOtp(code);
    return code;
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!pendingOtp || !pendingPhone) return false;
      if (code.replace(/\D/g, "") !== pendingOtp) return false;

      const targetPhone = pendingPhone;
      try {
        const res = await api.auth.loginOtp({ phone: targetPhone });
        if (res.token) {
          setAuthToken(res.token);
          setUser(res.user);
          setPhone(res.user.phone);
        }
      } catch (err) {
        // Fallback if network fails
        setPhone(targetPhone);
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, targetPhone);
      } catch {
        /* ignore */
      }
      setPendingOtp(null);
      setPendingPhone(null);
      return true;
    },
    [pendingOtp, pendingPhone]
  );

  const login = useCallback(async (identifier: string, password?: string) => {
    try {
      const payload: { email: string; password?: string } = { email: identifier };
      if (password) payload.password = password;
      const res = await api.auth.login(payload);
      if (res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        setPhone(res.user.phone);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, phone: string, email?: string, password?: string) => {
    try {
      const payload: { name: string; phone: string; email?: string; password?: string } = {
        name,
        phone: normalizePhone(phone),
      };
      if (email) payload.email = email;
      if (password) payload.password = password;

      const res = await api.auth.register(payload);
      if (res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        setPhone(res.user.phone);
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }, []);

  const cancelOtp = useCallback(() => {
    setPendingOtp(null);
    setPendingPhone(null);
  }, []);

  const signOut = useCallback(() => {
    setPhone(null);
    setUser(null);
    removeAuthToken();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      phone,
      user,
      isAuthenticated: Boolean(phone || user),
      hydrated,
      pendingOtp,
      pendingPhone,
      requestOtp,
      verifyOtp,
      login,
      register,
      cancelOtp,
      signOut,
    }),
    [phone, user, hydrated, pendingOtp, pendingPhone, requestOtp, verifyOtp, login, register, cancelOtp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
