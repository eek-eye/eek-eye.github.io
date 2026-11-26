/** Public country lookup for checkout. CORS is limited to the live site. */

export const SITE_ORIGINS = new Set([
  "https://eekseye.com",
  "https://www.eekseye.com"
]);

const UNKNOWN_COUNTRIES = new Set(["", "XX", "T1"]);

export function normalizeCountry(value) {
  return String(value || "").trim().toUpperCase();
}

export function regionFromCountry(country) {
  const code = normalizeCountry(country);
  if (!/^[A-Z]{2}$/.test(code) || UNKNOWN_COUNTRIES.has(code)) return "";
  return code === "US" ? "us" : "intl";
}

export function geoFromRequest(request) {
  const country = normalizeCountry(request && request.cf && request.cf.country);
  const valid = /^[A-Z]{2}$/.test(country);
  return {
    country: valid ? country : "",
    region: regionFromCountry(country)
  };
}

export function corsHeaders(request) {
  const origin =
    (request && request.headers && typeof request.headers.get === "function" && request.headers.get("Origin")) ||
    "";
  const headers = {
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
  if (SITE_ORIGINS.has(origin)) headers["access-control-allow-origin"] = origin;
  return headers;
}

export function geoResponse(request, statusForOptions = 204) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: statusForOptions, headers: corsHeaders(request) });
  }
  const geo = geoFromRequest(request);
  return new Response(JSON.stringify({ ok: true, country: geo.country, region: geo.region }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, max-age=60",
      ...corsHeaders(request)
    }
  });
}
