import { useEffect, useMemo, useState } from "react";
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
import { useProfile } from "@/lib/profile";
import { useCatalog } from "@/lib/catalog-store";
import { api } from "@/lib/api";
import { loadRazorpayScript, type RazorpayOptions, type RazorpayResponse } from "@/lib/razorpay";

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

type PayMethod = "razorpay" | "cod";

const payMethods: Array<{ id: PayMethod; label: string; hint: string; Icon: typeof CreditCard }> = [
  { id: "razorpay", label: "Online Payment", hint: "UPI · Cards · NetBanking", Icon: Smartphone },
  { id: "cod", label: "Cash on delivery", hint: "₹100 handling fee", Icon: Banknote },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-maroon focus:ring-2 focus:ring-maroon/25";

function CheckoutPage() {
  const { items, subtotal, savings, clear, coupon, applyCoupon, discount } = useCart();
  const { phone: authPhone, user } = useAuth();
  const { placeOrder, addOrder } = useOrders();
  const { profile, addresses, defaultAddress, addAddress } = useProfile();
  const { settings } = useCatalog();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PayMethod>("razorpay");
  const [processing, setProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hasOutOfStock = items.some((item) => item.product.stock <= 0);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    setSelectedId(defaultAddress?.id ?? null);
  }, [defaultAddress?.id]);

  const codFee = method === "cod" ? settings.codFee : 0;
  const total = Math.max(0, subtotal - discount) + codFee;
  const initialPhone = useMemo(() => authPhone ?? "", [authPhone]);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    try {
      const res = await api.coupons.validate(couponInput.trim(), subtotal);
      applyCoupon(res.coupon);
      toast.success("Coupon applied successfully!");
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon");
      applyCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const selected = addresses.find((a) => a.id === selectedId);
  const defaults = {
    name: selected?.name ?? profile.name ?? user?.name ?? "",
    email: profile.email ?? user?.email ?? "",
    phone: selected?.phone ?? initialPhone ?? user?.phone ?? "",
    address: selected?.address ?? "",
    city: selected?.city ?? "",
    pincode: selected?.pincode ?? "",
  };

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const buyerPhone = normalizePhone(String(form.get("phone") ?? ""));
    const city = String(form.get("city") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const pincode = String(form.get("pincode") ?? "").trim();

    if (!buyerPhone || buyerPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (form.get("saveAddress") === "on") {
      try {
        await addAddress({ label: "Saved at checkout", name, phone: buyerPhone, address, city, pincode });
      } catch {
        // Ignore guest / offline error
      }
    }

    setProcessing(true);

    try {
      if (method === "cod") {
        const order = await placeOrder({
          phone: authPhone ?? buyerPhone,
          total,
          method: "cod",
          paid: false,
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
        toast.success("Order placed successfully — Cash on delivery.");
        navigate({
          to: "/order-confirmed",
          search: { order: order.id, total: String(total), paid: "0", method: "cod" },
        });
        return;
      }

      // Online Razorpay Payment flow
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay payment SDK. Please check your network and try again.");
      }

      // 1. Create order on backend
      const rzpRes = await api.orders.createRazorpayOrder({
        amount: total,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      if (!rzpRes.orderId) {
        throw new Error("Failed to create Razorpay payment order.");
      }

      const orderPayload = {
        customerName: name,
        customerEmail: email || user?.email || undefined,
        customerPhone: buyerPhone,
        addressLine1: address,
        city,
        state: "Karnataka",
        pincode,
        totalAmount: total,
        items: items.map(({ product, qty }) => ({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.image,
          price: product.price,
          quantity: qty,
        })),
      };

      const razorpayKey = rzpRes.keyId || (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string) || "";
      if (!razorpayKey) {
        throw new Error("Razorpay Key ID is not configured. Please ensure RAZORPAY_KEY_ID is set in your environment.");
      }

      // 2. Open Razorpay Checkout modal
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: rzpRes.amount,
        currency: rzpRes.currency || "INR",
        name: "Dhanalaxmi Jeweler's",
        description: "Hallmarked 925 Pure Silver",
        order_id: rzpRes.orderId,
        prefill: {
          name,
          email: email || undefined,
          contact: buyerPhone,
        },
        theme: {
          color: "#800020",
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info("Payment window dismissed. Your bag is saved.");
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            setProcessing(true);
            const verifyRes = await api.orders.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: orderPayload,
            });

            const confirmed = verifyRes.order;
            const orderId = confirmed.orderNumber || String(confirmed.id);

            // Add verified order to local storage/context
            addOrder({
              id: orderId,
              phone: buyerPhone,
              createdAt: new Date(confirmed.createdAt).getTime(),
              total,
              method: "razorpay",
              paid: true,
              shipTo: [name, city].filter(Boolean).join(", "),
              address: { name, email, phone: buyerPhone, address, city, pincode },
              subtotal,
              codFee: 0,
              savings,
              status: "active",
              lines: items.map(({ product, qty }) => ({
                slug: product.slug,
                name: product.name,
                image: product.image,
                qty,
                price: product.price,
              })),
            });

            clear();
            toast.success("Payment verified! Your order has been placed.");
            navigate({
              to: "/order-confirmed",
              search: {
                order: orderId,
                total: String(total),
                paid: "1",
                method: "razorpay",
              },
            });
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            toast.error(verifyErr.message || "Payment verification failed. If payment was deducted, please contact concierge.");
          } finally {
            setProcessing(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.message || "Failed to process order. Please try again.");
      setProcessing(false);
    }
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
            {addresses.length > 0 ? (
              <div className="mt-6">
                <p className="text-eyebrow">Saved addresses</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={`rounded-2xl border p-4 text-left text-sm transition-colors ${
                        selectedId === a.id
                          ? "border-maroon bg-maroon-soft text-maroon"
                          : "border-border hover:border-maroon/40"
                      }`}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        {a.label || "Address"}
                      </p>
                      <p className="mt-2">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {a.address}, {a.city} {a.pincode}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className={`rounded-2xl border p-4 text-left text-sm transition-colors ${
                      selectedId === null
                        ? "border-maroon bg-maroon-soft text-maroon"
                        : "border-border hover:border-maroon/40"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">New</p>
                    <p className="mt-2">Use a different address</p>
                  </button>
                </div>
              </div>
            ) : null}
            <div key={selectedId ?? "new"} className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    defaultValue={defaults[f.name as keyof typeof defaults]}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
              <input type="checkbox" name="saveAddress" className="size-4 accent-primary" />
              Save this address to my address book
            </label>
          </section>

          <section className="luxe-card p-7 sm:p-9">
            <h2 className="font-display text-2xl">Payment Method</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {payMethods.map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`rounded-2xl border p-5 text-left transition-colors cursor-pointer ${
                    method === id
                      ? "border-maroon bg-maroon-soft text-maroon shadow-xs"
                      : "border-border hover:border-maroon/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="size-5" />
                    {id === "razorpay" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-maroon bg-maroon/10 px-2.5 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                </button>
              ))}
            </div>


            {method === "cod" ? (
              <div className="mt-6 rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Cash on Delivery</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Pay securely with cash or UPI directly when your insured parcel arrives at your doorstep. A ₹100 handling fee applies.
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="luxe-card p-7">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-6 space-y-4">
              {items.map(({ product, qty, lineTotal }) => (
                <div key={product.slug} className={`flex gap-3 ${product.stock <= 0 ? 'opacity-75' : ''}`}>
                  <div className="relative size-16 shrink-0 rounded-lg border border-border bg-pearl overflow-hidden">
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <span className="text-[7px] font-bold text-white bg-maroon px-1 py-0.5 uppercase tracking-wider">
                          SOLD
                        </span>
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`size-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty: 1</p>
                  </div>
                  <p className={`font-price text-sm ${product.stock <= 0 ? 'text-muted-foreground line-through' : ''}`}>
                    {formatINR(lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <label className="text-eyebrow text-muted-foreground block mb-2">Discount Code</label>
              {coupon ? (
                <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2 border border-green-500/20">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Code: {coupon.code} applied!</span>
                  <button 
                    type="button"
                    onClick={() => { applyCoupon(null); setCouponInput(""); }}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-maroon"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-border disabled:opacity-50"
                  >
                    {isApplyingCoupon ? <Loader2 className="size-3 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
            </div>

            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Weight</dt>
                <dd className="font-medium">{items.reduce((acc, { product, qty }) => acc + (product.weight || 0) * qty, 0).toFixed(2)}g</dd>
              </div>
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
                  <dt>Product savings</dt>
                  <dd className="font-price">{formatINR(savings)}</dd>
                </div>
              ) : null}
              {discount > 0 ? (
                <div className="flex justify-between text-green-600 dark:text-green-500 font-medium">
                  <dt>Coupon discount</dt>
                  <dd className="font-price">-{formatINR(discount)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-[10px] uppercase tracking-[0.22em]">Total</dt>
                <dd className="font-price text-2xl">{formatINR(total)}</dd>
              </div>
            </dl>

            <motion.button
              type="submit"
              disabled={processing || hasOutOfStock}
              whileTap={{ scale: 0.98 }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-maroon-deep disabled:opacity-70"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing payment...
                </>
              ) : method === "cod" ? (
                "Place Cash on Delivery Order"
              ) : (
                `Pay ${formatINR(total)} via Razorpay`
              )}
            </motion.button>
            {hasOutOfStock && (
              <p className="mt-3 text-center text-[11px] font-semibold text-maroon">
                Remove sold items from your bag to proceed.
              </p>
            )}

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