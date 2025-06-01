#!/bin/sh
set -e

echo "🚀 Starting UCloud Status Backend..."

echo "📋 Setting up environment..."
if [ -f ".env.prod" ]; then
   echo "Copying .env.prod to .env..."
   cp .env.prod .env
   echo "✅ Environment file configured"
else
   echo "⚠️  Warning: .env.prod not found, using existing .env or defaults"
fi

echo "📦 Checking database schema..."
npx prisma db push --accept-data-loss || true

echo "✅ Starting application..."
exec node server.js