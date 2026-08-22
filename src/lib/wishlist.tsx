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
import { toast } from "sonner";

type WishlistContextValue = {
  items: number[]; // Array of product IDs that are in the wishlist
  toggle: (productId: number, productName: string) => Promise<void>;
  has: (productId: number) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    async function loadWishlist() {
      try {
        const res = await api.wishlist.get();
        if (res.wishlist) {
          setItems(res.wishlist.map((item: any) => item.productId));
        }
      } catch (err) {
        console.error("Failed to load wishlist", err);
      }
    }

    loadWishlist();
  }, [isAuthenticated]);

  const toggle = useCallback(
    async (productId: number, productName: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to save items to your wishlist.");
        return;
      }

      // Optimistic update
      const wasAdded = !items.includes(productId);
      setItems((prev) =>
        wasAdded ? [...prev, productId] : prev.filter((id) => id !== productId)
      );

      try {
        const res = await api.wishlist.toggle(productId);
        if (res.action === "added") {
          toast.success(`${productName} saved to your wishlist.`);
        } else {
          toast(`${productName} removed from wishlist.`);
        }
      } catch (err) {
        console.error("Failed to toggle wishlist item", err);
        toast.error("Failed to update wishlist.");
        // Revert optimistic update
        setItems((prev) =>
          wasAdded ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
      }
    },
    [items, isAuthenticated]
  );

  const has = useCallback((productId: number) => items.includes(productId), [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, toggle, has }),
    [items, toggle, has]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
