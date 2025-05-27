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
CMD ["sh", "-c", "npm run dev || (echo 'Server crashed, keeping container alive for debugging' && tail -f /dev/null)"]