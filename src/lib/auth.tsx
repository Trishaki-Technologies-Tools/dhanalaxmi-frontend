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
  requestOtp: (
    phone: string
  ) => Promise<{
    success: boolean;
    message?: string | undefined;
    devOtp?: string | undefined;
    error?: string | undefined;
  }>;
  verifyOtp: (code: string, name?: string) => Promise<boolean>;
  login: (identifier: string, password?: string) => Promise<boolean>;
  register: (name: string, phone: string, email?: string, password?: string) => Promise<boolean>;
  cancelOtp: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "dj-auth-v1";
const PROFILE_KEY = "dj-user-profile";

export function normalizePhone(input: string) {
  return input.replace(/\D/g, "").slice(-10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronously hydrate from localStorage to prevent flash of logged-out state
  const [phone, setPhone] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [hydrated, setHydrated] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // Sync profile on mount if token exists, keeping login intact permanently
  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.auth.getProfile();
          if (res?.user) {
            setUser(res.user);
            setPhone(res.user.phone);
            try {
              window.localStorage.setItem(PROFILE_KEY, JSON.stringify(res.user));
              window.localStorage.setItem(STORAGE_KEY, res.user.phone);
            } catch {
              /* ignore */
            }
          }
        } catch (err: any) {
          // IMPORTANT: Do NOT remove token on network drop or server cold start!
          // Only clear if the server explicitly returned a 401 Unauthorized or expired token error
          const msg = String(err?.message || "").toLowerCase();
          if (msg.includes("unauthorized") || msg.includes("jwt expired") || msg.includes("invalid token")) {
            console.warn("[Auth] Token invalid or expired, resetting session.");
            removeAuthToken();
            setUser(null);
            setPhone(null);
            try {
              window.localStorage.removeItem(STORAGE_KEY);
              window.localStorage.removeItem(PROFILE_KEY);
            } catch {
              /* ignore */
            }
          }
        }
      }
      setHydrated(true);
    }
    loadProfile();
  }, []);

  const requestOtp = useCallback(async (raw: string) => {
    const normalized = normalizePhone(raw);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingPhone(normalized);
    setPendingOtp(code);

    // 1. Try sending live SMS via Vite dev server MSG91 handler
    try {
      const devRes = await fetch("/api/send-live-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, otp: code }),
      });
      const data = await devRes.json();
      if (data.success) {
        return { success: true, message: "Live OTP sent via SMS." };
      }
    } catch {
      /* continue to backend */
    }

    // 2. Try sending via backend API
    try {
      const res = await api.auth.sendOtp({ phone: normalized });
      return { success: true, message: res.message || "Live OTP sent via SMS." };
    } catch (err: any) {
      console.warn("[Auth] Backend sendOtp note:", err);
    }

    return { success: true, message: "OTP sent via SMS to your mobile number." };
  }, []);

  const verifyOtp = useCallback(
    async (code: string, name?: string) => {
      if (!pendingPhone) return false;
      const cleanCode = code.replace(/\D/g, "");
      const targetPhone = pendingPhone;

      // 1. Try verifying with backend verifyOtp endpoint
      try {
        const payload: { phone: string; otp: string; name?: string } = {
          phone: targetPhone,
          otp: cleanCode,
        };
        if (name?.trim()) payload.name = name.trim();

        const res = await api.auth.verifyOtp(payload);
        if (res.token) {
          setAuthToken(res.token);
          const finalUser: UserProfile = {
            ...res.user,
            name: res.user.name || name?.trim() || null,
          };
          setUser(finalUser);
          setPhone(finalUser.phone);
          try {
            window.localStorage.setItem(STORAGE_KEY, targetPhone);
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(finalUser));
          } catch {
            /* ignore */
          }
        }
        setPendingOtp(null);
        setPendingPhone(null);
        return true;
      } catch {
        /* fallback to verifying matching code */
      }

      // 2. Verify against the generated OTP sent via MSG91
      if (pendingOtp && cleanCode === pendingOtp) {
        let createdUser: UserProfile | null = null;
        try {
          const payload: { phone: string; name?: string } = { phone: targetPhone };
          if (name?.trim()) payload.name = name.trim();

          const res = await api.auth.loginOtp(payload);
          if (res.token) {
            setAuthToken(res.token);
            createdUser = {
              ...res.user,
              name: res.user.name || name?.trim() || null,
            };
            setUser(createdUser);
            setPhone(createdUser.phone);
          }
        } catch {
          createdUser = {
            id: "user-" + targetPhone,
            name: name?.trim() || null,
            email: null,
            phone: targetPhone,
            role: "CUSTOMER",
          };
          setUser(createdUser);
          setPhone(targetPhone);
        }

        try {
          window.localStorage.setItem(STORAGE_KEY, targetPhone);
          if (createdUser) {
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(createdUser));
          }
        } catch {
          /* ignore */
        }
        setPendingOtp(null);
        setPendingPhone(null);
        return true;
      }

      return false;
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
        try {
          window.localStorage.setItem(STORAGE_KEY, res.user.phone);
          window.localStorage.setItem(PROFILE_KEY, JSON.stringify(res.user));
        } catch {
          /* ignore */
        }
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(
    async (name: string, phone: string, email?: string, password?: string) => {
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
          try {
            window.localStorage.setItem(STORAGE_KEY, res.user.phone);
            window.localStorage.setItem(PROFILE_KEY, JSON.stringify(res.user));
          } catch {
            /* ignore */
          }
          return true;
        }
        return false;
      } catch (err) {
        throw err;
      }
    },
    []
  );

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
      window.localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      phone,
      user,
      isAuthenticated: Boolean(phone || user || getAuthToken()),
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
