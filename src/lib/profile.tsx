import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
};

export type Profile = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
};

type Store = { profile: Profile; addresses: Address[] };

type ProfileContextValue = {
  profile: Profile;
  addresses: Address[];
  defaultAddress: Address | undefined;
  saveProfile: (patch: Partial<Profile>) => void;
  addAddress: (input: Omit<Address, "id">) => Address;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);
const KEY_PREFIX = "dj-profile-v1:";

const emptyStore = (phone: string | null): Store => ({
  profile: { name: "", email: "", phone: phone ?? "", birthday: "" },
  addresses: [],
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { phone } = useAuth();
  const [store, setStore] = useState<Store>(() => emptyStore(phone));

  const storageKey = phone ? `${KEY_PREFIX}${phone}` : null;

  useEffect(() => {
    if (!storageKey) {
      setStore(emptyStore(phone));
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as Store) : null;
      setStore(
        parsed && typeof parsed === "object"
          ? {
              profile: { ...emptyStore(phone).profile, ...parsed.profile },
              addresses: Array.isArray(parsed.addresses) ? parsed.addresses : [],
            }
          : emptyStore(phone),
      );
    } catch {
      setStore(emptyStore(phone));
    }
  }, [storageKey, phone]);

  const commit = useCallback(
    (next: Store) => {
      setStore(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const saveProfile = useCallback(
    (patch: Partial<Profile>) => commit({ ...store, profile: { ...store.profile, ...patch } }),
    [commit, store],
  );

  const addAddress = useCallback(
    (input: Omit<Address, "id">) => {
      const created: Address = {
        ...input,
        id: `A${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        isDefault: input.isDefault || store.addresses.length === 0,
      };
      const addresses = created.isDefault
        ? [...store.addresses.map((a) => ({ ...a, isDefault: false })), created]
        : [...store.addresses, created];
      commit({ ...store, addresses });
      return created;
    },
    [commit, store],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<Address>) =>
      commit({
        ...store,
        addresses: store.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }),
    [commit, store],
  );

  const removeAddress = useCallback(
    (id: string) => commit({ ...store, addresses: store.addresses.filter((a) => a.id !== id) }),
    [commit, store],
  );

  const setDefaultAddress = useCallback(
    (id: string) =>
      commit({
        ...store,
        addresses: store.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      }),
    [commit, store],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile: store.profile,
      addresses: store.addresses,
      defaultAddress: store.addresses.find((a) => a.isDefault) ?? store.addresses[0],
      saveProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [store, saveProfile, addAddress, updateAddress, removeAddress, setDefaultAddress],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
