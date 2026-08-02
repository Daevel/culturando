#!/usr/bin/env bash

set -e

echo "🚀 Starting Culturando fresh development environment..."

bash scripts/setup-dev.sh

echo ""
echo "🌐 Starting Culturando web app..."
echo ""

pnpm dev
