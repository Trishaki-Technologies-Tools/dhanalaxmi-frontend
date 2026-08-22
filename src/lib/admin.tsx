import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken, removeAuthToken } from "@/lib/api";

/** Demo-only admin credentials. Replace with real backend auth later. */
export const ADMIN_EMAIL = "admin@dhanalaxmi.com";
export const ADMIN_PASSWORD = "admin123";

const STORAGE_KEY = "dj-admin-v1";
const CREDS_KEY = "dj-admin-creds-v1";

type Creds = { email: string; password: string };

function readCreds(): Creds {
  try {
    const raw = window.localStorage.getItem(CREDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Creds>;
      if (parsed.email && parsed.password) return { email: parsed.email, password: parsed.password };
    }
  } catch {
    /* ignore */
  }
  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
}

type AdminContextValue = {
  email: string | null;
  isAdmin: boolean;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  updateCredentials: (email: string, password?: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const token = window.localStorage.getItem("dj-auth-token");
        if (token) {
          const res = await api.auth.getProfile();
          if (res.user && res.user.role === "ADMIN") {
            setEmail(res.user.email);
            setHydrated(true);
            return;
          }
        }
      } catch (err) {
        /* ignore */
      }
      setEmail(null);
      setHydrated(true);
    }
    init();
  }, []);

  const signIn = useCallback(async (inputEmail: string, password: string) => {
    try {
      const res = await api.auth.login({ email: inputEmail, password });
      if (res.token && res.user && res.user.role === "ADMIN") {
        setAuthToken(res.token);
        setEmail(res.user.email);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const updateCredentials = useCallback((nextEmail: string, nextPassword?: string) => {
    const current = readCreds();
    const creds: Creds = {
      email: nextEmail.trim().toLowerCase(),
      password: nextPassword || current.password,
    };
    try {
      window.localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
      window.localStorage.setItem(STORAGE_KEY, creds.email);
    } catch {
      /* ignore */
    }
    setEmail(creds.email);
  }, []);

  const signOut = useCallback(() => {
    setEmail(null);
    removeAuthToken();
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({ email, isAdmin: Boolean(email), hydrated, signIn, signOut, updateCredentials }),
    [email, hydrated, signIn, signOut, updateCredentials],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}