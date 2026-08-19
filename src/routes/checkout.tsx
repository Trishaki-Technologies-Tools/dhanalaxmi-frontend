import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useAuth, normalizePhone } from "@/lib/auth";
import { useOrders } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Dhanalaxmi Jeweler's" },
      {
        name: "description",
        content:
          "Complete your order of hallmarked 925 silver jewelry with free insured shipping and secure payment.",
      },
      { property: "og:title", content: "Secure Checkout — Dhanalaxmi Jeweler's" },
      {
        property: "og:description",
        content: "Shipping details, payment and order review in one elegant step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

type PayMethod = "upi" | "card" | "cod";

const payMethods: Array<{ id: PayMethod; label: string; hint: string; Icon: typeof CreditCard }> = [
  { id: "upi", label: "UPI", hint: "GPay · PhonePe · Paytm", Icon: Smartphone },
  { id: "card", label: "Card", hint: "Visa · Mastercard · RuPay", Icon: CreditCard },
  { id: "cod", label: "Cash on delivery", hint: "₹100 handling fee", Icon: Banknote },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/25";

function CheckoutPage() {
  const { items, subtotal, savings, clear } = useCart();
  const { phone: authPhone } = useAuth();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PayMethod>("upi");
  const [processing, setProcessing] = useState(false);

  const codFee = method === "cod" ? 100 : 0;
  const total = subtotal + codFee;
  const initialPhone = useMemo(() => authPhone ?? "", [authPhone]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center lg:px-10">
        <p className="text-eyebrow text-maroon">Checkout</p>
        <h1 className="mt-3 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Add a hallmarked 925 silver piece to continue to secure checkout.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep"
        >
          Explore the collection
        </Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const buyerPhone = normalizePhone(String(form.get("phone") ?? ""));
    const city = String(form.get("city") ?? "");
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const address = String(form.get("address") ?? "");
    const pincode = String(form.get("pincode") ?? "");
    setProcessing(true);
    // Demo payment authorisation — replace with the live payment provider session.
    setTimeout(() => {
      const paid = method === "cod" ? "0" : "1";
      const order = placeOrder({
        phone: authPhone ?? buyerPhone,
        total,
        method,
        paid: paid === "1",
        shipTo: [name, city].filter(Boolean).join(", "),
        address: { name, email, phone: buyerPhone, address, city, pincode },
        subtotal,
        codFee,
        savings,
        lines: items.map(({ product, qty }) => ({
          slug: product.slug,
          name: product.name,
          image: product.image,
          qty,
          price: product.price,
        })),
      });
      clear();
      toast.success("Order placed — a confirmation is on its way.");
      navigate({
        to: "/order-confirmed",
        search: { order: order.id, total: String(total), paid, method },
      });
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-maroon">Secure checkout</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Complete your order</h1>
        </div>
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Lock className="size-3.5 text-maroon" /> 256-bit encrypted
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-8">
          <section className="luxe-card p-7 sm:p-9">
            <h2 className="font-display text-2xl">Shipping details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                { name: "name", label: "Full name", type: "text", span: true },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone", type: "tel" },
                { name: "address", label: "Address", type: "text", span: true },
                { name: "city", label: "City", type: "text" },
                { name: "pincode", label: "PIN code", type: "text" },
              ].map((f) => (
                <div key={f.name} className={f.span ? "sm:col-span-2" : undefined}>
                  <label htmlFor={f.name} className="text-eyebrow">
                    {f.label}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required
                    defaultValue={f.name === "phone" ? initialPhone : undefined}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="luxe-card p-7 sm:p-9">
            <h2 className="font-display text-2xl">Payment</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {payMethods.map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    method === id
                      ? "border-maroon bg-maroon-soft text-maroon"
                      : "border-border hover:border-maroon/40"
                  }`}
                >
                  <Icon className="size-4" />
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{hint}</p>
                </button>
              ))}
            </div>

            {method === "upi" ? (
              <div className="mt-6">
                <label htmlFor="upi" className="text-eyebrow">
                  UPI ID
                </label>
                <input id="upi" name="upi" required placeholder="name@bank" className={inputClass} />
              </div>
            ) : null}

            {method === "card" ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="cardnumber" className="text-eyebrow">
                    Card number
                  </label>
                  <input
                    id="cardnumber"
                    name="cardnumber"
                    required
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="expiry" className="text-eyebrow">
                    Expiry
                  </label>
                  <input id="expiry" name="expiry" required placeholder="MM/YY" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="cvc" className="text-eyebrow">
                    CVC
                  </label>
                  <input id="cvc" name="cvc" required placeholder="123" className={inputClass} />
                </div>
              </div>
            ) : null}

            {method === "cod" ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Pay in cash when your insured parcel arrives. A ₹100 handling fee applies.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="luxe-card p-7">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-6 space-y-4">
              {items.map(({ product, qty, lineTotal }) => (
                <div key={product.slug} className="flex gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-16 shrink-0 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty {qty}</p>
                  </div>
                  <p className="font-price text-sm">{formatINR(lineTotal)}</p>
                </div>
              ))}
            </div>

            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
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
                  <dt>You save</dt>
                  <dd className="font-price">{formatINR(savings)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-[10px] uppercase tracking-[0.22em]">Total</dt>
                <dd className="font-price text-2xl">{formatINR(total)}</dd>
              </div>
            </dl>

            <motion.button
              type="submit"
              disabled={processing}
              whileTap={{ scale: 0.98 }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep disabled:opacity-70"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing
                </>
              ) : method === "cod" ? (
                "Place order"
              ) : (
                `Pay ${formatINR(total)}`
              )}
            </motion.button>

            <ul className="mt-5 space-y-2 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-maroon" /> Certified hallmark on every piece
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-3.5 text-maroon" /> Free insured delivery in 3–5 days
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-3.5 text-maroon" /> 15-day easy returns
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}