/**
 * Shippo shipping label step (replaces the paused FedEx Ship API scaffold).
 *
 * Vars / secrets (Cloudflare Pages env):
 *   SHIPPO_API_KEY            live or test token (never log this)
 *   SHIPPO_TEST_API_KEY       optional test token for Stripe test orders / dry-run
 *   SHIPPO_TEST_MODE=1        force the test key
 *   SHIPPO_DRY_RUN=1          quote rates only; never buy a label
 *   SHIP_FROM_*               shipper address (see wrangler.jsonc)
 * Optional: SHIP_PKG_WEIGHT_LB (1), SHIP_PKG_DIMS_IN ("12x10x2"),
 *   SHIPPO_US_SERVICE (fedex_home_delivery),
 *   SHIPPO_INTL_SERVICE (fedex_international_priority).
 *
 * Returns { ok:true, provider, carrier, service, trackingNumber, trackingUrl,
 *           labelUrl, pdfBase64, transactionId, sandbox, reused }
 * or { ok:false, error } — never throws, so the packing slip always goes out.
 */

import { updateShippingMetadata } from "./stripe.js";

const SHIPPO_API = "https://api.goshippo.com";
const API_VERSION = "2018-02-08";
const TRACKED_FALLBACK = /^(fedex|usps|ups|dhl express|dhlexpress|dhl_express)$/i;
const PREFERRED_ALIASES = {
  fedex_home_delivery: ["fedex_home_delivery", "fedex_ground_home_delivery", "ground_home_delivery"],
  fedex_international_priority: ["fedex_international_priority", "international_priority"]
};

function serviceToken(rate) {
  const raw =
    (rate && rate.servicelevel && (rate.servicelevel.token || rate.servicelevel_token)) ||
    rate.servicelevel_token ||
    "";
  return String(raw).toLowerCase();
}

function providerName(rate) {
  return String((rate && (rate.provider || rate.carrier)) || "").trim();
}

export function isTestKey(key) {
  return /^shippo_test_/i.test(String(key || ""));
}

export function isLiveKey(key) {
  return /^shippo_live_/i.test(String(key || ""));
}

/** Choose test vs live key. Never returns or logs the key to the console. */
export function shippoKey(env, order) {
  const main = String(env.SHIPPO_API_KEY || "").trim();
  const test = String(env.SHIPPO_TEST_API_KEY || "").trim();
  const forceTest = env.SHIPPO_TEST_MODE === "1" || env.SHIPPO_TEST_MODE === "true" || Boolean(order && order.isTest);
  if (forceTest) {
    if (test) return { key: test, sandbox: true };
    if (main && isTestKey(main)) return { key: main, sandbox: true };
    if (main && isLiveKey(main) && env.SHIPPO_LABEL_TEST_ORDERS !== "1") {
      return { key: "", sandbox: true, skipped: "test_order_no_test_key" };
    }
  }
  if (!main) return { key: "", sandbox: false, skipped: "missing_key" };
  return { key: main, sandbox: isTestKey(main) };
}

function shippoHeaders(key) {
  return {
    Authorization: `ShippoToken ${key}`,
    "Content-Type": "application/json",
    "Shippo-API-Version": API_VERSION
  };
}

export function shippoErrorText(data) {
  if (!data) return "unknown error";
  if (Array.isArray(data.messages) && data.messages.length) {
    return data.messages
      .map((m) => `${m.source || ""} ${m.code || ""} ${m.text || m.message || ""}`.trim())
      .join("; ")
      .slice(0, 300);
  }
  if (data.detail) return String(data.detail).slice(0, 300);
  if (typeof data === "string") return data.slice(0, 300);
  try {
    return JSON.stringify(data).slice(0, 300);
  } catch {
    return "unknown error";
  }
}

function digitsPhone(p, fallback) {
  const d = String(p || "").replace(/\D+/g, "");
  if (d.length >= 10) return d.length === 11 && d.startsWith("1") ? d.slice(1) : d.slice(-15);
  const fb = String(fallback || "").replace(/\D+/g, "").replace(/^1(\d{10})$/, "$1");
  return fb || "";
}

