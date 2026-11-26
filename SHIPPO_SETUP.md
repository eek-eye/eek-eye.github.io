# Shippo labels after a Stripe order

When a paid Stripe Checkout payment succeeds, the `eekseye-orders` worker creates a Shippo shipment, buys a **4x6 PDF label**, emails you the label link plus a packing summary, and emails the buyer their tracking number.

This replaces the paused FedEx Developer API scaffold. You no longer need FedEx label certification.

## What happens on each paid order

1. The existing packing-slip webhook at `https://eekseye-orders.pages.dev/stripe/webhook` runs (same as today).
2. If the order does not already have a label, Shippo is asked for rates from your ship-from address to the buyer’s shipping address.
3. The worker picks **FedEx Ground Home Delivery** for US orders, or **FedEx International Priority** for international orders.
4. If FedEx is not available on the Shippo account, it falls back to the cheapest tracked **USPS / UPS / DHL Express** (or other FedEx) rate.
5. It buys a `PDF_4x6` label once. The same Stripe order is never labeled twice (Shippo idempotency key + Stripe metadata).
6. You (`fuchendeonze@gmail.com`) get the packing slip email with the label PDF link (and the PDF attached when the mail provider allows attachments).
7. The buyer gets a short email with their tracking number and tracking link.

Stripe test-mode orders never buy a live label. They only buy a label if a Shippo **test** key is set.

## Ship-from address

Currently used (from the existing packing-slip config — please confirm this is still right):

- Name: eekseye
- Street: 2200 Sendero St
- City: Calexico, CA 92231
- Country: US
- Phone: +1 442 478 6003

## What you need to do in the Shippo dashboard

1. Sign up or log in at [goshippo.com](https://apps.goshippo.com/) (the free plan is fine; you pay per label).
2. Add a payment method so paid labels can be purchased.
3. Under **Settings → Carriers**, connect the carriers you want:
   - **FedEx** — connect your own FedEx account if you want Ground Home Delivery and International Priority at your account rates. Until that is connected, the worker falls back to the cheapest tracked USPS/UPS/DHL Express rate Shippo can quote.
   - USPS is usually available on a new Shippo account.
   - UPS and DHL Express are optional.
4. Copy a **test** API token and a **live** API token from Settings → API. These are sent through a secure prompt, never in chat.

Default shirt box (overridable later): **1 lb, 12 × 10 × 2 in**.

## Buyer tracking emails

Owner packing-slip and buyer tracking emails are sent through Resend from `eekseye <orders@eekseye.com>` (the eekseye.com sending domain is verified).

## Secrets (never commit these, never paste them in chat)

| Secret | Purpose |
|--------|---------|
| `SHIPPO_API_KEY` | Live (or test) Shippo token, set as a Cloudflare Pages secret on `eekseye-orders` |
| `SHIPPO_TEST_API_KEY` | Optional test token for Stripe test orders and dry-run quotes |

Optional vars: `SHIP_PKG_WEIGHT_LB`, `SHIP_PKG_DIMS_IN`, `SHIPPO_US_SERVICE`, `SHIPPO_INTL_SERVICE`, `SHIPPO_TEST_MODE`, `SHIPPO_DRY_RUN`.
