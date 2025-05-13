#!/bin/bash

# Build the frontend
npm run build

# Install PM2 globally if not already installed
npm install -g pm2

# Start the application using PM2
pm2 start ecosystem.config.js

# Save the PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup