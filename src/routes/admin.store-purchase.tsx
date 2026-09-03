import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, SearchX, ReceiptText } from "lucide-react";
import { useCatalog } from "@/lib/catalog-store";
import { formatINR } from "@/lib/catalog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { downloadInvoice } from "@/lib/invoice";

export const Route = createFileRoute("/admin/store-purchase")({
  component: AdminStorePurchase,
});

function AdminStorePurchase() {
  const { products } = useCatalog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter out products that are already sold (stock <= 0)
  const availableProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return availableProducts;
    const lower = searchTerm.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.slug.toLowerCase().includes(lower) ||
        p.id?.toString().includes(lower)
    );
  }, [searchTerm, availableProducts]);

  const handleBillProduct = async () => {
    if (!selectedProduct) return;
    if (!confirm(`Are you sure you want to mark "${selectedProduct.name}" as sold in-store?`)) return;

    setIsProcessing(true);
    try {
      if (selectedProduct.id) {
        await api.products.update(selectedProduct.id, { stock: 0 });
      }
      
      const subtotal = selectedProduct.price;
      const fakeOrder = {
        id: `POS-${Math.floor(Math.random() * 100000)}`,
        userId: "store-admin",
        total: subtotal,
        subtotal: subtotal,
        codFee: 0,
        savings: (selectedProduct.mrp || 0) - selectedProduct.price,
        status: "delivered" as const,
        paid: true,
        method: "cod" as const,
        shipTo: "In-Store Purchase",
        address: null,
        createdAt: new Date().toISOString(),
        lines: [
          {
            slug: selectedProduct.slug,
            name: selectedProduct.name,
            qty: 1,
            price: selectedProduct.price,
            image: selectedProduct.image,
          },
        ],
      };
      downloadInvoice(fakeOrder);
      
      toast.success(`Payment Collected & Invoice Generated for ${selectedProduct.name}`);
      
      setSelectedProduct(null);
      setSearchTerm("");
      
      // Give it a small delay for the download to start before reloading
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error("Failed to process store purchase");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Store Purchase (POS)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search for available products and bill them for in-store walk-in customers.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-2">
        <div className="flex flex-1 items-center gap-3 pl-3">
          <Search className="size-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/50 px-6 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
            <SearchX className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Try adjusting your search term. Only products with available stock are shown.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.slug}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-white p-4 transition-all hover:border-maroon/20 hover:shadow-soft"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-20 rounded-lg object-cover bg-muted"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-sm">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">ID: {product.id || "N/A"}</p>
                  <p className="mt-2 font-price text-maroon font-semibold">
                    {formatINR(product.price)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(product)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-maroon px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-maroon-deep"
              >
                <ReceiptText className="size-3.5" /> Select to Bill
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Billing Modal Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-luxe animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-display font-semibold">Store Checkout</h2>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">POS Billing</p>
              </div>
              <ReceiptText className="size-6 text-maroon/30" />
            </div>
            
            <div className="mt-6 flex items-start gap-4">
               <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="size-24 rounded-lg object-cover bg-muted shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">ID: {selectedProduct.id || selectedProduct.slug}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Category: {selectedProduct.categoryLabel}</p>
                </div>
            </div>

            <dl className="mt-6 space-y-3 border-y border-border py-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Weight</dt>
                <dd className="font-medium">{selectedProduct.weight || 0}g</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Making Charges</dt>
                <dd className="font-price">
                  {formatINR((selectedProduct.makingCharges || 0) * (selectedProduct.weight || 0))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST (3%) Breakdown</dt>
                <dd className="font-price">
                  {formatINR(selectedProduct.price - (selectedProduct.price / 1.03))}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pt-4 border-t border-border border-dashed mt-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-maroon">Total Payable</dt>
                <dd className="font-price text-3xl font-semibold text-maroon">{formatINR(selectedProduct.price)}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-lg bg-maroon/5 p-4 text-xs text-maroon-deep">
              <span className="font-semibold block mb-1">Important:</span>
              Confirming this payment will immediately deduct this unique item from the online catalog and generate a downloadable invoice.
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleBillProduct}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-maroon px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-maroon-deep disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Collect Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
