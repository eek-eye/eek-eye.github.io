import { packingSlipHtml, packingSlipText } from "./packing-slip.js";

function rawMime({ from, to, subject, text, html }) {
  const boundary = "eekseye-slip-alt";
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    `--${boundary}--`,
    ""
  ].join("\r\n");
}

async function sendViaCloudflareBinding(env, { from, to, subject, text, html }) {
  if (!env.PACKING_SLIP_EMAIL || typeof env.PACKING_SLIP_EMAIL.send !== "function") return null;
  const raw = rawMime({ from, to, subject, text, html });
  // EmailMessage is provided by the Workers runtime when send_email is bound.
  // eslint-disable-next-line no-undef
  const msg = typeof EmailMessage === "function" ? new EmailMessage(from, to, raw) : null;
  if (!msg) return { ok: false, provider: "cloudflare_email", error: "EmailMessage is not available" };
  await env.PACKING_SLIP_EMAIL.send(msg);
  return { ok: true, provider: "cloudflare_email" };
}

async function sendViaEmailJs(env, { to, subject, text, html, order, slipUrl }) {
  const publicKey = env.EMAILJS_PUBLIC_KEY;
  const serviceId = env.EMAILJS_SERVICE_ID;
  const templateId = env.EMAILJS_TEMPLATE_ID;
  if (!publicKey || !serviceId || !templateId) return null;
  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: to,
      subject,
      message: text,
      html_message: html,
      order_number: order.orderNumber,
      slip_url: slipUrl || "",
      shirt: (order.items && order.items[0] && order.items[0].name) || "",
      size: order.size || "",
      design: order.design || "",
      tracking_number: (order.label && order.label.trackingNumber) || "",
      tracking_url: (order.label && order.label.trackingUrl) || "",
      label_url: (order.label && order.label.labelUrl) || "",
      carrier: (order.label && (order.label.carrier || order.label.provider)) || ""
    }
  };
  if (env.EMAILJS_PRIVATE_KEY) body.accessToken = env.EMAILJS_PRIVATE_KEY;
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, provider: "emailjs", error: err.slice(0, 300) };
  }
  return { ok: true, provider: "emailjs" };
}

async function sendViaResend(env, { from, to, subject, text, html, attachments }) {
  if (!env.RESEND_API_KEY) return null;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, text, html, ...(attachments && attachments.length ? { attachments } : {}) })
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, provider: "resend", error: err.slice(0, 300) };
  }
  return { ok: true, provider: "resend" };
}

