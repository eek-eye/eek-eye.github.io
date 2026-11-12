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
      design: order.design || ""
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

async function sendViaResend(env, { from, to, subject, text, html }) {
  if (!env.RESEND_API_KEY) return null;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, text, html })
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, provider: "resend", error: err.slice(0, 300) };
  }
  return { ok: true, provider: "resend" };
}

export async function emailPackingSlip(env, order, slipUrl) {
  const to = env.OWNER_EMAIL || "fuchendeonze@gmail.com";
  const fromName = env.BRAND_NAME || "EEKSEYE";
  const rawFrom = (env.EMAIL_FROM || "").trim();
  let from;
  if (rawFrom.includes("<") && rawFrom.includes(">")) {
    from = rawFrom;
  } else if (rawFrom.includes("@")) {
    from = `${fromName} <${rawFrom}>`;
  } else {
    from = `${fromName} <orders@${env.EMAIL_FROM_DOMAIN || "eekseye.com"}>`;
  }
  const subject = `${order.isTest ? "[TEST] " : ""}EEKSEYE packing slip ${order.orderNumber}`;
  const html = packingSlipHtml(order, env, { printable: true });
  const text = packingSlipText(order, env) + (slipUrl ? `\n\nPrintable slip: ${slipUrl}` : "");
  const payload = { from, to, subject, text, html, order, slipUrl };

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
