#!/bin/sh
set -e

# Check nginx
if ! pgrep nginx > /dev/null; then
    echo "Nginx not running"
    exit 1
fi

# Check backend
if ! curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "Backend not responding"
    exit 1
fi

# Check frontend
if ! curl -f -s http://localhost/ > /dev/null; then
    echo "Frontend not accessible"
    exit 1
fi

echo "All services healthy"