export function parcelFromEnv(env) {
  const weight = Number(env.SHIP_PKG_WEIGHT_LB || env.FEDEX_PKG_WEIGHT_LB || 1) || 1;
  const [l, w, h] = String(env.SHIP_PKG_DIMS_IN || env.FEDEX_PKG_DIMS_IN || "12x10x2")
    .split(/x/i)
    .map((n) => Math.max(1, Number(n) || 1));
  return {
    length: String(l || 12),
    width: String(w || 10),
    height: String(h || 2),
    distance_unit: "in",
    weight: String(weight),
    mass_unit: "lb"
  };
}

export function shipFromAddress(env) {
  return {
    name: env.SHIP_FROM_NAME || "eekseye",
    company: env.SHIP_FROM_COMPANY || env.SHIP_FROM_NAME || "eekseye",
    street1: env.SHIP_FROM_LINE1 || "",
    street2: env.SHIP_FROM_LINE2 || "",
    city: env.SHIP_FROM_CITY || "",
    state: env.SHIP_FROM_STATE || "",
    zip: env.SHIP_FROM_POSTAL || "",
    country: (env.SHIP_FROM_COUNTRY || "US").toUpperCase(),
    phone: digitsPhone(env.SHIP_FROM_PHONE, "4424786003"),
    email: env.SHIP_FROM_EMAIL || env.OWNER_EMAIL || "fuchendeonze@gmail.com"
  };
}

export function shipToAddress(order) {
  const c = order.customer || {};
  return {
    name: String(c.name || "Customer").slice(0, 70),
    street1: c.line1 || "",
    street2: c.line2 || "",
    city: c.city || "",
    state: c.state || "",
    zip: c.postalCode || "",
    country: String(c.country || "US").toUpperCase(),
    phone: digitsPhone(c.phone, ""),
    email: c.email || ""
  };
}

export function preferredTokens(env, domestic) {
  if (domestic) {
    const raw = String(env.SHIPPO_US_SERVICE || env.FEDEX_US_SERVICE || "fedex_home_delivery").toLowerCase();
    if (raw === "ground_home_delivery" || raw === "fedex_ground_home_delivery") return PREFERRED_ALIASES.fedex_home_delivery;
    return PREFERRED_ALIASES[raw] || [raw];
  }
  const raw = String(env.SHIPPO_INTL_SERVICE || env.FEDEX_INTL_SERVICE || "fedex_international_priority").toLowerCase();
  if (raw === "international_priority") return PREFERRED_ALIASES.fedex_international_priority;
  return PREFERRED_ALIASES[raw] || [raw];
}

export function isTrackedFallback(rate) {
  const provider = providerName(rate);
  if (!TRACKED_FALLBACK.test(provider)) return false;
  const token = serviceToken(rate);
  if (/media_mail|untracked|first_class_mail|letter/i.test(token)) return false;
  if (!rate.object_id) return false;
  const amount = Number(rate.amount);
  if (!Number.isFinite(amount) || amount < 0) return false;
  return true;
}

/**
 * Pick FedEx Ground Home Delivery (US) or International Priority (intl).
 * If those rates are missing, use the cheapest tracked USPS/UPS/DHL Express/FedEx rate.
 */
export function pickRate(rates, env, domestic) {
  const list = Array.isArray(rates) ? rates.filter((r) => r && r.object_id) : [];
  const preferred = preferredTokens(env || {}, domestic);
  const matchPref = list.find((r) => preferred.includes(serviceToken(r)));
  if (matchPref) {
    return { rate: matchPref, reason: "preferred", token: serviceToken(matchPref), provider: providerName(matchPref) };
  }
  const tracked = list.filter(isTrackedFallback).sort((a, b) => Number(a.amount) - Number(b.amount));
  if (tracked[0]) {
    return { rate: tracked[0], reason: "cheapest_tracked", token: serviceToken(tracked[0]), provider: providerName(tracked[0]) };
  }
  return { rate: null, reason: "none", token: "", provider: "" };
}

