#!/bin/sh
set -e

echo "Starting UCloud Status application..."

# Create temp directories for logs and nginx
mkdir -p /tmp/app /tmp/nginx_client_temp /tmp/nginx_proxy_temp /tmp/nginx_fastcgi_temp /tmp/nginx_uwsgi_temp /tmp/nginx_scgi_temp

# Check if backend exists
if [ ! -f /app/backend/server.js ]; then
    echo "ERROR: Backend server.js not found!"
    exit 1
fi

# Check if frontend exists
if [ ! -d /app/frontend/dist ]; then
    echo "ERROR: Frontend dist directory not found!"
    exit 1
fi

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf