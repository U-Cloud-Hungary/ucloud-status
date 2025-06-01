#!/bin/sh
set -e

echo "🚀 Starting UCloud Status Backend..."

echo "📦 Checking database schema..."
npx prisma db push --accept-data-loss || true

echo "✅ Starting application..."
exec node server.js