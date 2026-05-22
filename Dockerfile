# Use Microsoft Container Registry base image to avoid Docker Hub rate limits
FROM mcr.microsoft.com/azurelinux/base/nodejs:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built assets
COPY dist ./dist
COPY server.js ./

# Expose port (will be overridden by Liliput's PORT env var)
EXPOSE 3000

# Start server - listens on 0.0.0.0:$PORT per Liliput contract
CMD ["node", "server.js"]
