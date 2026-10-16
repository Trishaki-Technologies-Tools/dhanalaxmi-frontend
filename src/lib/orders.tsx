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
  dbId?: number;
  phone: string;
  createdAt: number;
  total: number;
  method: string;
  paid: boolean;
  lines: OrderLine[];
  shipTo: string;
  address?: OrderAddress;
  subtotal?: number;
  codFee?: number;
  savings?: number;
  status: "active" | "cancelled" | "DELIVERED" | "SHIPPED" | "CANCELLED" | "PENDING" | "PROCESSING";
  rawStatus?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  stageOverride?: number;
  cancelledAt?: number;
  cancelReason?: string;
  request?: {
    type: "return" | "exchange";
    reason: string;
    at: number;
    status: "requested";
  };
};

export const orderStages = ["Order Placed", "Confirmed", "Shipped", "Delivered"] as const;
export type OrderStage = (typeof orderStages)[number];

export function statusToStageIndex(status?: string): number {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return 0; // Order Placed
    case "PROCESSING":
      return 1; // Confirmed
    case "SHIPPED":
      return 2; // Shipped
    case "DELIVERED":
      return 3; // Delivered
    default:
      return 0; // Order Placed
  }
}

export function stageIndexToStatus(stage: number): "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" {
  switch (stage) {
    case 0:
      return "PENDING";
    case 1:
      return "PROCESSING";
    case 2:
      return "SHIPPED";
    case 3:
      return "DELIVERED";
    default:
      return "PENDING";
  }
}

export function stageIndexFor(order: Order, _now?: number) {
  if (typeof order.stageOverride === "number") {
    return Math.max(0, Math.min(orderStages.length - 1, order.stageOverride));
  }
  if (order.rawStatus) {
    return statusToStageIndex(order.rawStatus);
  }
  return statusToStageIndex(order.status);
}

export function stageEtaFor(order: Order, index: number) {
  // Estimated progress in days
  const daysOffset = [0, 1, 2, 4];
  return order.createdAt + (daysOffset[index] ?? 0) * 86400000;
}

type OrdersContextValue = {
  orders: Order[];
  allOrders: Order[];
  now: number;
  placeOrder: (
    input: Omit<Order, "id" | "createdAt" | "status" | "phone"> & {
      phone: string;
      status?: Order["status"];
    }
  ) => Promise<Order>;
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  cancelOrder: (id: string, reason: string) => Promise<void> | void;
  requestReturn: (id: string, type: "return" | "exchange", reason: string) => void;
  findOrder: (id: string, contact: string) => Promise<Order | undefined>;
};

export function canCancel(order: Order, _now?: number) {
  const isCancelled = order.status === "cancelled" || order.rawStatus === "CANCELLED" || order.status === "CANCELLED";
  if (isCancelled) return false;
  // Cancellation is only allowed before shipping / delivery (Order Placed or Confirmed)
  return stageIndexFor(order) < 2;
}

