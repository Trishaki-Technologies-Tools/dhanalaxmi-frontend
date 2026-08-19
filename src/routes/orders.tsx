import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Download,
  Loader2,
  LogOut,
  Package,
  Phone,
  RefreshCw,
  Repeat2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { downloadInvoice } from "@/lib/invoice";
import { orderStages, stageEtaFor, stageIndexFor, useOrders } from "@/lib/orders";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Track your Dhanalaxmi Jeweler's silver jewellery orders with live status updates from confirmation to delivery.",
      },
      { property: "og:title", content: "My Orders — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Order history and live delivery status for your hallmarked 925 silver purchases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function OrdersPage() {
  const { isAuthenticated, hydrated, phone, signOut } = useAuth();
  const { orders, now } = useOrders();
  const { add, setOpen } = useCart();

  if (!hydrated) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-maroon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center lg:px-10">
        <p className="text-eyebrow text-maroon">My orders</p>
        <h1 className="mt-3 font-display text-4xl">Sign in to see your orders</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Verify your mobile number with an OTP to view order history and live delivery status.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          <Phone className="size-4" /> Sign in with phone
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[76rem] px-6 py-20 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-maroon">My orders</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Order history</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as +91 {phone} · status refreshes automatically
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <RefreshCw className="size-3.5 animate-spin text-maroon" style={{ animationDuration: "3s" }} />
            Live
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-maroon/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon transition-colors hover:bg-maroon-soft"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
          <Link
            to="/account"
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-maroon hover:text-maroon"
          >
            <UserRound className="size-3.5" /> Profile
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="luxe-card mt-12 p-12 text-center">
          <Package className="mx-auto size-6 text-maroon" />
          <h2 className="mt-4 font-display text-2xl">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders placed with this mobile number will appear here with live tracking.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          {orders.map((order, i) => {
            const active = stageIndexFor(order, now);
            return (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="luxe-card p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="text-eyebrow text-maroon">Order {order.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Placed {formatTime(order.createdAt)} · {order.shipTo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-price text-lg">{formatINR(order.total)}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {order.paid ? "Paid" : "Pay on delivery"} · {order.method.toUpperCase()}
                    </p>
                    <Link
                      to="/order/$id"
                      params={{ id: order.id }}
                      className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon underline-offset-4 hover:underline"
                    >
                      View details
                    </Link>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      order.lines.forEach((l) => add(l.slug, l.qty));
                      setOpen(true);
                      toast.success("Items added to your bag");
                    }}
                    className="flex items-center gap-2 rounded-full border border-maroon/30 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-maroon transition-colors hover:bg-maroon-soft"
                  >
                    <Repeat2 className="size-3.5" /> Reorder
                  </button>
                  <button
                    onClick={() => downloadInvoice(order)}
                    className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-maroon hover:text-maroon"
                  >
                    <Download className="size-3.5" /> Invoice
                  </button>
                  <Link
                    to="/order/$id"
                    params={{ id: order.id }}
                    className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-maroon hover:text-maroon"
                  >
                    Cancel · return · exchange
                  </Link>
                  {order.status === "cancelled" ? (
                    <span className="rounded-full bg-maroon px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      Cancelled
                    </span>
                  ) : null}
                  {order.request ? (
                    <span className="rounded-full bg-maroon-soft px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-maroon">
                      {order.request.type} requested
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 space-y-3">
                  {order.lines.map((line) => (
                    <div key={line.slug} className="flex items-center gap-3">
                      <img
                        src={line.image}
                        alt={line.name}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm">{line.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty {line.qty}</p>
                      </div>
                      <p className="font-price text-sm">{formatINR(line.price * line.qty)}</p>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-7 rounded-2xl bg-maroon-soft/60 p-5 ${
                    order.status === "cancelled" ? "opacity-50" : ""
                  }`}
                >
                  <p className="text-eyebrow text-maroon">
                    Status · {order.status === "cancelled" ? "Cancelled" : orderStages[active]}
                  </p>
                  <ol className="mt-5 grid gap-4 sm:grid-cols-5">
                    {orderStages.map((stage, idx) => {
                      const done = idx <= active;
                      return (
                        <li key={stage} className="flex gap-2.5 sm:flex-col sm:gap-2">
                          <div className="flex items-center gap-2 sm:w-full">
                            {done ? (
                              <CheckCircle2 className="size-4 shrink-0 text-maroon" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                            )}
                            <span className="hidden h-px flex-1 bg-maroon/20 sm:block" />
                          </div>
                          <div>
                            <p className={`text-[12px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                              {stage}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {done ? formatTime(stageEtaFor(order, idx)) : `Expected ${formatTime(stageEtaFor(order, idx))}`}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
