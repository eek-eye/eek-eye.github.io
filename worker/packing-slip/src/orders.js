import { SHIRTS, siteIdFromSession } from "./catalog.js";
import { fieldValue, lineItemsFromSession, retrieveSession, shippingFromSession } from "./stripe.js";

const COUNTER_PRODUCT_ID = "eekseye-order-seq";

async function stripeForm(env, method, path, params) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const body = params
    ? new URLSearchParams(
        Object.entries(params).flatMap(([k, v]) =>
          v && typeof v === "object"
            ? Object.entries(v).map(([ik, iv]) => [`${k}[${ik}]`, String(iv)])
            : [[k, String(v)]]
        )
      )
    : null;
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const data = await res.json();
  if (!res.ok) {
    console.log(JSON.stringify({ msg: "stripe_api_failed", path, status: res.status, code: data.code || data.error }));
    return null;
  }
  return data;
}

async function assignFromStripe(env, sessionId) {
  const session = await stripeForm(env, "GET", `checkout/sessions/${encodeURIComponent(sessionId)}`);
  if (session && session.metadata && session.metadata.order_number) {
    return { orderNumber: session.metadata.order_number, sessionId, createdAt: Date.now(), reused: true };
  }

  let counter = await stripeForm(env, "GET", `products/${COUNTER_PRODUCT_ID}`);
  if (!counter) {
    counter = await stripeForm(env, "POST", "products", {
      id: COUNTER_PRODUCT_ID,
      name: "EEKSEYE Order Sequence",
      active: "false",
      "metadata[next_order]": String(env.ORDER_START || "1001"),
      "metadata[purpose]": "internal-order-counter"
    });
    // Retry GET if create failed because it already exists
    if (!counter) counter = await stripeForm(env, "GET", `products/${COUNTER_PRODUCT_ID}`);
  }
  const start = Number(env.ORDER_START || "1001");
  let next = Number((counter && counter.metadata && counter.metadata.next_order) || start);
  if (!Number.isFinite(next) || next < start) next = start;
  const orderNumber = `${env.ORDER_PREFIX || "EE-"}${next}`;
  await stripeForm(env, "POST", `products/${COUNTER_PRODUCT_ID}`, {
    "metadata[next_order]": String(next + 1)
  });
  if (sessionId && !String(sessionId).startsWith("cs_test_fixture_")) {
    await stripeForm(env, "POST", `checkout/sessions/${encodeURIComponent(sessionId)}`, {
      "metadata[order_number]": orderNumber
    });
  }
  return { orderNumber, sessionId, createdAt: Date.now(), reused: false };
}

export async function assignOrderNumber(env, sessionId, preset) {
  if (preset) return { orderNumber: preset, sessionId, createdAt: Date.now(), reused: true };

  if (env.ORDERS) {
    const existing = await env.ORDERS.get(`session:${sessionId}`);
    if (existing) {
      try {
        return { ...JSON.parse(existing), reused: true };
      } catch {
        return { orderNumber: existing, sessionId, reused: true };
      }
    }
    const start = Number(env.ORDER_START || "1001");
    const raw = await env.ORDERS.get("next_order");
    let next = raw ? Number(raw) : start;
    if (!Number.isFinite(next) || next < start) next = start;
    const orderNumber = `${env.ORDER_PREFIX || "EE-"}${next}`;
    await env.ORDERS.put("next_order", String(next + 1));
    const record = { orderNumber, sessionId, createdAt: Date.now() };
    await env.ORDERS.put(`session:${sessionId}`, JSON.stringify(record));
    return { ...record, reused: false };
  }

  if (env.STRIPE_SECRET_KEY) {
    const fromStripe = await assignFromStripe(env, sessionId);
    if (fromStripe) return fromStripe;
  }

  // Last resort for fixtures / first deploy without storage.
  const suffix = String(sessionId || "order").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return { orderNumber: `${env.ORDER_PREFIX || "EE-"}T${suffix}`, sessionId, createdAt: Date.now(), reused: false, ephemeral: true };
}

export async function saveOrder(env, order) {
  if (env.ORDERS) {
    await env.ORDERS.put(`order:${order.orderNumber}`, JSON.stringify(order));
  }
}

export async function loadOrder(env, orderNumber) {
  if (!env.ORDERS) return null;
  const raw = await env.ORDERS.get(`order:${orderNumber}`);
  return raw ? JSON.parse(raw) : null;
}

export async function buildOrder(env, session, opts = {}) {
  const isTest =
    Boolean(opts.isTest) ||
    (session.metadata && session.metadata.source === "test") ||
    String(session.id || "").startsWith("cs_test_");
  const preset = (session.metadata && session.metadata.order_number) || opts.orderNumber;
  const assigned = await assignOrderNumber(env, session.id, preset);
  let full = session;
  if (env.STRIPE_SECRET_KEY && session.id && !String(session.id).startsWith("cs_test_fixture_")) {
    const retrieved = await retrieveSession(env, session.id);
    if (retrieved) full = retrieved;
  }

  const ship = shippingFromSession(full);
  const fields = full.custom_fields || session.custom_fields || [];
  const size = fieldValue(fields, "size");
  const design = fieldValue(fields, "design");
  const siteId = siteIdFromSession(full) || siteIdFromSession(session) || "";
  let items = lineItemsFromSession(full);
  if (!items.length && SHIRTS[siteId]) {
    items = [
      {
        name: SHIRTS[siteId].name,
        quantity: 1,
        amountCents: SHIRTS[siteId].priceCents,
        currency: full.currency || "usd"
      }
    ];
  }
  if (design && items[0]) items[0].design = design;

  const createdSec = full.created || Math.floor(Date.now() / 1000);
  return {
    orderNumber: assigned.orderNumber,
    reused: assigned.reused,
    isTest,
    sessionId: full.id || session.id,
    paymentIntentId: typeof full.payment_intent === "string" ? full.payment_intent : full.payment_intent?.id || "",
    createdAt: createdSec * 1000,
    timezone: env.TIMEZONE || "America/Los_Angeles",
    currency: (full.currency || "usd").toUpperCase(),
    amountCents: full.amount_total != null ? full.amount_total : items.reduce((n, it) => n + (it.amountCents || 0), 0),
    amountShipping: (full.total_details && full.total_details.amount_shipping) || 0,
    size,
    design,
    siteId,
    items,
    customer: ship,
    paymentStatus: full.payment_status || "paid",
    label: null
  };
}
