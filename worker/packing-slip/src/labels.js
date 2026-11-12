/**
 * Pluggable shipping-label step.
 * When FedEx Ship API secrets are present, this is the place to create a label
 * and attach it to the packing-slip email. Until then it returns null.
 *
 * Expected future secrets / vars (see worker/packing-slip/README.md):
 *   FEDEX_CLIENT_ID, FEDEX_CLIENT_SECRET, FEDEX_ACCOUNT_NUMBER,
 *   FEDEX_BASE_URL (https://apis-sandbox.fedex.com then https://apis.fedex.com)
 * plus ship-from vars already on the Worker.
 */
export async function createShippingLabel(env, order) {
  if (!env.FEDEX_CLIENT_ID || !env.FEDEX_CLIENT_SECRET || !env.FEDEX_ACCOUNT_NUMBER) {
    return null;
  }
  // Intentionally not implemented until the owner supplies FedEx credentials
  // and production label validation is complete.
  console.log(JSON.stringify({ msg: "fedex_label_skipped_not_implemented", orderNumber: order.orderNumber }));
  return null;
}

export function withLabel(order, label) {
  if (!label) return order;
  return { ...order, label };
}
