# ===========================================
# Cloudron Compatible Production Dockerfile
# ===========================================

ARG NODE_VERSION=20-alpine

# ===========================================
# Stage 1: Backend Dependencies
# ===========================================
FROM node:${NODE_VERSION} AS backend-deps

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# ===========================================
# Stage 2: Frontend Build
# ===========================================
FROM node:${NODE_VERSION} AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ ./
ENV NODE_ENV=production
ENV VITE_API_URL=/api

RUN npm run build
RUN test -d dist || (echo "Frontend build failed!" && exit 1)

# ===========================================
# Stage 3: Cloudron Production Runtime
# ===========================================
FROM nginx:1.25-alpine AS production

# Install Node.js and process manager
RUN apk add --no-cache \
    nodejs \
    npm \
    supervisor \
    curl \
    ca-certificates \
    dumb-init

# Create cloudron user (UID/GID 1000 REQUIRED by Cloudron)
RUN addgroup -g 1000 -S cloudron && \
    adduser -S cloudron -u 1000 -G cloudron

WORKDIR /app

# Set production environment + Cloudron flag
ENV NODE_ENV=production
ENV CLOUDRON=true
ENV PORT=3001

# Copy backend with dependencies
COPY --from=backend-deps --chown=cloudron:cloudron /app/backend ./backend
COPY --chown=cloudron:cloudron backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build --chown=cloudron:cloudron /app/frontend/dist ./frontend/dist

# Copy configuration files from host
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy scripts from host
COPY scripts/healthcheck.sh /usr/local/bin/healthcheck
COPY scripts/startup.sh /usr/local/bin/startup

# Make scripts executable and set ownership
RUN chmod +x /usr/local/bin/healthcheck /usr/local/bin/startup && \
    chown cloudron:cloudron /usr/local/bin/startup

# Create data directories and set permissions
RUN mkdir -p \
    /app/data \
    /app/data/metrics \
    /app/data/history \
    /app/data/logs \
    /tmp/app \
    /tmp/nginx_client_temp \
    /tmp/nginx_proxy_temp \
    /tmp/nginx_fastcgi_temp \
    /tmp/nginx_uwsgi_temp \
    /tmp/nginx_scgi_temp && \
    chown -R cloudron:cloudron /app/data && \
    chmod -R 755 /app/data && \
    chown -R cloudron:cloudron /app /tmp/app /tmp/nginx*

# Remove default nginx configs (security)
RUN rm -rf /etc/nginx/conf.d/default.conf

# Configure nginx to run as cloudron user
RUN chown -R cloudron:cloudron /var/cache/nginx /var/log/nginx /etc/nginx /tmp/app /tmp/nginx* || true

# Switch to cloudron user (REQUIRED by Cloudron)
USER cloudron

# Expose port 3000 (Cloudron standard)
EXPOSE 3000

# Simple health check - check if any process is listening on port 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD netstat -tlnp | grep :3000 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/usr/local/bin/startup"]