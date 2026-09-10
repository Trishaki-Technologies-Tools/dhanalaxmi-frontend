import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/invoice")({
  component: AdminInvoice,
});

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  };
  
  return convert(num);
}

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

  if (!order) return <div className="p-10 text-center font-sans">Loading invoice...</div>;

  const totalAmount = Number(order.totalAmount);
  const taxable = totalAmount / 1.03;
  const cgst = taxable * 0.015;
  const sgst = taxable * 0.015;
  const roundedTotal = Math.round(totalAmount);
  
  const isOnline = order.paymentMethod !== 'CASH';

  return (
    <div className="min-h-screen bg-gray-100 text-black p-8 font-sans print:p-0 print:bg-white flex justify-center">
      <div className="max-w-[210mm] w-full bg-white print:w-full print:max-w-none shadow-lg print:shadow-none">
        
        <div className="flex justify-between items-center mb-4 p-4 print:hidden bg-gray-50 border-b border-gray-200">
          <button 
            onClick={() => window.close()} 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
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

        {/* Invoice Paper */}
        <div className="p-6">
          <div className="border border-black flex flex-col w-full text-black">
            
            {/* Top section: Store Info */}
            <div className="flex flex-col border-b border-black text-center relative py-5">
              <div className="absolute top-5 right-4 text-right text-[12px] font-bold leading-tight">
                M: 8105765702<br/>9844960074
              </div>
              <h1 className="text-[34px] font-bold uppercase font-serif tracking-tight leading-none">Dhanlaxmi Jewellers</h1>
              <p className="text-[13px] font-bold mt-3">Shop No.554. Raghunath Peth, ANGOL, BELGAUM</p>
            </div>

            {/* Middle Section: Customer Info + Tax Invoice + Date/Invoice No */}
            <div className="flex border-b border-black min-h-[90px]">
              {/* Left Customer Info */}
              <div className="w-[38%] p-3 flex flex-col justify-center text-[12px]">
                <div className="flex gap-2">
                  <span className="font-bold w-16">Name:</span> 
                  <span className="font-bold uppercase">{order.customerName}</span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <span className="font-bold w-16">Address:</span> 
                  <span className="flex-1 uppercase font-semibold">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                    <br />
                    {order.city} {order.pincode}
                  </span>
                </div>
                <div className="flex gap-2 mt-1.5">
                  <span className="font-bold w-16">Mob.No:</span> 
                  <span className="font-bold">{order.customerPhone}</span>
                </div>
              </div>

              {/* Center TAX INVOICE */}
              <div className="w-[24%] border-x border-black flex items-center justify-center p-2">
                <span className="font-bold uppercase text-[15px] tracking-wide">Tax Invoice</span>
              </div>

              {/* Right Invoice Info */}
              <div className="w-[38%] p-3 flex flex-col justify-center text-[12px] font-bold gap-3">
                <div className="flex gap-2 pl-6">
                  <span className="w-20">Invoice No:</span> 
                  <span>{order.orderNumber}</span>
                </div>
                <div className="flex gap-2 pl-6">
                  <span className="w-20">Date:</span> 
                  <span>{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-xs text-center">
              <thead className="border-b border-black font-bold">
                <tr>
                  <th className="border-r border-black p-1.5 w-[4%]">NO</th>
                  <th className="border-r border-black p-1.5 w-[26%] text-left">Description</th>
                  <th className="border-r border-black p-1.5 w-[7%]">CT</th>
                  <th className="border-r border-black p-1.5 w-[7%]">HSN</th>
                  <th className="border-r border-black p-1.5 w-[9%]">Gr.Wt<br/>[Per Gm]</th>
                  <th className="border-r border-black p-1.5 w-[9%]">Net Wt<br/>[Per Gm]</th>
                  <th className="border-r border-black p-1.5 w-[9%]">Rate<br/>[Per Gm]</th>
                  <th className="border-r border-black p-1.5 w-[11%]">Mkg [%]<br/>Charges</th>
                  <th className="border-r border-black p-1.5 w-[8%]">Other<br/>Amount</th>
                  <th className="p-1.5 w-[10%]">Total<br/>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="align-top">
                    <td className="border-r border-black p-1.5">{idx + 1}</td>
                    <td className="border-r border-black p-1.5 text-left font-bold uppercase">
                      {item.productName} {item.quantity > 1 ? `(x${item.quantity})` : ""}
                    </td>
                    <td className="border-r border-black p-1.5">Silver</td>
                    <td className="border-r border-black p-1.5">7106</td>
                    <td className="border-r border-black p-1.5">-</td>
                    <td className="border-r border-black p-1.5">-</td>
                    <td className="border-r border-black p-1.5">{Number(item.price).toFixed(2)}</td>
                    <td className="border-r border-black p-1.5">-</td>
                    <td className="border-r border-black p-1.5">0.00</td>
                    <td className="p-1.5 font-bold">{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Filler row to ensure table has some minimum height */}
                <tr className="h-56">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>

                {/* Footer Summary */}
                <tr className="border-t border-black text-left">
                  <td colSpan={7} className="border-r border-black p-2 font-bold align-top">
                    Rs. {numberToWords(roundedTotal)} Only
                  </td>
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold">
                    Taxable Amount:
                  </td>
                  <td className="p-1.5 text-center font-bold">
                    {taxable.toFixed(2)}
                  </td>
                </tr>
                <tr className="text-left">
                  <td colSpan={7} className="border-r border-black border-t border-black p-2 align-top">
                    <div className="flex justify-between w-full font-bold px-2">
                      <span>By Cheque: 0</span>
                      <span>By Cash: {isOnline ? '0' : roundedTotal}</span>
                      <span>By Card/ UPI: {isOnline ? roundedTotal : '0'}</span>
                      <span>By NEFT/RTGS: 0</span>
                    </div>
                  </td>
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold">
                    Add CGST 1.5%:
                  </td>
                  <td className="p-1.5 text-center font-bold">
                    {cgst.toFixed(3)}
                  </td>
                </tr>
                <tr className="text-left">
                  <td colSpan={7} rowSpan={4} className="border-r border-black border-t border-black p-2 align-top">
                    <div className="font-bold underline mb-2">Bank Details:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-bold px-2">
                      <div>Bank Name: BANK OF INDIA</div>
                      <div>Account No.: 111220110000476</div>
                      <div>IFSC: BKID00011</div>
                      <div>Branch: ANGOL</div>
                    </div>
                    <div className="mt-12 flex justify-between px-10 font-bold">
                      <div className="text-center">Customer Signature</div>
                      <div className="text-center">For Dhanlaxmi Jewellers</div>
                    </div>
                  </td>
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold">
                    Add SGST 1.5%:
                  </td>
                  <td className="p-1.5 text-center font-bold">
                    {sgst.toFixed(3)}
                  </td>
                </tr>
                <tr className="text-left">
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold">
                    Discount:
                  </td>
                  <td className="p-1.5 text-center font-bold">
                    0.00
                  </td>
                </tr>
                <tr className="text-left">
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold">
                    URD Amount:
                  </td>
                  <td className="p-1.5 text-center font-bold">
                    0.00
                  </td>
                </tr>
                <tr className="text-left">
                  <td colSpan={2} className="border-r border-black p-1.5 text-right font-bold text-[13px]">
                    Total Invoice:
                  </td>
                  <td className="p-1.5 text-center font-bold text-[13px]">
                    {roundedTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </div>
  );
}

