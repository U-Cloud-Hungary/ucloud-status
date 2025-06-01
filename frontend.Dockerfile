FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY /frontend .

# Start the Vite dev server
EXPOSE 5173
CMD ["sh", "-c", "npm install && npm run dev -- --host"]