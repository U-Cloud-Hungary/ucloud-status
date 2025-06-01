# agent/Dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir psutil

# Create app directory
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy monitoring agent
COPY server_monitor.py /app/

# Copy entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create non-root user
RUN useradd -r -s /bin/false monitor && \
    chown -R monitor:monitor /app

USER monitor

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
    CMD python server_monitor.py --test || exit 1

# Start the monitoring agent
ENTRYPOINT ["/app/entrypoint.sh"]