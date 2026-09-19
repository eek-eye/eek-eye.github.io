# Newsletter – Automated Emails Setup

## What’s already done

When someone subscribes via the footer form on the site, the code sends an **automated welcome email** to that address using your existing EmailJS account (same as the contact form).

## 1. Create the welcome-email template in EmailJS

You need **one new template** in EmailJS so the welcome email is sent **to the subscriber** (not to you).

1. Go to [EmailJS](https://www.emailjs.com/) → **Email Templates** → **Create New Template**.
2. Name it e.g. **Newsletter welcome**.
3. Set:
   - **To Email:** `{{to_email}}` (so the email goes to the person who subscribed)
   - **Subject:** `{{subject}}` (or type a fixed subject like “You’re subscribed – eekseye”)
   - **Body:** use `{{message}}` where you want the welcome text, or write your own and use `{{to_name}}` for their name/email if you like.
4. Save and copy the **Template ID** (e.g. `template_xxxxxxxx`).

## 2. Use that template in the site

In **index.html**, find the newsletter form script and replace `template_newsletter_welcome` with your real Template ID:

```javascript
return emailjs.send('service_ty390sa', 'YOUR_TEMPLATE_ID_HERE', {
```

Use the same variable names in the template as in the code: `to_email`, `to_name`, `subject`, `message`, `reply_to` (optional).

After this, each new subscription will trigger an automated welcome email to the subscriber.

## 3. Sending future newsletters to all subscribers

EmailJS only sends **one-off transactional emails** (e.g. “thanks for subscribing”). It does **not** store a list or send bulk campaigns.

To email **everyone who subscribed** (e.g. “New drop this Friday”):

- **Option A – Newsletter service (recommended)**  
  Use a provider that stores subscribers and sends campaigns, e.g.:
  - [Mailchimp](https://mailchimp.com/)
  - [ConvertKit](https://convertkit.com/)
  - [Buttondown](https://buttondown.com/)

  You can:
  - Replace the current form with their signup form or link, or  
  - Keep your form and add a backend (or Zapier/n8n) that adds the email to that service when someone subscribes.

- **Option B – Collect addresses yourself**  
  In EmailJS you can add a second template that sends a copy of each new signup **to you** (e.g. to `fuchendeonze@gmail.com`) with the subscriber’s email. You’d store those in a sheet or list and later use another tool (or BCC) to send a newsletter. Option A is simpler and more reliable.

## Summary

| Step | Action |
|------|--------|
| 1 | In EmailJS, create a template with **To:** `{{to_email}}`, **Subject:** `{{subject}}`, **Body:** `{{message}}` (or your text). |
| 2 | In index.html, set `emailjs.send('service_ty390sa', 'YOUR_TEMPLATE_ID', { ... })` with that template ID. |
| 3 | For future newsletters to all subscribers, use a dedicated newsletter service (Mailchimp, ConvertKit, etc.) and either their form or a small integration from your form. |

After step 1 and 2, automated welcome emails to new subscribers are handled by the site.
