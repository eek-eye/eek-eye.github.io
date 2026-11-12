function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatMoney(cents, currency = "USD") {
  const n = Number(cents || 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function formatDate(ms, timeZone = "America/Los_Angeles") {
  const d = new Date(ms);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
  return fmt.format(d);
}

function addressLines(c) {
  return [c.name, c.line1, c.line2, [c.city, c.state, c.postalCode].filter(Boolean).join(", "), c.country]
    .map((x) => String(x || "").trim())
    .filter(Boolean);
}

function labelImageSrc(label) {
  if (!label) return "";
  if (label.imageUrl) return label.imageUrl;
  const png = label.pngBase64 || label.imagePngBase64;
  if (!png) return "";
  return String(png).startsWith("data:") ? png : `data:image/png;base64,${png}`;
}

/** Page 2: only for raster labels. PDF labels travel as an email attachment (prints 4x6 as-is). */
function labelPage(order) {
  const src = labelImageSrc(order.label);
  if (!src) return "";
  return `<section class="label-page"><img class="label-art" src="${escapeHtml(src)}" alt="Shipping label"></section>`;
}

export function shippingStatus(order) {
  const l = order.label;
  if (!l) return null;
  if (l.ok === false) return { ok: false, text: `Label failed: ${l.error || "unknown error"}` };
  if (!l.trackingNumber) return null;
  return { ok: true, text: `${l.provider || "FedEx"} tracking: ${l.trackingNumber}${l.sandbox ? " (sandbox test)" : ""}` };
}

export function packingSlipHtml(order, env = {}, opts = {}) {
  const brand = env.BRAND_NAME || "eekseye";
  const when = formatDate(order.createdAt, order.timezone || env.TIMEZONE || "America/Los_Angeles");
  const money = formatMoney(order.amountCents, order.currency);
  const c = order.customer || {};
  const addr = addressLines(c).map(escapeHtml).join("<br>");

  const items = (order.items || [])
    .map((it) => {
      const design = it.design || order.design;
      const extra = [
        order.size ? `Size ${escapeHtml(order.size)}` : "",
        design ? `Design ${escapeHtml(design)}` : ""
      ]
        .filter(Boolean)
        .join(" · ");
      return `<div class="item">
        <div class="item-name">${escapeHtml(it.name)}</div>
        ${extra ? `<div class="item-meta">${extra}</div>` : ""}
        <div class="item-row"><span>Qty ${escapeHtml(it.quantity || 1)}</span><span>${escapeHtml(formatMoney(it.amountCents, it.currency || order.currency))}</span></div>
      </div>`;
    })
    .join("");

  const status = shippingStatus(order);
  const testBanner = order.isTest ? `<div class="banner">TEST — do not ship</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Packing slip ${escapeHtml(order.orderNumber)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { size: 4in 6in; margin: 0.15in; }
    @page label-sheet { size: 4in 6in; margin: 0; }
    html, body { width: 4in; height: 6in; }
    .sheet {
      width: 4in;
      height: 6in;
      padding: 0.15in;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    header { border-bottom: 3px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
    .brand { font-size: 15px; font-weight: 800; letter-spacing: 0; }
    .num { font-size: 12px; font-weight: 600; letter-spacing: 0.02em; margin-top: 3px; }
    .num .lbl { font-weight: 400; color: #444; }
    .banner { margin: 0 0 8px; padding: 4px 6px; border: 2px solid #000; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; text-align: center; }
    h2 { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 800; margin: 0 0 4px; }
    .ship { margin-bottom: 10px; }
    .addr { font-size: 14px; font-weight: 700; line-height: 1.25; }
    .phone { font-size: 13px; font-weight: 700; margin-top: 4px; }
    .item { border-top: 2px solid #000; padding: 8px 0; }
    .item-name { font-size: 13px; font-weight: 800; line-height: 1.2; }
    .item-meta { font-size: 13px; font-weight: 700; margin-top: 3px; }
    .item-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-top: 4px; }
    .footer { margin-top: auto; border-top: 3px solid #000; padding-top: 6px; }
    .totals { font-size: 18px; font-weight: 800; }
    .date { font-size: 11px; font-weight: 700; margin-top: 3px; }
    .shipline { font-size: 11px; font-weight: 700; margin-top: 3px; word-break: break-word; }
    .shipline.bad { font-weight: 400; }
    .label-page {
      width: 4in;
      height: 6in;
      padding: 0;
      overflow: hidden;
      page: label-sheet;
      page-break-before: always;
      break-before: page;
      position: relative;
      background: #fff;
    }
    .label-page .label-art { width: 4in; height: 6in; object-fit: contain; display: block; border: 0; }
    .label-tracking { display: none; }
    @media print {
      html, body { width: auto; height: auto; }
      body { background: #fff; }
      .sheet {
        width: auto;
        height: 5.7in;
        max-height: 5.7in;
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .label-page { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${testBanner}
    <header>
      <div class="brand">${escapeHtml(brand)}</div>
      <div class="num"><span class="lbl">Order number:</span> ${escapeHtml(order.orderNumber)}</div>
    </header>
    <div class="ship">
      <h2>Ship to</h2>
      <div class="addr">${addr}</div>
      ${c.phone ? `<div class="phone">${escapeHtml(c.phone)}</div>` : ""}
    </div>
    ${items}
    <div class="footer">
      <div class="totals">Total ${escapeHtml(money)}</div>
      <div class="date">${escapeHtml(when)}</div>
      ${status ? `<div class="shipline${status.ok ? "" : " bad"}">${escapeHtml(status.text)}</div>` : ""}
    </div>
  </div>
  ${opts.includeLabel === false ? "" : labelPage(order)}
</body>
</html>`;
}

export function packingSlipText(order, env = {}) {
  const when = formatDate(order.createdAt, order.timezone || env.TIMEZONE || "America/Los_Angeles");
  const money = formatMoney(order.amountCents, order.currency);
  const c = order.customer || {};
  const addr = addressLines(c).join("\n");
  const items = (order.items || [])
    .map((it) => {
      const design = it.design || order.design;
      const extra = [order.size ? `Size ${order.size}` : "", design ? `Design ${design}` : ""].filter(Boolean).join(" · ");
      return `${it.name}\n${extra}\nQty ${it.quantity || 1}  ${formatMoney(it.amountCents, it.currency || order.currency)}`;
    })
    .join("\n\n");
  return [
    order.isTest ? "TEST — do not ship" : "",
    "eekseye",
    `Order number: ${order.orderNumber}`,
    "",
    "Ship to:",
    addr,
    c.phone ? c.phone : "",
    "",
    items,
    "",
    `Total ${money}`,
    when,
    shippingStatus(order) ? shippingStatus(order).text : ""
  ]
    .filter((line, i, arr) => !(line === "" && (i === 0 || arr[i - 1] === "")))
    .join("\n")
    .trim();
}
