FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built frontend assets and server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src/config ./src/config

# Create data directory with correct permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

# Switch to non-root user
USER node

# Expose only the backend port since Cloudron handles the routing
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]