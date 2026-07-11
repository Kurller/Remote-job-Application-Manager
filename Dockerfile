# Use Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 10000

# Start application
CMD ["node", "server.js"]