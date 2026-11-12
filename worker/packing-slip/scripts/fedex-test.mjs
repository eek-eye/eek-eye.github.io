import { readFileSync, writeFileSync } from "node:fs";
import { createShippingLabel } from "../src/labels.js";
const s = (f) => readFileSync(`/home/box/.secrets/${f}`, "utf8").trim();
const env = {
  FEDEX_CLIENT_ID: s("fedex_client_id"), FEDEX_CLIENT_SECRET: s("fedex_client_secret"),
  FEDEX_ACCOUNT_NUMBER: process.env.ACCT || s("fedex_account_number"),
  FEDEX_US_SERVICE: process.env.SVC || undefined,
  FEDEX_BASE_URL: "https://apis-sandbox.fedex.com",
  SHIP_FROM_NAME: "eekseye", SHIP_FROM_LINE1: "2200 Sendero St", SHIP_FROM_CITY: "Calexico",
  SHIP_FROM_STATE: "CA", SHIP_FROM_POSTAL: "92231", SHIP_FROM_COUNTRY: "US", SHIP_FROM_PHONE: "+14424786003"
};
const to = process.env.INTL ? { name: "Alex Rivera", phone: "+52 686 555 0199", line1: "Av. Reforma 100", city: "Mexicali", state: "BC", postalCode: "21100", country: "MX" }
  : { name: "Alex Rivera", phone: "+1 555 010 0199", line1: "100 Market St", line2: "", city: "San Diego", state: "CA", postalCode: "92101", country: "US" };
const order = { orderNumber: "261111-TEST", amountCents: 27500, currency: "USD", items: [{ name: "I Eeks Eye I 2026", quantity: 1, amountCents: 27500 }], customer: to };
const r = await createShippingLabel(env, order);
const { pdfBase64, invoicePdfBase64, ...meta } = r || {};
console.log(JSON.stringify(meta));
if (pdfBase64) { writeFileSync(process.env.OUT || "/workspace/eekseye-shop/fedex-label-sandbox.pdf", Buffer.from(pdfBase64, "base64")); console.log("pdf bytes", Buffer.from(pdfBase64, "base64").length); }
