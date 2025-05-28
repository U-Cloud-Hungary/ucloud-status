#!/bin/sh
set -e

echo "Starting UCloud Status application..."

# Create temp directories for logs and nginx
mkdir -p /tmp/app /tmp/nginx_client_temp /tmp/nginx_proxy_temp /tmp/nginx_fastcgi_temp /tmp/nginx_uwsgi_temp /tmp/nginx_scgi_temp

# Fix data directory permissions if needed
echo "Checking /app/data permissions..."
if [ -d /app/data ]; then
    echo "  /app/data exists, current permissions: $(ls -ld /app/data)"

    # Try to create subdirectories, fix permissions if needed
    if ! mkdir -p /app/data/metrics /app/data/history /app/data/logs 2>/dev/null; then
        echo "  Permission issue detected, attempting to fix..."
        # If we can't create dirs, the mount might have wrong ownership
        # This usually means Cloudron mounted it with wrong permissions

        # Create directories in temp as fallback
        mkdir -p /tmp/app/data/metrics /tmp/app/data/history /tmp/app/data/logs
        echo "  Created fallback directories in /tmp/app/data/"
        export DATA_DIR=/tmp/app/data
    else
        echo "  Successfully created subdirectories in /app/data"
        export DATA_DIR=/app/data
    fi
else
    echo "  /app/data does not exist, using temp directories"
    mkdir -p /tmp/app/data/metrics /tmp/app/data/history /tmp/app/data/logs
    export DATA_DIR=/tmp/app/data
fi

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

echo "Final data directory: $DATA_DIR"
echo "Data directory contents: $(ls -la $DATA_DIR 2>/dev/null || echo 'empty')"

echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf