# EEKSEYE order packing slips

Cloudflare Pages Worker that receives Stripe `checkout.session.completed` events from the six live Payment Links, assigns a unique order number (`EE-YYMMDD-XXXX`), and emails a printable packing slip to `fuchendeonze@gmail.com`. Customers only get Stripe’s own receipt — this Worker does not email buyers.

Live webhook:

`https://eekseye-orders.pages.dev/stripe/webhook`

Stripe webhook id: `we_1UalNy2X7APw4VwXr4LObWzz` (event: `checkout.session.completed` only).

## What is on the packing slip

- Order number and Stripe session id
- Shirt name, size, and design (x/y when that shirt has it)
- Customer name, shipping address, phone, email
- Amount and the date/time in America/Los_Angeles
- A print-ready 4x6 packing slip for a thermal label printer (print the email, or open the signed link). A shipping label, when present as an image, prints on the next page.
- A 4x6 shipping-label PDF (or link) on the owner email (see "Shippo labels")

## Email path

The Worker tries, in order:

1. Cloudflare `send_email` binding (`PACKING_SLIP_EMAIL`) if Email Routing / Email Sending is configured
2. Resend, if `RESEND_API_KEY` is set
3. EmailJS, if `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` (and preferably `EMAILJS_PRIVATE_KEY`) are set

Nothing is sent to the customer from this Worker.

**One-time step to turn on owner email (pick one):**

- **Recommended / free:** Create a free [Resend](https://resend.com) account with `fuchendeonze@gmail.com`, click the verification email, create an API key, and add it as the Pages secret `RESEND_API_KEY` on project `eekseye-orders` (Cloudflare Dashboard → Workers & Pages → eekseye-orders → Settings → Variables and Secrets, or `npx wrangler pages secret put RESEND_API_KEY --project-name eekseye-orders`). The `eekseye.com` sending domain is verified in Resend. `EMAIL_FROM` is `eekseye <orders@eekseye.com>`.
- **Already on the site:** Create an EmailJS template that sends HTML `html_message` to `to_email`, then add `EMAILJS_TEMPLATE_ID` and `EMAILJS_PRIVATE_KEY` (plus the existing public key `4NNKONRfDtWHf7PIK` and service `service_ty390sa`) as Pages secrets/vars.
- **Cloudflare Email:** The current Cloudflare token can deploy this Pages project but cannot enable Email Routing or Sending, and `eekseye.com` is not on this Cloudflare account. If you later add the domain or broaden the token, a `send_email` binding can be added.

## Order numbers

Format: `EE-YYMMDD-XXXX`

- `YYMMDD` is the Checkout Session date in America/Los_Angeles
- `XXXX` is four uppercase letters derived from a SHA-256 of the Stripe Checkout Session id

The same session always gets the same number, including Stripe webhook retries. No KV, Durable Object, or Stripe secret key is required to assign numbers.

A restricted Stripe secret key (`STRIPE_SECRET_KEY`) is still optional if you want the Worker to retrieve and expand line items when the webhook payload is thin. The Payment Link catalog is the fallback without that key. Do not paste keys into chat.

## Secrets (never commit these)

Already set as Pages `secret_text` on `eekseye-orders`: `STRIPE_WEBHOOK_SECRET`, `SLIP_VIEW_SECRET`.

| Secret | Purpose |
|--------|---------|
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe webhook endpoint (already set) |
| `STRIPE_SECRET_KEY` | Restricted Stripe secret key (recommended; see above) |
| `SLIP_VIEW_SECRET` | HMAC key that protects printable `/slip/EE-…` links (already set) |
| `RESEND_API_KEY` | Recommended email path |
| `EMAILJS_PUBLIC_KEY` / `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID` / `EMAILJS_PRIVATE_KEY` | Optional EmailJS path |
| `EMAIL_FROM` | Sender address (`eekseye <orders@eekseye.com>`) |
| `SHIPPO_API_KEY` | Shippo API token for buying 4x6 labels (Pages secret) |
| `SHIPPO_TEST_API_KEY` | Optional Shippo test token for Stripe test orders |

## Deploy

This project is deployed as a Cloudflare Pages Worker (`_worker.js`) because the available API token can create Pages projects but cannot upload `workers.dev` scripts or KV.

```bash
export CLOUDFLARE_ACCOUNT_ID=436fa630c3903b6bb680222a6963dad5
# Use the Cloudflare token that can manage Pages (not the limited default token).
./scripts/deploy.sh
```

Health check: `GET https://eekseye-orders.pages.dev/` → `{"ok":true,"service":"eekseye-orders"}`.

## Shippo labels

`src/labels.js` creates a Shippo label for every paid `checkout.session.completed` that does not already have one (quote rates → pick service → `POST /transactions` with `label_file_type: PDF_4x6`). US orders prefer **FedEx Ground Home Delivery** (`fedex_home_delivery`); other countries prefer **FedEx International Priority** (`fedex_international_priority`) with a customs declaration (cotton t-shirt, HS 610910, value = order total, made in US, duties paid by recipient). If FedEx is not available on the Shippo account, the cheapest tracked USPS / UPS / DHL Express rate is used. Default package: 1 lb, 12x10x2 in (`SHIP_PKG_WEIGHT_LB`, `SHIP_PKG_DIMS_IN`, `SHIPPO_US_SERVICE`, `SHIPPO_INTL_SERVICE` override).

- Success: the owner email gets the 4x6 label PDF link (and an attachment when Resend can attach it). The slip shows the carrier and tracking number. The buyer is emailed the tracking number and link.
- Failure never blocks the slip: the email still goes out and the slip says `Label failed: <error>`.
- The same order is never purchased twice: Shippo `Idempotency-Key` is `eekseye-label:<Stripe session id>`, and tracking/label fields are stored on the Stripe session metadata.
- Stripe test-mode orders never buy a live label. They only use `SHIPPO_TEST_API_KEY` (or a test `SHIPPO_API_KEY`). `SHIPPO_DRY_RUN=1` quotes rates and does not buy.
- Local checks (never print the key):
  - `node scripts/shippo-unit-test.mjs` (offline)
  - `node scripts/shippo-test.mjs` (rate quote only; `INTL=1` for a Mexicali destination)

See `/SHIPPO_SETUP.md` for dashboard steps (connect FedEx, add a payment method, confirm the ship-from address).
