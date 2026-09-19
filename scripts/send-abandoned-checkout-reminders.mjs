/**
 * Timed abandoned-checkout emails (run by GitHub Actions hourly).
 * Needs env: EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
 * FIREBASE_SERVICE_ACCOUNT (JSON string), optional EMAILJS_REPLY_TO
 */
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const DELAY_MS = Number(process.env.ABANDONED_DELAY_MS || 60 * 60 * 1000);
const COLLECTION = process.env.FIRESTORE_COLLECTION || 'abandoned_checkouts';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function sendEmailJs({ to, productName, productUrl }) {
  const publicKey = requireEnv('EMAILJS_PUBLIC_KEY');
  const serviceId = requireEnv('EMAILJS_SERVICE_ID');
  const templateId = requireEnv('EMAILJS_TEMPLATE_ID');
  const replyTo = process.env.EMAILJS_REPLY_TO || 'fuchendeonze@gmail.com';
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: publicKey,
      service_id: serviceId,
      template_id: templateId,
      template_params: {
        to_email: to,
        to_name: to,
        product_name: productName,
        product_url: productUrl,
        subject: 'You left something behind — eekseye',
        message: `Hey — you started checkout for "${productName}" but didn’t finish. Still waiting here: ${productUrl}`,
        reply_to: replyTo
      }
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS ${res.status}: ${text}`);
  }
}

async function main() {
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saRaw) {
    console.log('FIREBASE_SERVICE_ACCOUNT not set — skipping timed sends (return-based still works on the site).');
    return;
  }
  const sa = JSON.parse(saRaw);
  if (!getApps().length) {
    initializeApp({ credential: cert(sa) });
  }
  const db = getFirestore();
  const cutoff = Timestamp.fromMillis(Date.now() - DELAY_MS);
  const snap = await db
    .collection(COLLECTION)
    .where('purchased', '==', false)
    .where('timedEmailSent', '==', false)
    .where('createdAt', '<=', cutoff)
    .limit(25)
    .get();

  console.log(`Found ${snap.size} abandoned checkout(s) ready for timed email`);
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.email || !data.productUrl) {
      console.warn('Skipping incomplete doc', doc.id);
      continue;
    }
    try {
      await sendEmailJs({
        to: data.email,
        productName: data.productTitle || `Product #${data.productId}`,
        productUrl: data.productUrl
      });
      await doc.ref.set(
        { timedEmailSent: true, timedEmailSentAt: Timestamp.now() },
        { merge: true }
      );
      console.log('Sent timed recovery to', data.email, 'doc', doc.id);
    } catch (err) {
      console.error('Failed doc', doc.id, err.message || err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
