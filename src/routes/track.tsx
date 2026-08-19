import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Circle, MapPin, PackageSearch, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/catalog";
import { downloadInvoice } from "@/lib/invoice";
import { orderStages, stageEtaFor, stageIndexFor, useOrders, type Order } from "@/lib/orders";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Track your Dhanalaxmi Jeweler's silver jewellery order without signing in — enter your order ID with the phone number or email used at checkout.",
      },
      { property: "og:title", content: "Track Your Order — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Guest order tracking with live delivery status for hallmarked 925 silver orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/25";

function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TrackPage() {
  const { findOrder, now } = useOrders();
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findOrder(orderId, contact);
    if (!found) {
      setResult(null);
      setError("We couldn't match that order ID with this phone number or email.");
      return;
    }
    setError(null);
    setResult(found);
  };

  const active = result ? stageIndexFor(result, now) : 0;
  const cancelled = result?.status === "cancelled";

  return (
    <div className="mx-auto max-w-[64rem] px-6 py-20 lg:px-10">
      <p className="text-eyebrow text-maroon">Order tracking</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Track your order</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        No account needed. Enter your order ID with the phone number or email you used at checkout.
      </p>

      <form onSubmit={lookup} className="luxe-card mt-10 grid gap-5 p-7 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-8">
        <div>
          <label htmlFor="orderId" className="text-eyebrow">
            Order ID
          </label>
          <input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            placeholder="DJ4K2P9"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact" className="text-eyebrow">
            Phone or email
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            placeholder="98765 43210"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          Track
        </button>
      </form>

      {error ? (
        <p className="mt-5 rounded-xl border border-maroon/30 bg-maroon-soft px-5 py-4 text-sm text-maroon">
          {error}
        </p>
      ) : null}

      {result ? (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="luxe-card mt-8 p-7 sm:p-9"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-eyebrow text-maroon">Order {result.id}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed {formatTime(result.createdAt)} · {result.paid ? "Paid" : "Pay on delivery"} ·{" "}
                {result.method.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-price text-xl">{formatINR(result.total)}</p>
              <button
                onClick={() => downloadInvoice(result)}
                className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-maroon underline-offset-4 hover:underline"
              >
                Download invoice
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {result.lines.map((line) => (
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

          {cancelled ? (
            <p className="mt-7 rounded-2xl border border-maroon/30 bg-maroon-soft p-5 text-sm text-maroon">
              This order was cancelled on {formatTime(result.cancelledAt ?? result.createdAt)}. Any
              amount paid is refunded to the original payment method within 3–5 working days.
            </p>
          ) : (
            <div className="mt-7 rounded-2xl bg-maroon-soft/60 p-5">
              <p className="text-eyebrow text-maroon">Status · {orderStages[active]}</p>
              <ol className="mt-5 grid gap-4 sm:grid-cols-5">
                {orderStages.map((stage, idx) => {
                  const done = idx <= active;
                  return (
                    <li key={stage} className="flex gap-2.5 sm:flex-col sm:gap-2">
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-maroon" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <div>
                        <p className={`text-[12px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {stage}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTime(stageEtaFor(result, idx))}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {result.address ? (
            <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-maroon" />
              <span>
                {result.address.name}, {result.address.address}, {result.address.city}{" "}
                {result.address.pincode}
              </span>
            </div>
          ) : null}

          <p className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-maroon" /> Insured shipment · hallmark certificate
            included
          </p>
        </motion.section>
      ) : (
        <div className="luxe-card mt-8 p-10 text-center">
          <PackageSearch className="mx-auto size-6 text-maroon" />
          <p className="mt-4 text-sm text-muted-foreground">
            Have an account?{" "}
            <Link to="/orders" className="text-maroon underline-offset-4 hover:underline">
              View all your orders
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