export function customsDeclaration(env, order, parcel) {
  const c = order.customer || {};
  const merchItems = (order.items || []).filter((it) => !it.isShipping);
  const qty = merchItems.reduce((n, it) => n + (Number(it.quantity) || 1), 0) || 1;
  const goodsCents = Math.max(0, (order.amountCents || 0) - (order.amountShipping || 0));
  const amount = Number((goodsCents / 100).toFixed(2)) || 0;
  const currency = (order.currency || "USD").toUpperCase();
  const unit = Number((amount / qty).toFixed(2)) || amount;
  const description = (merchItems[0] && merchItems[0].name) || (order.items && order.items[0] && order.items[0].name) || "Cotton t-shirt";
  const toCountry = String((order.customer && order.customer.country) || "").toUpperCase();
  // Shippo enum is case-sensitive: CA uses NOEEI_30_36; most other US exports use NOEEI_30_37_a.
  const eelPfc = toCountry === "CA" ? "NOEEI_30_36" : "NOEEI_30_37_a";
  return {
    contents_type: "MERCHANDISE",
    contents_explanation: "Cotton t-shirt",
    non_delivery_option: "RETURN",
    certify: true,
    certify_signer: String(env.SHIP_FROM_NAME || "eekseye").slice(0, 30),
    incoterm: "DDU",
    eel_pfc: eelPfc,
    items: [
      {
        description: String(description).slice(0, 50),
        quantity: qty,
        net_weight: String(parcel.weight),
        mass_unit: parcel.mass_unit,
        value_amount: String(unit),
        value_currency: currency,
        origin_country: (env.SHIP_FROM_COUNTRY || "US").toUpperCase(),
        tariff_number: env.SHIP_HS_CODE || "610910"
      }
    ]
  };
}

