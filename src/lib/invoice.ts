import { formatINR } from "@/lib/catalog";
import type { Order } from "@/lib/orders";

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

/** Builds a printable HTML invoice and opens print dialog for PDF export. */
export function downloadInvoice(order: Order) {
  const totalAmount = order.total;
  const taxable = totalAmount / 1.03;
  const cgst = taxable * 0.015;
  const sgst = taxable * 0.015;
  const roundedTotal = Math.round(totalAmount);
  
  const isOnline = order.method.toLowerCase() !== 'cod' && order.method.toLowerCase() !== 'cash';
  const placed = new Date(order.createdAt).toLocaleDateString("en-GB");

  const a = order.address || { name: order.shipTo, address: '', city: '', pincode: '', phone: '' };

  let rowsHtml = '';
  order.lines.forEach((l, idx) => {
    rowsHtml += `<tr>
      <td>${idx + 1}</td>
      <td class="text-left bold uppercase">${l.name} ${l.qty > 1 ? `(x${l.qty})` : ""}</td>
      <td>Silver</td>
      <td>7106</td>
      <td>-</td>
      <td>-</td>
      <td>${Number(l.price).toFixed(2)}</td>
      <td>-</td>
      <td>0.00</td>
      <td class="bold">${Number(l.price * l.qty).toFixed(2)}</td>
    </tr>`;
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${order.id} — Dhanalaxmi Jeweler's</title>
  <style>
    @media print {
      @page { size: A4; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body { font-family: system-ui, sans-serif; color: #000; margin: 0; padding: 20px; font-size: 11px; }
    .wrapper { max-width: 210mm; margin: 0 auto; border: 1px solid #000; }
    
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    
    .header-top { border-bottom: 1px solid #000; text-align: center; position: relative; padding: 20px 0; }
    .header-middle { display: flex; border-bottom: 1px solid #000; min-height: 90px; }
    
    .hm-left { width: 38%; padding: 12px; font-size: 12px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
    .hm-center { width: 24%; border-left: 1px solid #000; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
    .hm-right { width: 38%; padding: 12px 12px 12px 24px; font-size: 12px; display: flex; flex-direction: column; justify-content: center; gap: 12px; font-weight: bold; }
    
    .absolute-phones { position: absolute; top: 20px; right: 16px; text-align: right; font-size: 12px; font-weight: bold; line-height: 1.2; }
    .brand-title { font-size: 34px; font-weight: bold; text-transform: uppercase; font-family: serif; margin: 0; letter-spacing: -0.5px; line-height: 1; }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    
    table { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px; }
    th { font-weight: bold; }
    
    /* Remove outside borders for inner table cells */
    .table-main th { border-top: none; }
    .table-main th:first-child, .table-main td:first-child { border-left: none; }
    .table-main th:last-child, .table-main td:last-child { border-right: none; }
    
    .align-top { vertical-align: top; }
  </style>
</head>
<body onload="window.print(); window.setTimeout(window.close, 1000);">
  <div class="wrapper">
    
    <div class="header-top">
      <div class="absolute-phones">M: 8105765702<br/>9844960074</div>
      <h1 class="brand-title">Dhanlaxmi Jewellers</h1>
      <div class="bold" style="font-size: 13px; margin-top: 12px;">Shop No.554. Raghunath Peth, ANGOL, BELGAUM</div>
    </div>
    
    <div class="header-middle">
      <div class="hm-left">
        <div class="flex"><div style="width: 60px" class="bold">Name:</div> <div class="bold uppercase">${a.name || order.shipTo}</div></div>
        <div class="flex"><div style="width: 60px" class="bold">Address:</div> <div class="uppercase bold">${a.address || ''}<br/>${a.city || ''} ${a.pincode || ''}</div></div>
        <div class="flex"><div style="width: 60px" class="bold">Mob.No:</div> <div class="bold">${a.phone || ''}</div></div>
      </div>
      
      <div class="hm-center">
        Tax Invoice
      </div>
      
      <div class="hm-right">
        <div class="flex"><div style="width: 80px">Invoice No:</div> <div>${order.id.slice(0,8).toUpperCase()}</div></div>
        <div class="flex"><div style="width: 80px">Date:</div> <div>${placed}</div></div>
      </div>
    </div>
    
    <table class="table-main">
      <thead>
        <tr>
          <th style="width: 4%">NO</th>
          <th style="width: 26%" class="text-left">Description</th>
          <th style="width: 7%">CT</th>
          <th style="width: 7%">HSN</th>
          <th style="width: 9%">Gr.Wt<br/>[Per Gm]</th>
          <th style="width: 9%">Net Wt<br/>[Per Gm]</th>
          <th style="width: 9%">Rate<br/>[Per Gm]</th>
          <th style="width: 11%">Mkg [%]<br/>Charges</th>
          <th style="width: 8%">Other<br/>Amount</th>
          <th style="width: 10%">Total<br/>Amount</th>
        </tr>
      </thead>
      <tbody style="min-height: 200px">
        ${rowsHtml}
        <tr style="height: 180px">
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      </tbody>
    </table>
    
    <table class="table-main" style="border-top: 1px solid #000;">
      <tbody>
        <tr class="text-left">
          <td colspan="7" class="bold align-top" style="width: 71%; padding: 8px;">
            Rs. ${numberToWords(roundedTotal)} Only
          </td>
          <td colspan="2" class="text-right bold" style="width: 19%">Taxable Amount:</td>
          <td class="text-center bold" style="width: 10%">${taxable.toFixed(2)}</td>
        </tr>
        <tr class="text-left">
          <td colspan="7" class="align-top" style="padding: 8px;">
            <div class="flex justify-between bold" style="padding: 0 8px;">
              <span>By Cheque: 0</span>
              <span>By Cash: ${isOnline ? '0' : roundedTotal}</span>
              <span>By Card/ UPI: ${isOnline ? roundedTotal : '0'}</span>
              <span>By NEFT/RTGS: 0</span>
            </div>
          </td>
          <td colspan="2" class="text-right bold">Add CGST 1.5%:</td>
          <td class="text-center bold">${cgst.toFixed(3)}</td>
        </tr>
        <tr class="text-left">
          <td colspan="7" rowspan="4" class="align-top" style="padding: 8px;">
            <div class="bold" style="text-decoration: underline; margin-bottom: 8px;">Bank Details:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-weight: bold; padding: 0 8px;">
              <div>Bank Name: BANK OF INDIA</div>
              <div>Account No.: 111220110000476</div>
              <div>IFSC: BKID00011</div>
              <div>Branch: ANGOL</div>
            </div>
            <div class="flex justify-between bold" style="padding: 0 40px; margin-top: 48px;">
              <div class="text-center">Customer Signature</div>
              <div class="text-center">For Dhanlaxmi Jewellers</div>
            </div>
          </td>
          <td colspan="2" class="text-right bold">Add SGST 1.5%:</td>
          <td class="text-center bold">${sgst.toFixed(3)}</td>
        </tr>
        <tr class="text-left">
          <td colspan="2" class="text-right bold">Discount:</td>
          <td class="text-center bold">0.00</td>
        </tr>
        <tr class="text-left">
          <td colspan="2" class="text-right bold">URD Amount:</td>
          <td class="text-center bold">0.00</td>
        </tr>
        <tr class="text-left">
          <td colspan="2" class="text-right bold" style="font-size: 13px">Total Invoice:</td>
          <td class="text-center bold" style="font-size: 13px">${roundedTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const newWin = window.open("", "_blank");
  if (newWin) {
    newWin.document.write(html);
    newWin.document.close();
  } else {
    // Fallback if popup blocked
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
}
