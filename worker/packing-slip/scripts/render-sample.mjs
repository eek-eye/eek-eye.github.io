import { writeFileSync } from "node:fs";
import { packingSlipHtml } from "../src/packing-slip.js";

const sampleOrder = {
  orderNumber: "EE-261111-KMPL",
  isTest: true,
  sessionId: "cs_test_fixture_sample",
  paymentIntentId: "pi_test_fixture_sample",
  createdAt: Date.parse("2026-11-11T15:00:00-08:00"),
  timezone: "America/Los_Angeles",
  currency: "USD",
  amountCents: 27500,
  amountShipping: 0,
  size: "M",
  design: "",
  items: [{ name: "I Eeks Eye I 2026", quantity: 1, amountCents: 27500, currency: "usd" }],
  customer: {
    name: "Alex Rivera",
    phone: "+1 555 010 0199",
    email: "customer@example.com",
    line1: "100 Market Street",
    line2: "Apt 4",
    city: "San Diego",
    state: "CA",
    postalCode: "92101",
    country: "US"
  },
  label: null
};

const env = {
  BRAND_NAME: "EEKSEYE",
  SHIP_FROM_NAME: "EEKSEYE",
  SHIP_FROM_LINE1: "2200 Sendero St",
  SHIP_FROM_CITY: "Calexico",
  SHIP_FROM_STATE: "CA",
  SHIP_FROM_POSTAL: "92231",
  SHIP_FROM_COUNTRY: "US",
  SHIP_FROM_PHONE: "+14424786003",
  TIMEZONE: "America/Los_Angeles"
};

const out = process.argv[2] || "/tmp/packing-slip-sample.html";
writeFileSync(out, packingSlipHtml(sampleOrder, env, { printable: true }));
console.log("wrote", out);
