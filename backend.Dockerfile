FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && npm run dev -- --host"]