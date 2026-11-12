#!/usr/bin/env bash
set -euo pipefail
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-436fa630c3903b6bb680222a6963dad5}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-/tmp/wrangler-cache}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DIST="$ROOT/.wrangler/pages-dist"
BUNDLE="$ROOT/.wrangler/pages-bundle"
rm -rf "$DIST" "$BUNDLE"
mkdir -p "$DIST" "$BUNDLE"
npx wrangler deploy --dry-run --outdir "$BUNDLE"
cp "$BUNDLE/index.js" "$DIST/_worker.js"
cat > "$DIST/index.html" << 'HTML'
<!doctype html><meta charset="utf-8"><title>EEKSEYE Orders</title>
<p>EEKSEYE order webhook is running.</p>
HTML
npx wrangler pages deploy "$DIST" --project-name eekseye-orders --commit-dirty=true --branch main