export async function emailPackingSlip(env, order, slipUrl) {
  const to = env.OWNER_EMAIL || "fuchendeonze@gmail.com";
  const fromName = env.BRAND_NAME || "eekseye";
  const rawFrom = (env.EMAIL_FROM || "").trim();
  let from;
  if (rawFrom.includes("<") && rawFrom.includes(">")) {
    from = rawFrom;
  } else if (rawFrom.includes("@")) {
    from = `${fromName} <${rawFrom}>`;
  } else {
    from = `${fromName} <orders@${env.EMAIL_FROM_DOMAIN || "eekseye.com"}>`;
  }
  const label = order.label || null;
  const trackBit = label && label.ok && label.trackingNumber ? ` — ${label.carrier || label.provider || "Ship"} ${label.trackingNumber}` : "";
  const subject = `${order.isTest ? "[TEST] " : ""}eekseye packing slip ${order.orderNumber}${trackBit}`;
  const attachments = [];
  if (label && label.ok && label.pdfBase64) {
    attachments.push({ filename: `shipping-label-${order.orderNumber}.pdf`, content: label.pdfBase64 });
  }
  if (label && label.ok && label.invoicePdfBase64) {
    attachments.push({ filename: `commercial-invoice-${order.orderNumber}.pdf`, content: label.invoicePdfBase64 });
  }
  // Email HTML never carries the label bytes inline; the 4x6 label PDF is attached or linked.
  const html = packingSlipHtml(order, env, { printable: true, includeLabel: false });
  const labelLines = [];
  if (label && label.ok) {
    if (attachments.length) {
      labelLines.push(`Shipping label (4x6 PDF) attached: ${attachments[0].filename}`);
    }
    if (label.labelUrl) labelLines.push(`Label PDF: ${label.labelUrl}`);
    if (label.trackingNumber) labelLines.push(`${label.carrier || label.provider || "Carrier"} tracking: ${label.trackingNumber}`);
    if (label.trackingUrl) labelLines.push(`Track: ${label.trackingUrl}`);
    if (attachments[1]) labelLines.push("Print 3 copies of the commercial invoice and put them in the pouch.");
  } else if (label && label.ok === false && label.error) {
    labelLines.push(`Label not created: ${label.error}`);
  }
  const labelNote = labelLines.length ? `\n\n` + labelLines.join("\n") : "";
  const text = packingSlipText(order, env) + labelNote + (slipUrl ? `\n\nPrintable slip: ${slipUrl}` : "");
  const payload = { from, to, subject, text, html, order, slipUrl, attachments };

  const attempts = [];
  for (const fn of [sendViaCloudflareBinding, sendViaResend, sendViaEmailJs]) {
    try {
      const result = await fn(env, payload);
      if (result == null) continue;
      attempts.push(result);
      if (result.ok) return result;
    } catch (err) {
      attempts.push({ ok: false, provider: fn.name, error: String(err && err.message ? err.message : err) });
    }
  }
  return {
    ok: false,
    provider: "none",
    error: "No email provider succeeded",
    attempts
  };
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buyerFrom(env) {
  const fromName = env.BRAND_NAME || "eekseye";
  const rawFrom = (env.EMAIL_FROM || "").trim();
  if (rawFrom.includes("<") && rawFrom.includes(">")) return rawFrom;
  if (rawFrom.includes("@")) return `${fromName} <${rawFrom}>`;
  return `${fromName} <orders@${env.EMAIL_FROM_DOMAIN || "eekseye.com"}>`;
}

function buyerTrackingCopy(order) {
  const label = order.label || {};
  const carrier = label.carrier || label.provider || "the carrier";
  const tracking = label.trackingNumber || "";
  const url = label.trackingUrl || "";
  const text = [
    `Thank you for your eekseye order ${order.orderNumber}.`,
    "",
    `Your package is on the way with ${carrier}.`,
    tracking ? `Tracking number: ${tracking}` : "",
    url ? `Track your shipment: ${url}` : "",
    "",
    "If you have a question, reply to this email or write to fuchendeonze@gmail.com."
  ]
    .filter((line, i, arr) => !(line === "" && (i === 0 || arr[i - 1] === "")))
    .join("\n")
    .trim();
  const html = `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:24px;">
  <p>Thank you for your <strong>eekseye</strong> order <strong>${escapeHtml(order.orderNumber)}</strong>.</p>
  <p>Your package is on the way with ${escapeHtml(carrier)}.</p>
  ${tracking ? `<p>Tracking number: <strong>${escapeHtml(tracking)}</strong></p>` : ""}
  ${url ? `<p><a href="${escapeHtml(url)}">Track your shipment</a></p>` : ""}
  <p style="color:#555;font-size:13px;">If you have a question, reply to this email or write to fuchendeonze@gmail.com.</p>
</body></html>`;
  return { text, html, subject: `Your eekseye order is on the way${tracking ? ` — ${tracking}` : ""}` };
}

/**
 * Email the buyer their tracking number and link.
 * Skips Stripe test orders (unless SHIPPO_EMAIL_TEST_BUYERS=1), missing emails,
 * failed labels, and orders already marked as emailed.
 */
export async function emailBuyerTracking(env, order) {
  const label = order.label || {};
  const to = order.customer && order.customer.email;
  if (!to) return { ok: false, skipped: "no_email" };
  if (!label.ok || !label.trackingNumber) return { ok: false, skipped: "no_tracking" };
  if (label.buyerEmailed || (order.stripeMetadata && order.stripeMetadata.eekseye_buyer_tracking_sent === "1")) {
    return { ok: true, skipped: "already_sent" };
  }
  if (order.isTest && env.SHIPPO_EMAIL_TEST_BUYERS !== "1") {
    return { ok: false, skipped: "test_order" };
  }

  const from = buyerFrom(env);
  const { text, html, subject } = buyerTrackingCopy(order);
  const payload = { from, to, subject, text, html, order, slipUrl: "", attachments: [] };

  // Do not reuse the owner packing-slip EmailJS template for buyers.
  const buyerEmailJsEnv = {
    ...env,
    EMAILJS_TEMPLATE_ID: env.EMAILJS_TEMPLATE_ID_TRACKING || env.EMAILJS_TEMPLATE_ID_BUYER || ""
  };
  const attempts = [];
  const tryEmailJs = (e, payload) => sendViaEmailJs(buyerEmailJsEnv, payload);
  for (const fn of [sendViaResend, tryEmailJs, sendViaCloudflareBinding]) {
    try {
      const result = await fn(env, payload);
      if (result == null) continue;
      attempts.push(result);
      if (result.ok) {
        try {
          const { updateShippingMetadata } = await import("./stripe.js");
          await updateShippingMetadata(env, order, { eekseye_buyer_tracking_sent: "1" });
        } catch (err) {
          console.log(JSON.stringify({ msg: "buyer_email_flag_failed", orderNumber: order.orderNumber, error: String(err && err.message ? err.message : err).slice(0, 200) }));
        }
        return result;
      }
    } catch (err) {
      attempts.push({ ok: false, provider: fn.name, error: String(err && err.message ? err.message : err) });
    }
  }
  return { ok: false, provider: "none", error: "No email provider succeeded", attempts };
}
