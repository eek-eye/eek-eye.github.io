import { SHIRTS, siteIdFromSession } from "./catalog.js";
import { fieldValue, lineItemsFromSession, retrieveSession, shippingFromSession } from "./stripe.js";

const enc = new TextEncoder();
const SUFFIX_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function dateStampInZone(ms, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "America/Los_Angeles",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(ms));
  const get = (type) => (parts.find((p) => p.type === type) || {}).value || "00";
  return `${get("year")}${get("month")}${get("day")}`;
}

export async function suffixFromSessionId(sessionId) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(String(sessionId || "")));
  const bytes = new Uint8Array(digest);
  let out = "";
  for (let i = 0; i < 4; i++) out += SUFFIX_ALPHABET[bytes[i] % 26];
  return out;
}

/**
 * Unique, storage-free order number: YYMMDD-XXXX
 * YYMMDD is the session created date in America/Los_Angeles.
 * XXXX is 4 uppercase letters derived from the Stripe Checkout Session id,
 * so webhook retries for the same session always get the same number.
 */
export async function assignOrderNumber(env, sessionId, createdAtMs) {
  const tz = env.TIMEZONE || "America/Los_Angeles";
  const ms = Number(createdAtMs) || Date.now();
  const prefix = env.ORDER_PREFIX ?? "";
  const orderNumber = `${prefix}${dateStampInZone(ms, tz)}-${await suffixFromSessionId(sessionId)}`;
  return { orderNumber, sessionId, createdAt: ms, reused: false };
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
  let full = session;
  if (env.STRIPE_SECRET_KEY && session.id && !String(session.id).startsWith("cs_test_fixture_")) {
    const retrieved = await retrieveSession(env, session.id);
    if (retrieved) full = retrieved;
  }

  const createdSec = full.created || session.created || Math.floor(Date.now() / 1000);
  const assigned = await assignOrderNumber(env, full.id || session.id, createdSec * 1000);

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
