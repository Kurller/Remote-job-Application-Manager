# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY . .

# Expose port
EXPOSE 10000

# Set production env
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]