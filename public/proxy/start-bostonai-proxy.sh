#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install from https://nodejs.org/ then run again."
  open "https://nodejs.org/" 2>/dev/null || xdg-open "https://nodejs.org/" 2>/dev/null || true
  exit 1
fi
echo ""
echo "  BostonAI local proxy — keep this terminal open."
echo "  Then open https://bostonai.io and turn on Local proxy."
echo ""
exec node ./bostonai-proxy.mjs
