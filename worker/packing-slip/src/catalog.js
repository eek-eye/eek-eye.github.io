/** Fallback catalog if Stripe line items are not expanded on the event. */
export const SHIRTS = {
  "1": { name: "I Eeks Eye I 2026", priceCents: 27500 },
  "2": { name: "I Full Moon I eekseye I 2026", priceCents: 27500 },
  "3": { name: "I Multiple Personality I eekseye I 2026", priceCents: 27500 },
  "4": { name: "I Meta I eekseye I 2026", priceCents: 27500 },
  "5": { name: "I Cold Smile Ideology I eekseye I 2029", priceCents: 27500 },
  "6": { name: "I x I eekseye I 2026 · I y I eekseye I 2026", priceCents: 35000 }
};

export const PAYMENT_LINKS = {
  plink_1UajlT2X7APw4VwX7rtEMGiL: "1",
  plink_1Uajlc2X7APw4VwXkClnd4yO: "2",
  plink_1Uajlg2X7APw4VwXY84Z5mWK: "3",
  plink_1Uajlj2X7APw4VwX5tDoPe99: "4",
  plink_1Uajlm2X7APw4VwXK3wjxVkY: "5",
  plink_1Uajlr2X7APw4VwXVXpJgzlm: "6"
};

export const PRICES = {
  price_1Uajl32X7APw4VwX1UhyK01a: "1",
  price_1Uajl42X7APw4VwX7U7VR0Nl: "2",
  price_1Uajl42X7APw4VwXm4m4wOTM: "3",
  price_1Uajl42X7APw4VwXIjAsRlge: "4",
  price_1Uajl52X7APw4VwXccP4CSnE: "5",
  price_1Uajl52X7APw4VwX3JVy1kmk: "6"
};

export function siteIdFromSession(session) {
  const meta = (session && session.metadata) || {};
  if (meta.site_id && SHIRTS[meta.site_id]) return String(meta.site_id);
  const link = typeof session.payment_link === "string" ? session.payment_link : session.payment_link && session.payment_link.id;
  if (link && PAYMENT_LINKS[link]) return PAYMENT_LINKS[link];
  const items = (session.line_items && session.line_items.data) || [];
  for (const item of items) {
    const priceId = (item.price && (item.price.id || item.price)) || item.price_id;
    if (typeof priceId === "string" && PRICES[priceId]) return PRICES[priceId];
  }
  return "";
}