export function canReturn(order: Order, _now?: number) {
  const isCancelled = order.status === "cancelled" || order.rawStatus === "CANCELLED" || order.status === "CANCELLED";
  if (isCancelled) return false;
  return stageIndexFor(order) >= 3 && !order.request;
}

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
  const { phone, user, isAuthenticated } = useAuth();

  // Load orders from Backend MySQL DB on startup / auth change
  useEffect(() => {
    async function loadUserOrders() {
      const token = localStorage.getItem("dj-auth-token");
      if (!token || !isAuthenticated) {
        setAll(readStored());
        return;
      }
      try {
        const res = await api.orders.getUserOrders();
        if (res.orders && Array.isArray(res.orders)) {
          const formattedOrders: Order[] = res.orders.map((o: any): Order => {
            const isCancelled = o.status === "CANCELLED";
            return {
              id: o.orderNumber || String(o.id),
              phone: o.customerPhone || phone || "",
              createdAt: new Date(o.createdAt).getTime(),
              total: Number(o.totalAmount),
              method: (o.paymentMethod || "UPI").toLowerCase(),
              paid: o.paymentStatus === "PAID",
              shipTo: `${o.customerName}, ${o.city}`,
              address: {
                name: o.customerName,
                email: o.customerEmail || "",
                phone: o.customerPhone,
                address: o.addressLine1,
                city: o.city,
                pincode: o.pincode,
              },
              subtotal: Number(o.totalAmount),
              codFee: 0,
              savings: 0,
              status: (isCancelled ? "cancelled" : "active") as Order["status"],
              rawStatus: o.status,
              stageOverride: statusToStageIndex(o.status),
              lines: o.items.map((item: any) => ({
                slug: item.productSlug || `item-${item.id}`,
                name: item.productName || "Silver Jewelry",
                image: item.productImage || "",
                qty: item.quantity,
                price: Number(item.price),
              })),
            };
          });
          setAll(formattedOrders);
          return;
        }
      } catch (err) {
        /* Fallback to local storage if guest or unauthenticated */
      }
      setAll(readStored());
    }

    loadUserOrders();
  }, [isAuthenticated, phone, user]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  const placeOrder = useCallback<OrdersContextValue["placeOrder"]>(async (input) => {
    let createdOrder: Order;

    try {
      // POST order to Express + MySQL Database
      const res = await api.orders.create({
        customerName: input.address?.name ?? "Customer",
        customerEmail: input.address?.email ?? undefined,
        customerPhone: input.address?.phone ?? input.phone,
        addressLine1: input.address?.address ?? input.shipTo,
        city: input.address?.city ?? "City",
        state: "Karnataka",
        pincode: input.address?.pincode ?? "560001",
        paymentMethod: input.method.toUpperCase(),
        items: input.lines.map((l) => ({
          productName: l.name,
          productSlug: l.slug,
          productImage: l.image,
          price: l.price,
          quantity: l.qty,
        })),
      });

      const dbOrder = res.order;
      createdOrder = {
        ...input,
        id: dbOrder.orderNumber || String(dbOrder.id),
        createdAt: new Date(dbOrder.createdAt).getTime(),
        status: "active",
        rawStatus: dbOrder.status || "PENDING",
        stageOverride: statusToStageIndex(dbOrder.status || "PENDING"),
      };
    } catch (err) {
      // Fallback local ID generation if offline
      createdOrder = {
        ...input,
        id: `DJ${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        createdAt: Date.now(),
        status: "active",
        rawStatus: "PENDING",
        stageOverride: 0,
      };
    }

    setAll((prev) => {
      const next = [createdOrder, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    return createdOrder;
  }, []);

  const addOrder = useCallback((order: Order) => {
    setAll((prev) => {
      const exists = prev.some((o) => o.id === order.id);
      if (exists) return prev;
      const next = [order, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const orders = useMemo(
    () => (phone ? all.filter((o) => o.phone === phone || true) : all),
    [all, phone]
  );

  const getOrder = useCallback((id: string) => all.find((o) => o.id === id), [all]);

  const persist = useCallback((next: Order[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const updateOrder = useCallback<OrdersContextValue["updateOrder"]>(
    (id, patch) => {
      setAll((prev) => persist(prev.map((o) => (o.id === id ? { ...o, ...patch } : o))));
    },
    [persist]
  );

  const cancelOrder = useCallback(
    async (id: string, reason: string) => {
      try {
        await api.orders.cancelCustomer(id, { reason });
      } catch (e) {
        console.warn("Failed to cancel order on backend:", e);
      }
      updateOrder(id, {
        status: "cancelled",
        rawStatus: "CANCELLED",
        cancelledAt: Date.now(),
        cancelReason: reason,
      });
    },
    [updateOrder]
  );

  const requestReturn = useCallback(
    (id: string, type: "return" | "exchange", reason: string) => {
      updateOrder(id, { request: { type, reason, at: Date.now(), status: "requested" } });
    },
    [updateOrder]
  );

  const findOrder = useCallback(
    async (id: string, contact: string) => {
      try {
        const res = await api.orders.track(id.trim());
        if (res.order) {
          const dbOrder = res.order;
          const matchedOrder: Order = {
            id: dbOrder.orderNumber || String(dbOrder.id),
            phone: dbOrder.customerPhone || "",
            createdAt: new Date(dbOrder.createdAt).getTime(),
            total: Number(dbOrder.totalAmount),
            method: (dbOrder.paymentMethod || "UPI").toLowerCase(),
            paid: dbOrder.paymentStatus === "PAID",
            shipTo: `${dbOrder.customerName}, ${dbOrder.city}`,
            address: {
              name: dbOrder.customerName,
              email: dbOrder.customerEmail || "",
              phone: dbOrder.customerPhone,
              address: dbOrder.addressLine1,
              city: dbOrder.city,
              pincode: dbOrder.pincode,
            },
            subtotal: Number(dbOrder.totalAmount),
            status: dbOrder.status === "CANCELLED" ? "cancelled" : "active",
            rawStatus: dbOrder.status,
            stageOverride: statusToStageIndex(dbOrder.status),
            lines: dbOrder.items.map((item: any) => ({
              slug: item.productSlug || `item-${item.id}`,
              name: item.productName || "Silver Jewelry",
              image: item.productImage || "",
              qty: item.quantity,
              price: Number(item.price),
            })),
          };
          return matchedOrder;
        }
      } catch {
        /* ignore fallback */
      }

      const key = contact.trim().toLowerCase();
      const digits = key.replace(/\D/g, "").slice(-10);
      return all.find((o) => {
        if (o.id.toLowerCase() !== id.trim().toLowerCase()) return false;
        const email = o.address?.email?.toLowerCase() ?? "";
        const phones = [o.phone, o.address?.phone ?? ""].map((p) =>
          p.replace(/\D/g, "").slice(-10)
        );
        return (digits.length === 10 && phones.includes(digits)) || (!!key && email === key);
      });
    },
    [all]
  );

  const value = useMemo(
    () => ({
      orders,
      allOrders: all,
      now,
      placeOrder,
      addOrder,
      getOrder,
      updateOrder,
      cancelOrder,
      requestReturn,
      findOrder,
    }),
    [orders, all, now, placeOrder, addOrder, getOrder, updateOrder, cancelOrder, requestReturn, findOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
