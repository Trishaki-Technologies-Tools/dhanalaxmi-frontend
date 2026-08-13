import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/lib/catalog";

export type CartLine = { slug: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  items: Array<{ product: Product; qty: number; lineTotal: number }>;
  count: number;
  subtotal: number;
  savings: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dj-cart-v1";

function readStored(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is CartLine =>
          typeof l === "object" &&
          l !== null &&
          typeof (l as CartLine).slug === "string" &&
          typeof (l as CartLine).qty === "number",
      )
      .map((l) => ({ slug: l.slug, qty: Math.max(1, Math.min(99, Math.round(l.qty))) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota errors */
    }
  }, [lines, hydrated]);

  const add = useCallback((slug: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug ? { ...l, qty: Math.min(99, l.qty + qty) } : l,
        );
      }
      return [...prev, { slug, qty: Math.min(99, Math.max(1, qty)) }];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const items = lines.flatMap((l) => {
      const product = products.find((p) => p.slug === l.slug);
      if (!product) return [];
      return [{ product, qty: l.qty, lineTotal: product.price * l.qty }];
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const savings = items.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.qty, 0);
    return {
      lines,
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      savings,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
    };
  }, [lines, open, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
