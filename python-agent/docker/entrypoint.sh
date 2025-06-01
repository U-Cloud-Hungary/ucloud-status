#!/bin/bash

# Generate config.json from environment variables
cat > /app/config.json << EOF
{
  "api_endpoint": "${API_ENDPOINT:-http://backend:3000/api/metrics}",
  "api_key": "${API_KEY:-}",
  "interval": ${INTERVAL:-60},
  "debug": ${DEBUG:-false},
  "timeout": 30,
  "retry_attempts": 3,
  "retry_delay": 5
}
EOF

echo "🚀 Starting Server Monitoring Agent"
echo "=================================="
echo "Server: ${SERVER_NAME:-Production Server}"
echo "Location: ${SERVER_LOCATION:-US East}"
echo "API Endpoint: ${API_ENDPOINT}"
echo "Update Interval: ${INTERVAL:-60} seconds"
echo "Debug Mode: ${DEBUG:-false}"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
while ! curl -f "${API_ENDPOINT%/metrics}/health" >/dev/null 2>&1; do
    echo "   Backend not ready, waiting 5 seconds..."
    sleep 5
done

echo "✅ Backend is ready!"

# Test connection first
echo "🔍 Testing API connection..."
python server_monitor.py --test

if [ $? -eq 0 ]; then
    echo "✅ Connection test successful!"
    echo "🔄 Starting continuous monitoring..."
    echo ""
else
    echo "❌ Connection test failed!"
    echo "📋 Please check:"
    echo "   - API endpoint: ${API_ENDPOINT}"
    echo "   - API key: ${API_KEY:0:10}..."
    echo "   - Network connectivity"
    echo ""
    echo "🔄 Starting anyway (will retry)..."
fi

# Start the monitoring agent
exec python server_monitor.py
