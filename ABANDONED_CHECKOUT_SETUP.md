# Abandoned checkout recovery emails

Your shop is **one-product Stripe checkout** (not a multi-item cart). This feature captures an email before checkout and sends a reminder if payment is not finished.

## What was added

| Piece | Role |
|--------|------|
| `js/abandoned-checkout.js` | Email modal, local intent, return-based EmailJS send |
| `js/abandoned-checkout-config.js` | EmailJS + delay settings |
| `js/stripe-checkout.js` | Asks for email, then starts Stripe |
| `checkout-success.html` | Clears intent / marks purchased |
| `.github/workflows/abandoned-checkout-reminders.yml` | Hourly **timed** emails |
| `scripts/send-abandoned-checkout-reminders.mjs` | Action script (Firestore + EmailJS) |

## 1) EmailJS template (required for both modes)

1. EmailJS → **Email Templates** → Create New Template (e.g. **Abandoned checkout**).
2. **To Email:** `{{to_email}}`
3. **Subject:** `{{subject}}` (or fixed text)
4. **Body:** use `{{message}}`, `{{product_name}}`, `{{product_url}}`
5. Copy the Template ID into `js/abandoned-checkout-config.js` → `emailJsTemplateId`.
6. Use the same service id already on the site: `service_ty390sa`.

Until the template ID is real, recovery sends may fail in the browser console.

## 2) Return-based (works on GitHub Pages now)

If someone starts checkout, leaves, then comes back to the site **after ~1 hour**, the site sends the EmailJS recovery email once (stored in `localStorage`).

No extra hosting required.

## 3) Timed (even if they never return)

Needs **Firestore** + **GitHub Actions secrets**.

### Firestore

1. Firebase console → project `eeks-eye-2efd9` → Build → Firestore → create database.
2. Rules (starter — tighten later):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /abandoned_checkouts/{id} {
      allow create: if request.resource.data.email is string
        && request.resource.data.productId is string
        && request.resource.data.purchased == false
        && request.resource.data.timedEmailSent == false;
      allow update: if false; // server/admin only
      allow read: if false;
    }
  }
}
```

Note: client `markPurchased` updates may fail under these rules; that is OK — timed job skips `purchased == true`, and return-based uses localStorage. For stricter purchase marking, use a Stripe webhook later.

3. Create a service account (Project settings → Service accounts → Generate new private key).

### GitHub repo secrets (`eek-eye/eek-eye.github.io`)

- `FIREBASE_SERVICE_ACCOUNT` — full JSON of the service account key
- `EMAILJS_PUBLIC_KEY` — e.g. `4NNKONRfDtWHf7PIK`
- `EMAILJS_SERVICE_ID` — `service_ty390sa`
- `EMAILJS_TEMPLATE_ID` — your abandoned-checkout template id
- `EMAILJS_REPLY_TO` — optional, defaults in script

Actions → **Abandoned checkout reminders** runs hourly (or Run workflow manually).

If `FIREBASE_SERVICE_ACCOUNT` is missing, the job exits cleanly and only return-based recovery runs.

## Privacy

Only ask for email at checkout; say it is for order updates and an unfinished-checkout reminder. Align with your cookie / privacy copy on `legal.html` when you can.
