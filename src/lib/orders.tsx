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

export type OrderLine = { slug: string; name: string; image: string; qty: number; price: number };

export type OrderAddress = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

export type Order = {
  id: string;
  phone: string;
  createdAt: number;
  total: number;
  method: string;
  paid: boolean;
  lines: OrderLine[];
  shipTo: string;
  /** Optional on orders placed before the details page shipped. */
  address?: OrderAddress;
  subtotal?: number;
  codFee?: number;
  savings?: number;
};

export const orderStages = ["Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"] as const;
export type OrderStage = (typeof orderStages)[number];

/** Demo timeline in minutes after the order is placed. Replace with backend status later. */
const stageOffsetsMinutes = [0, 1, 2, 4, 6];

export function stageIndexFor(order: Order, now: number) {
  const minutes = (now - order.createdAt) / 60000;
  let idx = 0;
  stageOffsetsMinutes.forEach((offset, i) => {
    if (minutes >= offset) idx = i;
  });
  return idx;
}

export function stageEtaFor(order: Order, index: number) {
  return order.createdAt + (stageOffsetsMinutes[index] ?? 0) * 60000;
}

type OrdersContextValue = {
  orders: Order[];
  now: number;
  placeOrder: (input: Omit<Order, "id" | "createdAt" | "phone"> & { phone: string }) => Order;
  getOrder: (id: string) => Order | undefined;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);
const STORAGE_KEY = "dj-orders-v1";

function readStored(): Order[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Order[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const { phone } = useAuth();

  useEffect(() => {
    setAll(readStored());
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  const placeOrder = useCallback<OrdersContextValue["placeOrder"]>((input) => {
    const order: Order = {
      ...input,
      id: `DJ${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      createdAt: Date.now(),
    };
    setAll((prev) => {
      const next = [order, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    return order;
  }, []);

  const orders = useMemo(
    () => (phone ? all.filter((o) => o.phone === phone) : []),
    [all, phone],
  );

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value = useMemo(
    () => ({ orders, now, placeOrder, getOrder }),
    [orders, now, placeOrder, getOrder],
  );
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
