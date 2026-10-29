#!/bin/sh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 20 or newer from https://nodejs.org first."
  exit 1
fi
node server.mjs
