/**
 * Offline unit tests for rate picking and test/live key selection.
 * Never calls the network or prints secrets.
 */
import {
  pickRate,
  isTrackedFallback,
  preferredTokens,
  parcelFromEnv,
  shipFromAddress,
  shipToAddress,
  customsDeclaration,
  shippoKey,
  labelFromStripeMetadata,
  withLabel,
  withoutLabelImages
} from "../src/labels.js";

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error("FAIL", msg);
  } else {
    console.log("ok", msg);
  }
}

const fedexHome = {
  object_id: "rate_home",
  amount: "12.40",
  currency: "USD",
  provider: "FedEx",
  servicelevel: { token: "fedex_home_delivery", name: "Ground Home Delivery" }
};
const fedexGround = {
  object_id: "rate_ground",
  amount: "11.10",
  currency: "USD",
  provider: "FedEx",
  servicelevel: { token: "fedex_ground", name: "Ground" }
};
const uspsCheap = {
  object_id: "rate_usps",
  amount: "6.50",
  currency: "USD",
  provider: "USPS",
  servicelevel: { token: "usps_ground_advantage", name: "Ground Advantage" }
};
const ups = {
  object_id: "rate_ups",
  amount: "9.00",
  currency: "USD",
  provider: "UPS",
  servicelevel: { token: "ups_ground", name: "Ground" }
};
const dhl = {
  object_id: "rate_dhl",
  amount: "28.00",
  currency: "USD",
  provider: "DHL Express",
  servicelevel: { token: "dhl_express_worldwide", name: "Express Worldwide" }
};
const media = {
  object_id: "rate_media",
  amount: "4.00",
  currency: "USD",
  provider: "USPS",
  servicelevel: { token: "usps_media_mail", name: "Media Mail" }
};
const intlPri = {
  object_id: "rate_intl",
  amount: "42.00",
  currency: "USD",
  provider: "FedEx",
  servicelevel: { token: "fedex_international_priority", name: "International Priority" }
};

const usPick = pickRate([uspsCheap, ups, fedexGround, fedexHome, media], {}, true);
assert(usPick.reason === "preferred" && usPick.rate.object_id === "rate_home", "US prefers FedEx Home Delivery even if others are cheaper");

const usFallback = pickRate([uspsCheap, ups, fedexGround, media], {}, true);
assert(usFallback.reason === "cheapest_tracked" && usFallback.rate.object_id === "rate_usps", "US fallback is cheapest tracked (USPS), skipping media mail");

assert(!isTrackedFallback(media), "media mail is not a tracked fallback");
assert(isTrackedFallback(dhl), "DHL Express is a tracked fallback");

const intlPick = pickRate([dhl, intlPri, uspsCheap], {}, false);
assert(intlPick.reason === "preferred" && intlPick.rate.object_id === "rate_intl", "intl prefers FedEx International Priority");

const intlFallback = pickRate([dhl, ups], {}, false);
assert(intlFallback.reason === "cheapest_tracked" && intlFallback.rate.object_id === "rate_ups", "intl fallback is cheapest tracked");

const none = pickRate([media], {}, true);
assert(none.reason === "none" && !none.rate, "no usable rate returns none");

assert(preferredTokens({}, true).includes("fedex_home_delivery"), "default US token");
assert(preferredTokens({ FEDEX_US_SERVICE: "GROUND_HOME_DELIVERY" }, true).includes("fedex_home_delivery"), "maps old FedEx service name");
assert(preferredTokens({}, false)[0] === "fedex_international_priority", "default intl token");

const parcel = parcelFromEnv({});
assert(parcel.weight === "1" && parcel.length === "12" && parcel.width === "10" && parcel.height === "2", "default shirt box 1lb 12x10x2");
const custom = parcelFromEnv({ SHIP_PKG_WEIGHT_LB: "1.5", SHIP_PKG_DIMS_IN: "14x11x3" });
assert(custom.weight === "1.5" && custom.length === "14" && custom.height === "3", "parcel env overrides");

const from = shipFromAddress({
  SHIP_FROM_NAME: "eekseye",
  SHIP_FROM_LINE1: "2200 Sendero St",
  SHIP_FROM_CITY: "Calexico",
  SHIP_FROM_STATE: "CA",
  SHIP_FROM_POSTAL: "92231",
  SHIP_FROM_COUNTRY: "US",
  SHIP_FROM_PHONE: "+14424786003"
});
assert(from.street1 === "2200 Sendero St" && from.zip === "92231" && from.phone === "4424786003", "ship-from from existing scaffold");

const to = shipToAddress({
  customer: { name: "Ada", line1: "100 Market St", city: "San Diego", state: "CA", postalCode: "92101", country: "US", email: "ada@example.com" }
});
assert(to.street1 === "100 Market St" && to.email === "ada@example.com", "ship-to from order");

const customs = customsDeclaration({ SHIP_FROM_NAME: "eekseye" }, { amountCents: 27500, currency: "USD", items: [{ name: "I Eeks Eye I 2026", quantity: 1 }] }, parcel);
assert(customs.contents_type === "MERCHANDISE" && customs.items[0].tariff_number === "610910" && customs.items[0].value_amount === "275" && customs.eel_pfc === "NOEEI_30_37_a", "customs for a shirt");
const customsCA = customsDeclaration({ SHIP_FROM_NAME: "eekseye" }, { amountCents: 27500, currency: "USD", items: [{ name: "I Eeks Eye I 2026", quantity: 1 }], customer: { country: "CA" } }, parcel);
assert(customsCA.eel_pfc === "NOEEI_30_36", "Canada uses NOEEI_30_36");

assert(shippoKey({}, {}).skipped === "missing_key", "missing key is skipped");
assert(shippoKey({ SHIPPO_API_KEY: "shippo_live_dummy" }, { isTest: true }).skipped === "test_order_no_test_key", "live key is not used for Stripe test orders");
assert(shippoKey({ SHIPPO_API_KEY: "shippo_live_dummy", SHIPPO_TEST_API_KEY: "shippo_test_dummy" }, { isTest: true }).sandbox === true, "test orders use the test key when present");
assert(shippoKey({ SHIPPO_API_KEY: "shippo_test_dummy" }, { isTest: true }).sandbox === true, "a test main key is used in test mode");
assert(shippoKey({ SHIPPO_API_KEY: "shippo_live_dummy" }, { isTest: false }).sandbox === false, "live orders use the live key");

const reused = labelFromStripeMetadata({
  eekseye_tracking: "123456789012",
  eekseye_carrier: "FedEx",
  eekseye_shippo_tx: "tx_1",
  eekseye_label_url: "https://example.com/label.pdf"
});
assert(reused.ok && reused.reused && reused.trackingNumber === "123456789012", "idempotent read from Stripe metadata");
assert(labelFromStripeMetadata({}) === null, "empty metadata is not a label");

const stripped = withoutLabelImages(withLabel({ orderNumber: "X" }, { ok: true, pdfBase64: "AAAA", trackingNumber: "1" }));
assert(stripped.label.hasPdf === true && !stripped.label.pdfBase64, "base64 is stripped from link payloads");

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nall unit tests passed");
