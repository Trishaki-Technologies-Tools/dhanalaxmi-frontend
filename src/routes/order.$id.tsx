import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { useAuth } from "@/lib/auth";
import { orderStages, stageEtaFor, stageIndexFor, useOrders } from "@/lib/orders";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Details — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "View items, pricing breakdown, delivery address and payment status for your Dhanalaxmi Jeweler's silver jewellery order.",
      },
      { property: "og:title", content: "Order Details — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Full invoice breakdown, delivery address and live status for your order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetailPage,
});

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[76rem] px-6 py-20 lg:px-10">{children}</div>;
}

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { isAuthenticated, hydrated } = useAuth();
  const { getOrder, now } = useOrders();
  const order = getOrder(id);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-maroon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="luxe-card p-12 text-center">
          <Phone className="mx-auto size-6 text-maroon" />
          <h1 className="mt-4 font-display text-3xl">Sign in to view this order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verify your mobile number with an OTP to open order {id}.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Sign in with phone
          </Link>
        </div>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell>
        <div className="luxe-card p-12 text-center">
          <Package className="mx-auto size-6 text-maroon" />
          <h1 className="mt-4 font-display text-3xl">Order not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find order {id} on this mobile number.
          </p>
          <Link
            to="/orders"
            className="mt-7 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Back to my orders
          </Link>
        </div>
      </Shell>
    );
  }

  const active = stageIndexFor(order, now);
  const subtotal = order.subtotal ?? order.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const codFee = order.codFee ?? 0;
  const savings = order.savings ?? 0;
  const addr = order.address;

  return (
    <Shell>
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon transition-colors hover:text-maroon-deep"
      >
        <ArrowLeft className="size-3.5" /> My orders
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-maroon">Order {order.id}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Order details</h1>
          <p className="mt-2 text-sm text-muted-foreground">Placed {formatTime(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
            order.paid
              ? "bg-maroon text-primary-foreground"
              : "border border-maroon/30 text-maroon"
          }`}
        >
          {order.paid ? "Payment received" : "Payment due on delivery"}
        </span>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="luxe-card p-6 sm:p-8">
            <h2 className="font-display text-2xl">Items ({order.lines.length})</h2>
            <div className="mt-6 space-y-4">
              {order.lines.map((line) => (
                <div key={line.slug} className="flex items-center gap-4">
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: line.slug }}
                      className="line-clamp-1 text-sm underline-offset-4 transition-colors hover:text-maroon hover:underline"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatINR(line.price)} · Qty {line.qty}
                    </p>
                  </div>
                  <p className="font-price text-sm">{formatINR(line.price * line.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="luxe-card p-6 sm:p-8">
            <h2 className="font-display text-2xl">Status · {orderStages[active]}</h2>
            <ol className="mt-6 space-y-4">
              {orderStages.map((stage, idx) => {
                const done = idx <= active;
                return (
                  <li key={stage} className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-maroon" />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <div>
                      <p className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {stage}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {done
                          ? formatTime(stageEtaFor(order, idx))
                          : `Expected ${formatTime(stageEtaFor(order, idx))}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="luxe-card p-6 sm:p-7">
            <h2 className="font-display text-2xl">Pricing breakdown</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-price">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Insured shipping</dt>
                <dd className="text-maroon">Free</dd>
              </div>
              {codFee > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">COD handling</dt>
                  <dd className="font-price">{formatINR(codFee)}</dd>
                </div>
              ) : null}
              {savings > 0 ? (
                <div className="flex justify-between text-maroon">
                  <dt>You saved</dt>
                  <dd className="font-price">{formatINR(savings)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-[10px] uppercase tracking-[0.22em]">Total</dt>
                <dd className="font-price text-2xl">{formatINR(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Method · {order.method.toUpperCase()} ·{" "}
              {order.paid ? "Paid" : "Pay on delivery"}
            </p>
          </div>

          <div className="luxe-card p-6 sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <MapPin className="size-4 text-maroon" /> Delivery address
            </h2>
            {addr ? (
              <address className="mt-4 space-y-1 text-sm not-italic text-muted-foreground">
                <p className="text-foreground">{addr.name}</p>
                <p>{addr.address}</p>
                <p>
                  {addr.city} {addr.pincode}
                </p>
                {addr.phone ? <p>+91 {addr.phone}</p> : null}
                {addr.email ? <p>{addr.email}</p> : null}
              </address>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">{order.shipTo || "Address unavailable"}</p>
            )}
          </div>

          <div className="luxe-card p-6 sm:p-7">
            <ul className="space-y-2.5 text-[12px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="size-3.5 text-maroon" /> Free insured delivery in 3–5 days
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-3.5 text-maroon" /> Hallmark certificate included
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-5 inline-block rounded-full border border-maroon/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon transition-colors hover:bg-maroon-soft"
            >
              Need help with this order
            </Link>
          </div>
        </motion.aside>
      </div>
    </Shell>
  );
}
