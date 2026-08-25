#!/usr/bin/env bash
# Local preview server for design work.
#
#   ./dev.sh          → starts the server and opens the merch section
#   Ctrl-C            → stops it
#
# Why not just double-click index.html? Because file:// breaks a few things
# (the audio file, and URL params behave oddly). A real server matches how
# the deployed site actually behaves.

set -e
cd "$(dirname "$0")"

PORT=8080
while lsof -i :$PORT >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

URL="http://localhost:$PORT/?skipintro#merch"

echo ""
echo "  AJ Vitanza — local preview"
echo "  ─────────────────────────────────────────────"
echo "  $URL"
echo ""
echo "  localhost counts as STAGING, so you'll see the"
echo "  orange bar and can switch phases from it."
echo ""
echo "  ?skipintro   skips the 5s boot sequence"
echo "  ?phase=live  jump straight to a phase"
echo ""
echo "  Ctrl-C to stop."
echo "  ─────────────────────────────────────────────"
echo ""

# open the browser once the server is actually up
( sleep 1; open "$URL" 2>/dev/null || true ) &

python3 -m http.server $PORT --bind 127.0.0.1
