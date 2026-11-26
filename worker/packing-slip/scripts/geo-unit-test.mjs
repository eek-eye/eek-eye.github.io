import { regionFromCountry, geoFromRequest, corsHeaders } from "../src/geo.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
  console.log("ok", msg);
}

assert(regionFromCountry("US") === "us", "US is free domestic");
assert(regionFromCountry("us") === "us", "country codes are normalized");
assert(regionFromCountry("MX") === "intl", "Mexico is international");
assert(regionFromCountry("GB") === "intl", "GB is international");
assert(regionFromCountry("XX") === "", "Cloudflare XX is unknown");
assert(regionFromCountry("T1") === "", "Tor T1 is unknown");
assert(regionFromCountry("") === "", "missing country is unknown");
assert(regionFromCountry("USA") === "", "invalid codes are unknown");

const us = geoFromRequest({ cf: { country: "US" } });
assert(us.country === "US" && us.region === "us", "request.cf US");
const fr = geoFromRequest({ cf: { country: "FR" } });
assert(fr.country === "FR" && fr.region === "intl", "request.cf FR");
const none = geoFromRequest({});
assert(none.country === "" && none.region === "", "missing cf is unknown");

const allowed = corsHeaders({ headers: { get: () => "https://eekseye.com" } });
assert(allowed["access-control-allow-origin"] === "https://eekseye.com", "CORS allows eekseye.com");
const www = corsHeaders({ headers: { get: () => "https://www.eekseye.com" } });
assert(www["access-control-allow-origin"] === "https://www.eekseye.com", "CORS allows www.eekseye.com");
const blocked = corsHeaders({ headers: { get: () => "https://example.com" } });
assert(!blocked["access-control-allow-origin"], "CORS denies other origins");

console.log("\nall geo unit tests passed");
