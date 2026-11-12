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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
  return fmt.format(d);
}

function addressBlock(c) {
  const lines = [c.name, c.line1, c.line2, [c.city, c.state, c.postalCode].filter(Boolean).join(", "), c.country]
    .map((x) => String(x || "").trim())
    .filter(Boolean);
  return lines.map(escapeHtml).join("<br>");
}

function shipFrom(env) {
  return {
    name: env.SHIP_FROM_NAME || "EEKSEYE",
    line1: env.SHIP_FROM_LINE1 || "",
    line2: "",
    city: env.SHIP_FROM_CITY || "",
    state: env.SHIP_FROM_STATE || "",
    postalCode: env.SHIP_FROM_POSTAL || "",
    country: env.SHIP_FROM_COUNTRY || "US",
    phone: env.SHIP_FROM_PHONE || ""
  };
}

export function packingSlipHtml(order, env = {}, opts = {}) {
  const brand = env.BRAND_NAME || "EEKSEYE";
  const from = shipFrom(env);
  const when = formatDate(order.createdAt, order.timezone || env.TIMEZONE || "America/Los_Angeles");
  const money = formatMoney(order.amountCents, order.currency);
  const items = (order.items || [])
    .map((it) => {
      const design = it.design || order.design;
      const extra = [
        order.size ? `Size ${escapeHtml(order.size)}` : "",
        design ? `Design ${escapeHtml(design)}` : ""
      ]
        .filter(Boolean)
        .join(" · ");
      return `<tr>
        <td>${escapeHtml(it.name)}${extra ? `<div class="muted">${extra}</div>` : ""}</td>
        <td class="qty">${escapeHtml(it.quantity || 1)}</td>
        <td class="right">${escapeHtml(formatMoney(it.amountCents, it.currency || order.currency))}</td>
      </tr>`;
    })
    .join("");

  const testBanner = order.isTest
    ? `<div class="banner">TEST ORDER — do not ship</div>`
    : "";
  const labelBlock = order.label
    ? `<section>
        <h2>Shipping label</h2>
        <p>Carrier: ${escapeHtml(order.label.provider || "FedEx")} · Tracking: ${escapeHtml(order.label.trackingNumber || "pending")}</p>
        ${order.label.imageUrl ? `<img class="label" src="${escapeHtml(order.label.imageUrl)}" alt="Shipping label">` : "<p class='muted'>Label PDF is attached to this email.</p>"}
      </section>`
    : `<section>
        <h2>Shipping label</h2>
        <p class="muted">FedEx label will appear here once Ship API credentials are added.</p>
      </section>`;

  const printHint = opts.printable
    ? `<p class="hint">Print this page on letter paper. Write the order number on the package.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Packing slip ${escapeHtml(order.orderNumber)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #fff; color: #111; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .sheet { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 0.6in 0.7in; }
    header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
    .brand { font-size: 28px; letter-spacing: 0.22em; font-weight: 700; }
    .order-no { text-align: right; }
    .order-no .num { font-size: 32px; font-weight: 700; letter-spacing: 0.04em; }
    .banner { margin: 16px 0 0; padding: 8px 10px; border: 2px solid #111; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 24px 0; }
    h2 { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 8px; }
    .addr { line-height: 1.45; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 18px; }
    th { text-align: left; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #111; padding: 6px 0; }
    td { padding: 10px 0; border-bottom: 1px solid #ddd; vertical-align: top; }
    td.right, th.right { text-align: right; }
    td.qty, th.qty { text-align: center; width: 70px; }
    .muted { color: #444; font-size: 12px; margin-top: 4px; }
    .totals { text-align: right; font-size: 16px; font-weight: 700; }
    .meta { margin-top: 18px; font-size: 12px; color: #333; line-height: 1.5; }
    .hint { margin-top: 28px; font-size: 12px; }
    .cut { margin: 28px 0; border-top: 1px dashed #111; position: relative; }
    .cut span { position: absolute; top: -8px; left: 0; background: #fff; padding-right: 8px; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
    .label { max-width: 100%; border: 1px solid #111; }
    @media print {
      body { background: #fff; }
      .sheet { margin: 0; padding: 0.45in; width: auto; min-height: auto; }
      .hint { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${testBanner}
    <header>
      <div>
        <div class="brand">${escapeHtml(brand)}</div>
        <div class="muted">Packing slip</div>
      </div>
      <div class="order-no">
        <div class="muted">Order number</div>
        <div class="num">${escapeHtml(order.orderNumber)}</div>
      </div>
    </header>
    <div class="cols">
      <div>
        <h2>Ship from</h2>
        <div class="addr">${addressBlock(from)}${from.phone ? `<br>${escapeHtml(from.phone)}` : ""}</div>
      </div>
      <div>
        <h2>Ship to</h2>
        <div class="addr">${addressBlock(order.customer)}</div>
        <div class="muted">
          ${order.customer.phone ? `Phone: ${escapeHtml(order.customer.phone)}<br>` : ""}
          ${order.customer.email ? `Email: ${escapeHtml(order.customer.email)}` : ""}
        </div>
      </div>
    </div>
    <h2>Items</h2>
    <table>
      <thead><tr><th>Item</th><th class="qty">Qty</th><th class="right">Amount</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="totals">Total ${escapeHtml(money)}${order.amountShipping === 0 ? " · Free shipping" : ""}</div>
    <div class="meta">
      Date: ${escapeHtml(when)} (${escapeHtml(order.timezone || "America/Los_Angeles")})<br>
      Stripe session: ${escapeHtml(order.sessionId || "")}<br>
      ${order.paymentIntentId ? `Payment: ${escapeHtml(order.paymentIntentId)}<br>` : ""}
      Size: ${escapeHtml(order.size || "—")}${order.design ? ` · Design: ${escapeHtml(order.design)}` : ""}
    </div>
    <div class="cut"><span>Cut or fold</span></div>
    ${labelBlock}
    ${printHint}
  </div>
</body>
</html>`;
}

export function packingSlipText(order, env = {}) {
  const when = formatDate(order.createdAt, order.timezone || env.TIMEZONE || "America/Los_Angeles");
  const money = formatMoney(order.amountCents, order.currency);
  const c = order.customer || {};
  const addr = [c.name, c.line1, c.line2, [c.city, c.state, c.postalCode].filter(Boolean).join(", "), c.country]
    .filter(Boolean)
    .join("\n");
  const items = (order.items || [])
    .map((it) => `- ${it.name} x${it.quantity || 1} (${formatMoney(it.amountCents, it.currency || order.currency)})`)
    .join("\n");
  return [
    order.isTest ? "TEST ORDER — do not ship" : "",
    `EEKSEYE packing slip`,
    `Order ${order.orderNumber}`,
    "",
    "Ship to:",
    addr,
    c.phone ? `Phone: ${c.phone}` : "",
    c.email ? `Email: ${c.email}` : "",
    "",
    items,
    order.size ? `Size: ${order.size}` : "",
    order.design ? `Design: ${order.design}` : "",
    `Total: ${money}`,
    `Date: ${when}`,
    `Stripe session: ${order.sessionId}`
  ]
    .filter((line, i, arr) => line !== "" || (arr[i - 1] !== "" && i !== 0))
    .join("\n");
}
