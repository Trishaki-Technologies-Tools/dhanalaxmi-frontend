import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/catalog";
import { Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/invoice")({
  component: AdminInvoice,
});

function AdminInvoice() {
  const { order: orderId } = Route.useSearch<{ order: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    api.request(`/orders/track/${orderId}`).then((res: any) => {
      setOrder(res.order);
    }).catch(() => {
      toast.error("Invoice not found");
    });
  }, [orderId]);

  if (!order) return <div className="p-10 text-center">Loading invoice...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans print:p-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button 
            onClick={() => window.close()} 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft className="size-4" /> Close
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
          >
            <Printer className="size-4" /> Print Invoice
          </button>
        </div>

        <div className="border border-gray-200 p-10 print:border-none print:p-0">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-serif text-maroon font-bold tracking-tight">DHANALAXMI</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-1">Silver Luxe</p>
              <div className="mt-4 text-sm text-gray-600">
                <p>123 Silver Market,</p>
                <p>Mumbai, Maharashtra 400002</p>
                <p>GSTIN: 27AABCU9603R1ZX</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-light text-gray-400 uppercase tracking-widest">TAX INVOICE</h2>
              <div className="mt-4 text-sm">
                <p className="font-semibold text-gray-900">Invoice No: {order.orderNumber}</p>
                <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-600">Payment: {order.paymentMethod}</p>
                <p className="text-gray-600 font-semibold mt-1">
                  Status: {order.paymentStatus === "PAID" ? <span className="text-green-600">PAID</span> : "PENDING"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Bill To</h3>
            <p className="font-medium text-lg">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1">{order.addressLine1}</p>
            {order.addressLine2 && <p className="text-sm text-gray-600">{order.addressLine2}</p>}
            <p className="text-sm text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-sm text-gray-600 mt-2">Ph: {order.customerPhone}</p>
            {order.customerEmail && <p className="text-sm text-gray-600">{order.customerEmail}</p>}
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b-2 border-gray-900 text-xs uppercase tracking-wider text-gray-500">
                <th className="py-3 font-semibold">Item Description</th>
                <th className="py-3 text-right font-semibold">Qty</th>
                <th className="py-3 text-right font-semibold">Rate</th>
                <th className="py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {order.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-4">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-gray-500">SKU: {item.productSlug}</p>
                  </td>
                  <td className="py-4 text-right">{item.quantity}</td>
                  <td className="py-4 text-right">{formatINR(Number(item.price))}</td>
                  <td className="py-4 text-right font-medium">{formatINR(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(Number(order.totalAmount))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (3%) Included</span>
                <span>{formatINR(Number(order.totalAmount) * 0.03)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-gray-900 pt-3">
                <span>Total</span>
                <span>{formatINR(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-xs text-gray-500 border-t border-gray-200 pt-8">
            <p>Thank you for shopping with Dhanalaxmi Silver Luxe.</p>
            <p>This is a computer generated invoice and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
