# Stripe Checkout Setup

Customers pay on **product pages** (`product.html`) via **Stripe Checkout** (hosted payment page — cards, Apple Pay, Google Pay, etc.).

## What's in the repo

| File | Purpose |
|------|---------|
| `js/stripe-config.js` | Public config (API URL, publishable key) |
| `js/stripe-checkout.js` | Purchase button to Stripe |
| `js/explore-data.js` | Optional `stripePaymentLink` per product |
| `api/create-checkout-session.js` | Vercel serverless handler |
| `netlify/functions/create-checkout-session.js` | Netlify serverless handler |
| `lib/stripe-checkout.js` | Shared session logic |
| `checkout-success.html` / `checkout-cancel.html` | Return pages after payment |

## 1. Create products in Stripe

1. Sign up at [stripe.com](https://stripe.com) and open **Dashboard → Product catalog**.
2. Create one **Product** per shirt (match titles in `js/explore-data.js`).
3. Add a **Price** in USD for each ($275 or $350).
4. Copy each **Price ID** (`price_…`).

## 2. Set environment variables

On **Vercel** or **Netlify** (Project settings → Environment variables), add:

```
STRIPE_SECRET_KEY=sk_live_…   (or sk_test_… while testing)
STRIPE_PRICE_IDS={"1":"price_…","2":"price_…","3":"price_…","4":"price_…","5":"price_…","6":"price_…","7":"price_…"}
SITE_URL=https://eekseye.com
```

Keys map to product IDs in `js/explore-data.js` (1–7).

Copy `.env.example` for local reference — never commit real secret keys.

## 3. Deploy with serverless support

### Vercel (recommended)

1. Connect the repo to [Vercel](https://vercel.com).
2. Run `npm install` (Vercel does this automatically from `package.json`).
3. Default API route: `/api/create-checkout-session` (already set in `js/stripe-config.js`).

### Netlify

1. Connect the repo to [Netlify](https://netlify.com).
2. In `js/stripe-config.js`, change:

```javascript
checkoutApiUrl: '/.netlify/functions/create-checkout-session',
```

3. Deploy — Netlify builds functions from `netlify/functions/`.

## 4. Update public config

In `js/stripe-config.js`:

```javascript
publishableKey: 'pk_live_…'  // or pk_test_…
```

## 5. Quick option: Payment Links (no backend)

If you cannot deploy serverless yet, create a **Payment Link** in Stripe for each product and paste the URL in `js/explore-data.js`:

```javascript
stripePaymentLink: "https://buy.stripe.com/…",
```

The Purchase button will open that link directly (no API needed).

## 6. Test

1. Use Stripe **test mode** keys and [test card](https://docs.stripe.com/testing) `4242 4242 4242 4242`.
2. Open `product.html?id=1` → click **Purchase**.
3. Complete checkout → you should land on `checkout-success.html`.

## Flow

```
product.html  →  POST /api/create-checkout-session  →  Stripe Checkout  →  success / cancel pages
```

The secret key stays on the server; the browser only receives a one-time Checkout URL.
