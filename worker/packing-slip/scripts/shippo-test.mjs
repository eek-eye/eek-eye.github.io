/**
 * Rate-quote check against the Shippo API. Never buys a label.
 *
 * Usage (key must already be in the environment — do not paste it here):
 *   node scripts/shippo-test.mjs
 *   INTL=1 node scripts/shippo-test.mjs
 *
 * Reads SHIPPO_API_KEY or SHIPPO_TEST_API_KEY from the process env only.
 * Never prints the key.
 */
import { quoteShipment, shippoKey } from "../src/labels.js";

function present(name) {
  return Boolean(String(process.env[name] || "").trim());
}

const env = {
  SHIPPO_API_KEY: process.env.SHIPPO_API_KEY || "",
  SHIPPO_TEST_API_KEY: process.env.SHIPPO_TEST_API_KEY || "",
  SHIPPO_TEST_MODE: process.env.SHIPPO_TEST_MODE || (present("SHIPPO_TEST_API_KEY") ? "1" : ""),
  SHIP_FROM_NAME: "eekseye",
  SHIP_FROM_LINE1: "2200 Sendero St",
  SHIP_FROM_CITY: "Calexico",
  SHIP_FROM_STATE: "CA",
  SHIP_FROM_POSTAL: "92231",
  SHIP_FROM_COUNTRY: "US",
  SHIP_FROM_PHONE: "+14424786003",
  OWNER_EMAIL: "fuchendeonze@gmail.com"
};

if (!present("SHIPPO_API_KEY") && !present("SHIPPO_TEST_API_KEY")) {
  console.log(JSON.stringify({ ok: false, error: "SHIPPO_API_KEY is not set yet" }));
  process.exit(2);
}

const auth = shippoKey(env, { isTest: env.SHIPPO_TEST_MODE === "1" });
if (!auth.key) {
  console.log(JSON.stringify({ ok: false, error: "no usable Shippo key for a quote (test orders will not use a live key)" }));
  process.exit(2);
}

const to = process.env.INTL
  ? { name: "Alex Rivera", phone: "+52 686 555 0199", line1: "Av. Reforma 100", city: "Mexicali", state: "BC", postalCode: "21100", country: "MX", email: "fuchendeonze@gmail.com" }
  : { name: "Alex Rivera", phone: "+1 555 010 0199", line1: "100 Market St", city: "San Diego", state: "CA", postalCode: "92101", country: "US", email: "fuchendeonze@gmail.com" };

const order = {
  orderNumber: "QUOTE-TEST",
  sessionId: "cs_test_fixture_shippo_quote",
  isTest: true,
  amountCents: 27500,
  currency: "USD",
  items: [{ name: "I Eeks Eye I 2026", quantity: 1, amountCents: 27500 }],
  customer: to
};

const quote = await quoteShipment(env, order);
const summary = {
  ok: quote.ok,
  sandbox: quote.sandbox,
  domestic: quote.domestic,
  rateCount: (quote.rates || []).length,
  carriers: [...new Set((quote.rates || []).map((r) => r.provider).filter(Boolean))],
  picked: quote.picked || null,
  pickReason: quote.pickReason || null,
  error: quote.error || undefined,
  messages: (quote.messages || []).map((m) => m.text || m.message || m).slice(0, 5)
};
console.log(JSON.stringify(summary, null, 2));
if (!quote.ok) process.exit(1);
