import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Package, Truck } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  order: z.string().default("DJ00000"),
  total: z.string().default("0"),
  paid: z.string().default("1"),
  method: z.string().default("upi"),
});

export const Route = createFileRoute("/order-confirmed")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Order Confirmed — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Your hallmarked 925 silver order is confirmed and will be dispatched with free insured shipping.",
      },
      { property: "og:title", content: "Order Confirmed — Dhanalaxmi Jeweler's" },
      { property: "og:description", content: "Thank you for shopping with Dhanalaxmi Jeweler's." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderConfirmedPage,
});

const methodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  cod: "Cash on delivery",
};

function OrderConfirmedPage() {
  const { order, total, paid, method } = Route.useSearch();
  const amount = Number(total) || 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-maroon text-primary-foreground"
      >
        <Check className="size-7" />
      </motion.span>

      <p className="mt-8 text-eyebrow text-maroon">Order {order}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Thank you — your order is confirmed</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {paid === "1"
          ? `Payment of ₹${amount.toLocaleString("en-IN")} received via ${methodLabels[method] ?? method}.`
          : `₹${amount.toLocaleString("en-IN")} payable on delivery (${methodLabels[method] ?? method}).`}{" "}
        A confirmation with your hallmark certificate follows by email.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="luxe-card p-6 text-left">
          <Package className="size-4 text-maroon" />
          <p className="mt-3 text-sm font-semibold">Hand-polished & packed</p>
          <p className="text-[12px] text-muted-foreground">
            Each piece is cleaned, hallmark-verified and boxed within 24 hours.
          </p>
        </div>
        <div className="luxe-card p-6 text-left">
          <Truck className="size-4 text-maroon" />
          <p className="mt-3 text-sm font-semibold">Free insured delivery</p>
          <p className="text-[12px] text-muted-foreground">
            Tracked dispatch arriving in 3–5 business days.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link
          to="/shop"
          className="rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          Continue shopping
        </Link>
        <Link
          to="/contact"
          className="rounded-full border border-maroon/30 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-maroon transition-colors hover:bg-maroon-soft"
        >
          Contact concierge
        </Link>
      </div>
    </div>
  );
}