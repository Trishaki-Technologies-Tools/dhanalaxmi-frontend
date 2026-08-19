import { formatINR } from "@/lib/catalog";
import type { Order } from "@/lib/orders";

/** Builds a printable HTML invoice and downloads it as a file (local, no backend). */
export function downloadInvoice(order: Order) {
  const subtotal = order.subtotal ?? order.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const codFee = order.codFee ?? 0;
  const savings = order.savings ?? 0;
  const a = order.address;
  const placed = new Date(order.createdAt).toLocaleString("en-IN");

  const rows = order.lines
    .map(
      (l) => `<tr>
        <td>${l.name}</td>
        <td class="c">${l.qty}</td>
        <td class="r">${formatINR(l.price)}</td>
        <td class="r">${formatINR(l.price * l.qty)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>Invoice ${order.id} — Dhanalaxmi Jeweler's</title>
<style>
  body{font-family:ui-sans-serif,system-ui,sans-serif;color:#141414;margin:0;padding:40px;}
  h1{font-family:Georgia,serif;font-size:28px;margin:0}
  .muted{color:#6b6b6b;font-size:12px}
  .brand{border-bottom:2px solid #a01418;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
  table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
  th,td{border-bottom:1px solid #e6e6e6;padding:10px 8px;text-align:left}
  th{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#6b6b6b}
  .r{text-align:right}.c{text-align:center}
  .totals{margin-top:20px;margin-left:auto;width:280px;font-size:13px}
  .totals div{display:flex;justify-content:space-between;padding:6px 0}
  .totals .grand{border-top:1px solid #141414;font-weight:700;font-size:16px}
  .box{margin-top:28px;font-size:13px;line-height:1.6}
  .tag{display:inline-block;background:#a01418;color:#fff;padding:6px 12px;border-radius:999px;font-size:10px;letter-spacing:.16em;text-transform:uppercase}
</style></head>
<body>
  <div class="brand">
    <div><h1>Dhanalaxmi Jeweler's</h1><p class="muted">Hallmarked 925 Sterling Silver</p></div>
    <div style="text-align:right"><p class="muted">Invoice</p><strong>${order.id}</strong><p class="muted">${placed}</p></div>
  </div>
  <span class="tag">${order.status === "cancelled" ? "Cancelled" : order.paid ? "Paid" : "Payable on delivery"} · ${order.method.toUpperCase()}</span>
  <table>
    <thead><tr><th>Item</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatINR(subtotal)}</span></div>
    <div><span>Insured shipping</span><span>Free</span></div>
    ${codFee > 0 ? `<div><span>COD handling</span><span>${formatINR(codFee)}</span></div>` : ""}
    ${savings > 0 ? `<div><span>You saved</span><span>${formatINR(savings)}</span></div>` : ""}
    <div class="grand"><span>Total</span><span>${formatINR(order.total)}</span></div>
  </div>
  <div class="box">
    <strong>Delivery address</strong><br/>
    ${a ? `${a.name}<br/>${a.address}<br/>${a.city} ${a.pincode}<br/>${a.phone ? `+91 ${a.phone}<br/>` : ""}${a.email ?? ""}` : order.shipTo}
  </div>
  <p class="muted" style="margin-top:32px">Thank you for shopping with Dhanalaxmi Jeweler's. GST-compliant tax invoice issued on dispatch.</p>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice-${order.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
