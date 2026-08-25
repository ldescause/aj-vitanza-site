#!/usr/bin/env bash
# Local preview server.
#
#   ./dev.sh      → starts the server, opens your browser,
#                   and prints a URL you can open on your phone
#   Ctrl-C        → stops it
#
# The phone URL only works while your iPhone and this Mac are on the
# same Wi-Fi network. It won't work on cellular.

set -e
cd "$(dirname "$0")"

PORT=8080
while lsof -i :$PORT >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

# Find this machine's LAN address (Wi-Fi first, then wired).
LAN_IP=""
for iface in en0 en1 en2; do
    IP=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
    if [ -n "$IP" ]; then LAN_IP="$IP"; break; fi
done

LOCAL_URL="http://localhost:$PORT/?skipintro#merch"

echo ""
echo "  AJ Vitanza — local preview"
echo "  ──────────────────────────────────────────────────"
echo "  This Mac:  $LOCAL_URL"
if [ -n "$LAN_IP" ]; then
echo "  iPhone:    http://$LAN_IP:$PORT/?skipintro#merch"
echo "             (same Wi-Fi network — not on cellular)"
else
echo "  iPhone:    couldn't detect a Wi-Fi address."
echo "             Check System Settings → Wi-Fi → Details → IP address"
fi
echo ""
echo "  Pages:     /            homepage"
echo "             /merch.html  the standalone store page"
echo "             /thanks.html post-checkout confirmation"
echo ""
echo "  URL flags: ?skipintro   skip the boot sequence"
echo "             ?phase=live  jump to teaser|presale|live|soldout"
echo ""
echo "  Ctrl-C to stop."
echo "  ──────────────────────────────────────────────────"
echo ""

( sleep 1; open "$LOCAL_URL" 2>/dev/null || true ) &

# 0.0.0.0 rather than 127.0.0.1 so other devices on the network can reach it.
python3 -m http.server "$PORT" --bind 0.0.0.0
