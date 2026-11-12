import { verifyStripeSignature } from "./stripe.js";
import { buildOrder, loadOrder, saveOrder } from "./orders.js";
import { packingSlipHtml } from "./packing-slip.js";
import { emailPackingSlip } from "./email.js";
import { createShippingLabel, withLabel } from "./labels.js";

const enc = new TextEncoder();

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function viewSecret(env) {
  return env.SLIP_VIEW_SECRET || env.STRIPE_WEBHOOK_SECRET || "";
}

export async function slipToken(env, orderNumber) {
  const secret = viewSecret(env);
  if (!secret) return "";
  return hmacHex(secret, `slip:${orderNumber}`);
}

function b64urlEncode(str) {
  const bytes = enc.encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(str) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
}

export async function encodeOrderPayload(env, order) {
  const secret = viewSecret(env);
  const body = b64urlEncode(JSON.stringify(order));
  if (!secret) return { body, sig: "" };
  return { body, sig: await hmacHex(secret, `order:${body}`) };
}

async function decodeOrderPayload(env, body, sig) {
  if (!body) return null;
  const secret = viewSecret(env);
  if (secret) {
    const expected = await hmacHex(secret, `order:${body}`);
    if (!sig || expected.length !== sig.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    if (diff !== 0) return null;
  }
  try {
    return JSON.parse(b64urlDecode(body));
  } catch {
    return null;
  }
}

async function tokenOk(env, orderNumber, token) {
  if (!token) return false;
  const expected = await slipToken(env, orderNumber);
  if (!expected || expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

async function handleWebhook(request, env) {
  const raw = await request.text();
  try {
    await verifyStripeSignature(raw, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return json({ error: "invalid_signature", message: String(err.message || err) }, 400);
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (event.type && event.type !== "checkout.session.completed") {
    return json({ received: true, ignored: event.type });
  }

  const session = event.data && event.data.object;
  if (!session || !session.id) return json({ error: "missing_session" }, 400);
  if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return json({ received: true, skipped: "not_paid", payment_status: session.payment_status });
  }

  let order = await buildOrder(env, session, { isTest: event.livemode === false || session.metadata?.source === "test" });
  const label = await createShippingLabel(env, order);
  order = withLabel(order, label);
  await saveOrder(env, order);

  const origin = new URL(request.url).origin;
  const token = await slipToken(env, order.orderNumber);
  const packed = await encodeOrderPayload(env, order);
  const qs = new URLSearchParams();
  if (token) qs.set("t", token);
  if (order.sessionId) qs.set("session", order.sessionId);
  if (packed.body) qs.set("d", packed.body);
  if (packed.sig) qs.set("s", packed.sig);
  const slipUrl = `${origin}/slip/${encodeURIComponent(order.orderNumber)}${qs.toString() ? `?${qs}` : ""}`;
  const emailed = await emailPackingSlip(env, order, slipUrl);
  console.log(
    JSON.stringify({
      msg: "packing_slip_processed",
      orderNumber: order.orderNumber,
      sessionId: order.sessionId,
      reused: order.reused,
      emailed: emailed.ok,
      emailProvider: emailed.provider
    })
  );

  return json({
    received: true,
    orderNumber: order.orderNumber,
    sessionId: order.sessionId,
    reused: order.reused,
    emailed: emailed.ok,
    emailProvider: emailed.provider,
    slipUrl,
    emailError: emailed.ok ? undefined : emailed.error
  });
}

async function handleSlip(request, env, orderNumber) {
  const url = new URL(request.url);
  const ok = await tokenOk(env, orderNumber, url.searchParams.get("t") || "");
  if (!ok) return json({ error: "forbidden" }, 403);
  let order = await loadOrder(env, orderNumber);
  if (!order) {
    order = await decodeOrderPayload(env, url.searchParams.get("d") || "", url.searchParams.get("s") || "");
    if (order && order.orderNumber && order.orderNumber !== orderNumber) order = null;
  }
  const sessionId = url.searchParams.get("session");
  if (!order && sessionId && env.STRIPE_SECRET_KEY) {
    const { retrieveSession } = await import("./stripe.js");
    const session = await retrieveSession(env, sessionId);
    if (session) order = await buildOrder(env, session, { orderNumber });
  }
  if (!order) {
    return json({ error: "not_found", hint: "Print the packing slip from the email if this link has expired." }, 404);
  }
  return new Response(packingSlipHtml(order, env, { printable: true }), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") {
      return json({ ok: true, service: "eekseye-orders" });
    }
    if (request.method === "POST" && (url.pathname === "/stripe/webhook" || url.pathname === "/webhook")) {
      try {
        return await handleWebhook(request, env);
      } catch (err) {
        console.log(JSON.stringify({ msg: "webhook_failed", error: String(err && err.message ? err.message : err) }));
        return json({ error: "internal", message: "Failed to process webhook" }, 500);
      }
    }
    const slip = url.pathname.match(/^\/slip\/([^/]+)$/);
    if (request.method === "GET" && slip) {
      return handleSlip(request, env, decodeURIComponent(slip[1]));
    }
    return json({ error: "not_found" }, 404);
  }
};