async function shippoFetch(key, path, { method = "GET", body, idempotencyKey } = {}) {
  const headers = shippoHeaders(key);
  if (idempotencyKey) headers["Idempotency-Key"] = String(idempotencyKey).slice(0, 100);
  const res = await fetch(`${SHIPPO_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function pdfBase64FromUrl(url) {
  if (!url) return "";
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    const slice = 0x8000;
    for (let i = 0; i < buf.length; i += slice) {
      bin += String.fromCharCode(...buf.subarray(i, i + slice));
    }
    return btoa(bin);
  } catch {
    return "";
  }
}

export function labelFromStripeMetadata(meta) {
  if (!meta || typeof meta !== "object") return null;
  const trackingNumber = meta.eekseye_tracking || "";
  const transactionId = meta.eekseye_shippo_tx || "";
  if (!trackingNumber && !transactionId) return null;
  return {
    ok: true,
    reused: true,
    provider: meta.eekseye_carrier || "Shippo",
    carrier: meta.eekseye_carrier || "",
    service: meta.eekseye_service || "",
    trackingNumber,
    trackingUrl: meta.eekseye_tracking_url || "",
    labelUrl: meta.eekseye_label_url || "",
    transactionId,
    buyerEmailed: meta.eekseye_buyer_tracking_sent === "1"
  };
}

function publicLabelFields(tx, picked, sandbox) {
  const rate = tx.rate && typeof tx.rate === "object" ? tx.rate : (picked && picked.rate) || {};
  const carrier = providerName(rate) || (picked && picked.provider) || "Shippo";
  const service = (rate.servicelevel && rate.servicelevel.name) || (picked && picked.token) || "";
  return {
    ok: true,
    provider: carrier,
    carrier,
    service,
    serviceToken: (picked && picked.token) || serviceToken(rate),
    trackingNumber: tx.tracking_number || "",
    trackingUrl: tx.tracking_url_provider || "",
    labelUrl: tx.label_url || "",
    commercialInvoiceUrl: tx.commercial_invoice_url || "",
    transactionId: tx.object_id || "",
    sandbox: Boolean(sandbox || tx.test),
    reused: false
  };
}

async function persistLabel(env, order, label) {
  try {
    await updateShippingMetadata(env, order, {
      eekseye_tracking: label.trackingNumber || "",
      eekseye_tracking_url: label.trackingUrl || "",
      eekseye_label_url: label.labelUrl || "",
      eekseye_carrier: label.carrier || label.provider || "",
      eekseye_service: label.service || "",
      eekseye_shippo_tx: label.transactionId || ""
    });
  } catch (err) {
    console.log(JSON.stringify({ msg: "stripe_label_metadata_failed", orderNumber: order.orderNumber, error: String(err && err.message ? err.message : err).slice(0, 200) }));
  }
}

export async function quoteShipment(env, order) {
  const auth = shippoKey(env, order);
  if (!auth.key) {
    return { ok: false, error: auth.skipped === "test_order_no_test_key" ? "skipped for Stripe test order (no Shippo test key)" : "SHIPPO_API_KEY is not configured", sandbox: auth.sandbox };
  }
  const from = shipFromAddress(env);
  const to = shipToAddress(order);
  const parcel = parcelFromEnv(env);
  const fromCountry = (from.country || "US").toUpperCase();
  const toCountry = (to.country || "US").toUpperCase();
  const domestic = toCountry === fromCountry;
  if (!from.street1 || !from.city || !from.zip || !from.country) {
    return { ok: false, error: "missing ship-from address" };
  }
  if (!to.street1 || !to.city || !to.country) {
    return { ok: false, error: "missing ship-to address" };
  }

  const shipmentBody = {
    address_from: from,
    address_to: to,
    parcels: [parcel],
    async: false,
    metadata: `eekseye:${order.orderNumber || ""}:${order.sessionId || ""}`.slice(0, 100)
  };
  if (!domestic) {
    const dec = await shippoFetch(auth.key, "/customs/declarations/", { method: "POST", body: customsDeclaration(env, order, parcel) });
    if (!dec.res.ok || !dec.data.object_id) {
      return { ok: false, error: `Shippo customs ${dec.res.status}: ${shippoErrorText(dec.data)}`, sandbox: auth.sandbox };
    }
    shipmentBody.customs_declaration = dec.data.object_id;
  }

  const { res, data } = await shippoFetch(auth.key, "/shipments/", { method: "POST", body: shipmentBody });
  if (!res.ok) {
    return { ok: false, error: `Shippo shipment ${res.status}: ${shippoErrorText(data)}`, sandbox: auth.sandbox };
  }
  const picked = pickRate(data.rates || [], env, domestic);
  return {
    ok: true,
    sandbox: auth.sandbox || Boolean(data.test),
    domestic,
    shipmentId: data.object_id || "",
    messages: data.messages || [],
    rates: (data.rates || []).map((r) => ({
      id: r.object_id,
      amount: r.amount,
      currency: r.currency,
      provider: providerName(r),
      token: serviceToken(r),
      name: (r.servicelevel && r.servicelevel.name) || "",
      days: r.estimated_days || null
    })),
    picked: picked.rate
      ? { id: picked.rate.object_id, amount: picked.rate.amount, currency: picked.rate.currency, provider: picked.provider, token: picked.token, reason: picked.reason, name: (picked.rate.servicelevel && picked.rate.servicelevel.name) || "" }
      : null,
    pickReason: picked.reason
  };
}

export async function createShippingLabel(env, order) {
  if (order && order.label && order.label.ok && (order.label.trackingNumber || order.label.transactionId)) {
    return { ...order.label, reused: true };
  }
  const existing = labelFromStripeMetadata((order && order.stripeMetadata) || {});
  if (existing) return existing;

  const auth = shippoKey(env, order);
  if (!auth.key) {
    if (auth.skipped === "missing_key") return null;
    return { ok: false, provider: "Shippo", error: "skipped for Stripe test order (no Shippo test key; no live label bought)" };
  }
  if (env.SHIPPO_DRY_RUN === "1" || env.SHIPPO_DRY_RUN === "true") {
    const quote = await quoteShipment(env, order);
    return {
      ok: false,
      provider: "Shippo",
      dryRun: true,
      sandbox: quote.sandbox,
      error: quote.ok ? `dry-run: would buy ${quote.picked ? `${quote.picked.provider} ${quote.picked.token} @ ${quote.picked.amount}` : "no rate"}` : quote.error,
      quote
    };
  }

  const c = order.customer || {};
  if (!c.line1 || !c.city || !c.country) {
    return { ok: false, provider: "Shippo", error: "missing ship-to address" };
  }

  try {
    const quote = await quoteShipment(env, order);
    if (!quote.ok) {
      console.log(JSON.stringify({ msg: "shippo_quote_failed", orderNumber: order.orderNumber, error: quote.error }));
      return { ok: false, provider: "Shippo", error: quote.error, sandbox: quote.sandbox };
    }
    if (!quote.picked) {
      const error = "no FedEx or tracked USPS/UPS/DHL Express rate available";
      console.log(JSON.stringify({ msg: "shippo_no_rate", orderNumber: order.orderNumber, rateCount: (quote.rates || []).length, error }));
      return { ok: false, provider: "Shippo", error, rates: quote.rates, sandbox: quote.sandbox };
    }

    const idem = `eekseye-label:${order.sessionId || order.orderNumber}`.slice(0, 100);
    const bought = await shippoFetch(auth.key, "/transactions/", {
      method: "POST",
      idempotencyKey: idem,
      body: {
        rate: quote.picked.id,
        label_file_type: "PDF_4x6",
        async: false,
        metadata: `eekseye:${order.orderNumber || ""}`.slice(0, 100)
      }
    });
    if (!bought.res.ok || (bought.data.status && bought.data.status !== "SUCCESS" && bought.data.status !== "QUEUED")) {
      const error = `Shippo buy ${bought.res.status}: ${shippoErrorText(bought.data)}`;
      console.log(JSON.stringify({ msg: "shippo_buy_failed", orderNumber: order.orderNumber, error, status: bought.data.status || bought.res.status }));
      return { ok: false, provider: "Shippo", error, sandbox: quote.sandbox };
    }
    if (bought.data.status === "QUEUED" && bought.data.object_id) {
      const polled = await shippoFetch(auth.key, `/transactions/${bought.data.object_id}`);
      if (polled.data && polled.data.status === "SUCCESS") {
        bought.data = polled.data;
      }
    }
    if (bought.data.status && bought.data.status !== "SUCCESS") {
      const error = `Shippo buy status ${bought.data.status}: ${shippoErrorText(bought.data)}`;
      return { ok: false, provider: "Shippo", error, transactionId: bought.data.object_id || "", sandbox: quote.sandbox };
    }
    if (!bought.data.tracking_number && !bought.data.label_url) {
      return { ok: false, provider: "Shippo", error: "Shippo returned no label or tracking number", sandbox: quote.sandbox };
    }

    const label = publicLabelFields(bought.data, { rate: null, provider: quote.picked.provider, token: quote.picked.token }, quote.sandbox);
    if (label.labelUrl) label.pdfBase64 = await pdfBase64FromUrl(label.labelUrl);
    if (label.commercialInvoiceUrl) label.invoicePdfBase64 = await pdfBase64FromUrl(label.commercialInvoiceUrl);
    await persistLabel(env, order, label);
    return label;
  } catch (err) {
    const error = String(err && err.message ? err.message : err).slice(0, 300);
    console.log(JSON.stringify({ msg: "shippo_label_failed", orderNumber: order.orderNumber, error }));
    return { ok: false, provider: "Shippo", error };
  }
}

export function withLabel(order, label) {
  if (!label) return order;
  return { ...order, label };
}

/** Copy of the order without large base64 blobs (for links / KV previews). */
export function withoutLabelImages(order) {
  if (!order || !order.label) return order;
  const { pdfBase64, invoicePdfBase64, pngBase64, imagePngBase64, ...rest } = order.label;
  return { ...order, label: { ...rest, hasPdf: Boolean(pdfBase64) } };
}
