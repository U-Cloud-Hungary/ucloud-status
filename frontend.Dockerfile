FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Start the Vite dev server
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]