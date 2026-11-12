/**
 * FedEx shipping label step (FedEx REST Ship API).
 *
 * Vars / secrets (Cloudflare Pages env):
 *   FEDEX_CLIENT_ID, FEDEX_CLIENT_SECRET (secret), FEDEX_ACCOUNT_NUMBER,
 *   FEDEX_BASE_URL  (https://apis-sandbox.fedex.com, later https://apis.fedex.com)
 *   SHIP_FROM_* vars for the shipper address.
 * Optional: FEDEX_PKG_WEIGHT_LB (1), FEDEX_PKG_DIMS_IN ("12x10x2"),
 *   FEDEX_US_SERVICE, FEDEX_INTL_SERVICE.
 *
 * Returns { ok:true, provider, trackingNumber, serviceType, pdfBase64, sandbox }
 * or { ok:false, error } — never throws, so the packing slip always goes out.
 */

const DEFAULT_BASE = "https://apis-sandbox.fedex.com";

function baseUrl(env) {
  return String(env.FEDEX_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
}

export async function fedexToken(env) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.FEDEX_CLIENT_ID,
    client_secret: env.FEDEX_CLIENT_SECRET
  });
  const res = await fetch(`${baseUrl(env)}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`FedEx auth ${res.status}: ${fedexErrorText(data)}`);
  }
  return data.access_token;
}

export function fedexErrorText(data) {
  if (data && Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => `${e.code || ""} ${e.message || ""}`.trim()).join("; ");
  }
  return JSON.stringify(data || {}).slice(0, 300);
}

function digitsPhone(p, fallback) {
  const d = String(p || "").replace(/\D+/g, "");
  if (d.length >= 10) return d.length === 11 && d.startsWith("1") ? d.slice(1) : d.slice(-15);
  return String(fallback || "").replace(/\D+/g, "").replace(/^1(\d{10})$/, "$1");
}

function streetLines(...lines) {
  return lines.map((l) => String(l || "").trim().slice(0, 35)).filter(Boolean);
}

function pkgDims(env) {
  const [l, w, h] = String(env.FEDEX_PKG_DIMS_IN || "12x10x2").split(/x/i).map((n) => Math.max(1, Math.round(Number(n) || 1)));
  return { length: l || 12, width: w || 10, height: h || 2, units: "IN" };
}

export function shipmentRequest(env, order) {
  const c = order.customer || {};
  const fromCountry = (env.SHIP_FROM_COUNTRY || "US").toUpperCase();
  const toCountry = String(c.country || "US").toUpperCase();
  const domestic = toCountry === fromCountry;
  const weight = { units: "LB", value: Number(env.FEDEX_PKG_WEIGHT_LB || 1) };
  const qty = (order.items || []).reduce((n, it) => n + (Number(it.quantity) || 1), 0) || 1;
  const amount = Number(((order.amountCents || 0) / 100).toFixed(2));
  const currency = (order.currency || "USD").toUpperCase();

  const shipper = {
    contact: {
      personName: env.SHIP_FROM_NAME || "eekseye",
      companyName: env.SHIP_FROM_NAME || "eekseye",
      phoneNumber: digitsPhone(env.SHIP_FROM_PHONE, "4424786003")
    },
    address: {
      streetLines: streetLines(env.SHIP_FROM_LINE1, env.SHIP_FROM_LINE2),
      city: env.SHIP_FROM_CITY,
      stateOrProvinceCode: env.SHIP_FROM_STATE,
      postalCode: env.SHIP_FROM_POSTAL,
      countryCode: fromCountry
    }
  };
  const recipientAddress = {
    streetLines: streetLines(c.line1, c.line2),
    city: c.city,
    postalCode: c.postalCode,
    countryCode: toCountry,
    residential: true
  };
  if (c.state) recipientAddress.stateOrProvinceCode = String(c.state).trim();
  const recipient = {
    contact: {
      personName: String(c.name || "Customer").slice(0, 70),
      phoneNumber: digitsPhone(c.phone, env.SHIP_FROM_PHONE || "4424786003")
    },
    address: recipientAddress
  };
  if (c.email) recipient.contact.emailAddress = c.email;

  const serviceType = domestic
    ? env.FEDEX_US_SERVICE || "GROUND_HOME_DELIVERY"
    : env.FEDEX_INTL_SERVICE || "FEDEX_INTERNATIONAL_PRIORITY";

  const requestedShipment = {
    shipper,
    recipients: [recipient],
    shipDatestamp: new Date().toISOString().slice(0, 10),
    serviceType,
    packagingType: "YOUR_PACKAGING",
    pickupType: "DROPOFF_AT_FEDEX_LOCATION",
    blockInsightVisibility: false,
    shippingChargesPayment: {
      paymentType: "SENDER",
      payor: { responsibleParty: { accountNumber: { value: env.FEDEX_ACCOUNT_NUMBER } } }
    },
    labelSpecification: {
      imageType: "PDF",
      labelStockType: "STOCK_4X6",
      labelFormatType: "COMMON2D",
      labelPrintingOrientation: "TOP_EDGE_OF_TEXT_FIRST"
    },
    requestedPackageLineItems: [
      {
        sequenceNumber: 1,
        weight,
        dimensions: pkgDims(env),
        customerReferences: [{ customerReferenceType: "CUSTOMER_REFERENCE", value: String(order.orderNumber).slice(0, 30) }]
      }
    ]
  };

  if (!domestic) {
    requestedShipment.customsClearanceDetail = {
      dutiesPayment: { paymentType: "RECIPIENT" },
      isDocumentOnly: false,
      totalCustomsValue: { amount, currency },
      commodities: [
        {
          description: "Cotton t-shirt",
          harmonizedCode: "610910",
          countryOfManufacture: "US",
          quantity: qty,
          quantityUnits: "PCS",
          numberOfPieces: qty,
          weight,
          unitPrice: { amount: Number((amount / qty).toFixed(2)), currency },
          customsValue: { amount, currency }
        }
      ]
    };
    requestedShipment.shippingDocumentSpecification = {
      shippingDocumentTypes: ["COMMERCIAL_INVOICE"],
      commercialInvoiceDetail: {
        documentFormat: { stockType: "PAPER_LETTER", docType: "PDF" }
      }
    };
  }

  return {
    labelResponseOptions: "LABEL",
    accountNumber: { value: env.FEDEX_ACCOUNT_NUMBER },
    requestedShipment
  };
}

function firstPdf(data) {
  const shipments = (data.output && data.output.transactionShipments) || [];
  const s = shipments[0] || {};
  const piece = (s.pieceResponses || [])[0] || {};
  const docs = piece.packageDocuments || [];
  const label = docs.find((d) => d.encodedLabel) || {};
  const invoice = (s.shipmentDocuments || []).find((d) => d.encodedLabel && /INVOICE/i.test(d.contentType || d.type || "")) || null;
  return {
    trackingNumber: piece.trackingNumber || s.masterTrackingNumber || "",
    serviceType: s.serviceType || "",
    pdfBase64: label.encodedLabel || "",
    invoicePdfBase64: invoice ? invoice.encodedLabel : ""
  };
}

export async function createShippingLabel(env, order) {
  if (!env.FEDEX_CLIENT_ID || !env.FEDEX_CLIENT_SECRET || !env.FEDEX_ACCOUNT_NUMBER) return null;
  if (order.isTest && !/sandbox/.test(baseUrl(env)) && env.FEDEX_LABEL_TEST_ORDERS !== "1") {
    return { ok: false, provider: "FedEx", error: "skipped for Stripe test order (no real label bought)" };
  }
  const c = order.customer || {};
  if (!c.line1 || !c.city || !c.country) {
    return { ok: false, provider: "FedEx", error: "missing ship-to address" };
  }
  try {
    const token = await fedexToken(env);
    const res = await fetch(`${baseUrl(env)}/ship/v1/shipments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-locale": "en_US"
      },
      body: JSON.stringify(shipmentRequest(env, order))
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = `FedEx ship ${res.status}: ${fedexErrorText(data)}`;
      console.log(JSON.stringify({ msg: "fedex_label_failed", orderNumber: order.orderNumber, error }));
      return { ok: false, provider: "FedEx", error };
    }
    const out = firstPdf(data);
    if (!out.pdfBase64) {
      return { ok: false, provider: "FedEx", error: "FedEx returned no label image", trackingNumber: out.trackingNumber };
    }
    return {
      ok: true,
      provider: "FedEx",
      sandbox: /sandbox/.test(baseUrl(env)),
      ...out
    };
  } catch (err) {
    const error = String(err && err.message ? err.message : err).slice(0, 300);
    console.log(JSON.stringify({ msg: "fedex_label_failed", orderNumber: order.orderNumber, error }));
    return { ok: false, provider: "FedEx", error };
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
