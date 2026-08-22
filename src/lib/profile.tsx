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
import { api } from "@/lib/api";

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
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  addAddress: (input: Omit<Address, "id">) => Promise<Address>;
  updateAddress: (id: string, patch: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const emptyStore = (phone: string | null): Store => ({
  profile: { name: "", email: "", phone: phone ?? "", birthday: "" },
  addresses: [],
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { phone, isAuthenticated } = useAuth();
  const [store, setStore] = useState<Store>(() => emptyStore(phone));

  useEffect(() => {
    if (!isAuthenticated) {
      setStore(emptyStore(phone));
      return;
    }

    async function loadData() {
      try {
        const [profileRes, addressRes] = await Promise.all([
          api.auth.getProfile(),
          api.addresses.getAll(),
        ]);

        const user = profileRes.user;
        const addresses = addressRes.addresses;

        setStore({
          profile: {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || phone || "",
            birthday: user.birthday ? (new Date(user.birthday).toISOString().split("T")[0] ?? "") : "",
          },
          addresses: addresses.map((a: any) => ({
            id: String(a.id),
            label: a.label,
            name: a.name,
            phone: a.phone,
            address: a.address,
            city: a.city,
            pincode: a.pincode,
            isDefault: a.isDefault,
          })),
        });
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    }

    loadData();
  }, [isAuthenticated, phone]);

  const saveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      try {
        const res = await api.auth.updateProfile(patch);
        const user = res.user;
        setStore((s) => ({
          ...s,
          profile: {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || phone || "",
            birthday: user.birthday ? (new Date(user.birthday).toISOString().split("T")[0] ?? "") : "",
          },
        }));
      } catch (err) {
        console.error("Failed to update profile", err);
      }
    },
    [phone],
  );

  const addAddress = useCallback(
    async (input: Omit<Address, "id">) => {
      try {
        const res = await api.addresses.create(input);
        const a = res.address;
        const newAddress: Address = {
          id: String(a.id),
          label: a.label,
          name: a.name,
          phone: a.phone,
          address: a.address,
          city: a.city,
          pincode: a.pincode,
          isDefault: a.isDefault,
        };
        setStore((s) => ({
          ...s,
          addresses: newAddress.isDefault
            ? [...s.addresses.map((x) => ({ ...x, isDefault: false })), newAddress]
            : [...s.addresses, newAddress],
        }));
        return newAddress;
      } catch (err) {
        console.error("Failed to add address", err);
        throw err;
      }
    },
    [],
  );

  const updateAddress = useCallback(
    async (id: string, patch: Partial<Address>) => {
      try {
        const res = await api.addresses.update(id, patch);
        const a = res.address;
        setStore((s) => ({
          ...s,
          addresses: s.addresses.map((x) => (x.id === id ? { ...x, ...patch, isDefault: a.isDefault } : x)),
        }));
      } catch (err) {
        console.error("Failed to update address", err);
      }
    },
    [],
  );

  const removeAddress = useCallback(
    async (id: string) => {
      try {
        await api.addresses.delete(id);
        setStore((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }));
      } catch (err) {
        console.error("Failed to delete address", err);
      }
    },
    [],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      try {
        await api.addresses.update(id, { isDefault: true });
        setStore((s) => ({
          ...s,
          addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        }));
      } catch (err) {
        console.error("Failed to set default address", err);
      }
    },
    [],
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
