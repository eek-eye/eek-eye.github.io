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
- A print-ready 4x6 packing slip for a thermal label printer (print the email, or open the signed link). A FedEx 4x6 label, when present, prints on the next page.
- A placeholder for a FedEx label, filled in later when Ship API credentials are set

## Email path

The Worker tries, in order:

1. Cloudflare `send_email` binding (`PACKING_SLIP_EMAIL`) if Email Routing / Email Sending is configured
2. Resend, if `RESEND_API_KEY` is set
3. EmailJS, if `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` (and preferably `EMAILJS_PRIVATE_KEY`) are set

Nothing is sent to the customer from this Worker.

**One-time step to turn on owner email (pick one):**

- **Recommended / free:** Create a free [Resend](https://resend.com) account with `fuchendeonze@gmail.com`, click the verification email, create an API key, and add it as the Pages secret `RESEND_API_KEY` on project `eekseye-orders` (Cloudflare Dashboard → Workers & Pages → eekseye-orders → Settings → Variables and Secrets, or `npx wrangler pages secret put RESEND_API_KEY --project-name eekseye-orders`). Until the `eekseye.com` domain is verified in Resend, set `EMAIL_FROM` to `onboarding@resend.dev`. After a domain is verified, change `EMAIL_FROM` to something like `orders@eekseye.com`.
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
| `EMAIL_FROM` | Sender address (e.g. `onboarding@resend.dev` or `orders@eekseye.com`) |
| `FEDEX_CLIENT_ID` / `FEDEX_CLIENT_SECRET` / `FEDEX_ACCOUNT_NUMBER` | Later, for the Ship API label step |
| `FEDEX_BASE_URL` | `https://apis-sandbox.fedex.com` then `https://apis.fedex.com` |

## Deploy

This project is deployed as a Cloudflare Pages Worker (`_worker.js`) because the available API token can create Pages projects but cannot upload `workers.dev` scripts or KV.

```bash
export CLOUDFLARE_ACCOUNT_ID=436fa630c3903b6bb680222a6963dad5
# Use the Cloudflare token that can manage Pages (not the limited default token).
./scripts/deploy.sh
```

Health check: `GET https://eekseye-orders.pages.dev/` → `{"ok":true,"service":"eekseye-orders"}`.

## FedEx labels (later)

`src/labels.js` is the hook. When `FEDEX_CLIENT_ID`, `FEDEX_CLIENT_SECRET`, and `FEDEX_ACCOUNT_NUMBER` are present it will be wired to create a label; until then it returns `null` and the slip shows a placeholder. After production credentials and label validation, that module should return `{ provider, trackingNumber, pdfBase64 }` and the owner email will include the label.

Official setup (US/Canada shipper):

1. Get or confirm a FedEx shipping account. Have the account number, the billing address on the account, and a ship-from address (this Worker currently uses 2200 Sendero St, Calexico, CA 92231, phone +1 442 478 6003 — confirm these).
2. Create a FedEx user ID and sign in at [developer.fedex.com](https://developer.fedex.com/).
3. Create an organization (“Ships with FedEx and needs to integrate FedEx APIs into their own applications”), company name, website, organization name.
4. Add the shipping account (account number, nickname, billing address) and accept the EULA.
5. Create an API project, include **Ship API** (and usually API Authorization), name the project, select ship-to countries (this gives a test shipping account).
6. From My Projects → project → API keys → Test Key, copy the **test API Key** (Client ID) and **test Secret Key**. Request an OAuth token for each call (tokens last one hour). Test against `https://apis-sandbox.fedex.com`.
7. Move the project to production (Production key tab). Copy the **production API Key** and **production Secret Key**. The production secret is shown **only once** (it can be regenerated later). Add the production shipping account to the project.
8. US/Canada Ship API requires label validation before production labels work:
   - Create sample labels in the **test** environment for only the services you will use (for example FedEx Ground / 2Day), using real ship-from and sample recipient addresses.
   - **Print and scan at 600 DPI or higher. Do not email the raw API image/PDF.**
   - Fill out the [Label Cover Sheet](https://developer.fedex.com/content/dam/fedex-com/irc/common/Label-Cover-Sheet-form.pdf): shipping account number, production API key, company, contact, email, printer model and count, label image type (PDF or PNG for a laser printer), services requested.
   - Email the scanned labels + cover sheet to **label@fedex.com** (or mail physical labels to FedEx Services, WTC-Business Solutions Testing, 10 FedEx Parkway, 2nd Floor Horizontal, Collierville, TN 38017).
   - Allow about **three business days**. Approval is **per project**. If rejected, fix and resubmit.
9. After the approval email, switch the Worker to `https://apis.fedex.com` and the production keys (as Pages secrets). Then the packing-slip email can attach the label.

References: [FedEx shipper getting started](https://developer.fedex.com/api/en-us/get-started/shipper.html), [shipper validation](https://developer.fedex.com/api/en-us/certification/shipper.html), [Ship API docs](https://developer.fedex.com/api/en-us/catalog/ship/docs.html).
