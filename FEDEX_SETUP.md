# FedEx label after Stripe order

Goal: when a Stripe Checkout payment succeeds, create a FedEx shipment, email yourself a **PDF label**, and (on XI) auto-print when a printer is available.

## 1) Get FedEx Developer API access (do this in your browser)

1. Open [FedEx Developer Portal](https://developer.fedex.com/) → **Sign up** / log in.
2. Create an **Organization** and a **Project**.
3. Add / enable the **Ship API** (and Auth / OAuth as prompted).
4. Create **Test** API credentials first (API Key + Secret Key).
5. Link / provide your FedEx **account number** when the portal asks (needed for real labels; sandbox can use test account numbers FedEx documents).
6. Later: move the project to **Production** credentials when ready for live labels.

You will also need:

- Ship-from address (your warehouse / home studio)
- Default package weight (lb) and dimensions
- Preferred service (e.g. `FEDEX_GROUND`, `FEDEX_2_DAY`)

## 2) Hosting note

GitHub Pages cannot receive Stripe webhooks. Deploy the `netlify/functions` in this repo to **Netlify** (or another Node host), set env vars there, and point Stripe’s webhook to:

`https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/stripe-fedex-webhook`

Even if the storefront stays on `eekseye.com` (GitHub Pages), the webhook can live on Netlify.

## 3) Environment variables (Netlify)

| Name | Purpose |
|------|---------|
| `STRIPE_SECRET_KEY` | Already used for checkout |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint signing secret |
| `FEDEX_CLIENT_ID` | API Key from FedEx portal |
| `FEDEX_CLIENT_SECRET` | Secret Key from FedEx portal |
| `FEDEX_ACCOUNT_NUMBER` | Your FedEx account number |
| `FEDEX_BASE_URL` | `https://apis-sandbox.fedex.com` then later `https://apis.fedex.com` |
| `SHIP_FROM_NAME` | Shipper name |
| `SHIP_FROM_PHONE` | Shipper phone |
| `SHIP_FROM_LINE1` | Street |
| `SHIP_FROM_CITY` | City |
| `SHIP_FROM_STATE` | State code (e.g. CA) |
| `SHIP_FROM_POSTAL` | ZIP |
| `SHIP_FROM_COUNTRY` | `US` |
| `LABEL_NOTIFY_EMAIL` | Where PDF labels are emailed (you) |
| `EMAILJS_PUBLIC_KEY` / `EMAILJS_SERVICE_ID` / `EMAILJS_TEMPLATE_ID_LABEL` | Optional: email the PDF link/notice via EmailJS |

## 4) Stripe webhook events

Subscribe at minimum to:

- `checkout.session.completed`

The function creates a FedEx shipment using the session’s shipping details + line item metadata (`productId`), saves/returns a PDF label, emails you, and writes a small JSON receipt under a labels folder when running locally / for the print watcher.

## 5) Auto-print on XI (when possible)

Script: `scripts/print-fedex-label.ps1`

- Watches a folder (default `G:\eekseye.com (Website Files)\fedex-labels`) for new PDFs
- Prints with the Windows default printer (`Start-Process -Verb Print`)

Run it while fulfilling orders, or we can later turn it into a scheduled routine.

## 6) After you have keys

Tell me you’re ready — I’ll take the keys via a **secure prompt** (not chat), fill ship-from, deploy/configure the webhook, and do a sandbox test order.
