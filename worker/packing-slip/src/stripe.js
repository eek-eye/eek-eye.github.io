const enc = new TextEncoder();

function parseSignatureHeader(header) {
  const out = { t: null, v1: [] };
  if (!header) return out;
  for (const part of String(header).split(",")) {
    const [k, v] = part.split("=", 2);
    if (k === "t") out.t = v;
    if (k === "v1" && v) out.v1.push(v);
  }
  return out;
}

async function hmacSha256Hex(secret, message) {
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

function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300) {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  const { t, v1 } = parseSignatureHeader(header);
  if (!t || !v1.length) throw new Error("Missing Stripe-Signature header");
  const ts = Number(t);
  if (!Number.isFinite(ts)) throw new Error("Invalid Stripe signature timestamp");
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSec) throw new Error("Stripe signature timestamp is too old");
  const expected = await hmacSha256Hex(secret, `${t}.${rawBody}`);
  if (!v1.some((sig) => timingSafeEqualHex(sig, expected))) {
    throw new Error("Stripe signature mismatch");
  }
}

export function fieldValue(fields, key) {
  if (!Array.isArray(fields)) return "";
  const hit = fields.find((f) => f && String(f.key).toLowerCase() === String(key).toLowerCase());
  if (!hit) return "";
  if (hit.dropdown && hit.dropdown.value) return String(hit.dropdown.value);
  if (hit.text && hit.text.value) return String(hit.text.value);
  if (hit.numeric && hit.numeric.value) return String(hit.numeric.value);
  if (hit.value) return String(hit.value);
  return "";
}

export function shippingFromSession(session) {
  const collected = (session.collected_information && session.collected_information.shipping_details) || null;
  const ship = session.shipping_details || collected || {};
  const addr = ship.address || (session.customer_details && session.customer_details.address) || {};
  const details = session.customer_details || {};
  return {
    name: ship.name || details.name || "",
    phone: details.phone || ship.phone || "",
    email: details.email || session.customer_email || "",
    line1: addr.line1 || "",
    line2: addr.line2 || "",
    city: addr.city || "",
    state: addr.state || "",
    postalCode: addr.postal_code || "",
    country: addr.country || ""
  };
}

export async function retrieveSession(env, sessionId) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key || !sessionId) return null;
  const url = new URL(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  url.searchParams.append("expand[]", "line_items");
  url.searchParams.append("expand[]", "line_items.data.price.product");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${key}` }
  });
  if (!res.ok) {
    console.log(JSON.stringify({ msg: "stripe_retrieve_failed", status: res.status, sessionId }));
    return null;
  }
  return res.json();
}

export function lineItemsFromSession(session) {
  const list = (session.line_items && session.line_items.data) || session.display_items || [];
  return list.map((item) => {
    const price = item.price || item;
    const product = (price && price.product) || {};
    const name =
      item.description ||
      (typeof product === "object" && product.name) ||
      (price && price.nickname) ||
      "Shirt";
    return {
      name,
      quantity: item.quantity || 1,
      amountCents: item.amount_total != null ? item.amount_total : (price && price.unit_amount) || 0,
      currency: item.currency || (price && price.currency) || session.currency || "usd"
    };
  });
}
