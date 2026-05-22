# Use Microsoft Container Registry base image to avoid Docker Hub rate limits
FROM mcr.microsoft.com/azurelinux/base/nodejs:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# Copy source files needed for build
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Copy server file
COPY server.js ./

# Expose port (will be overridden by Liliput's PORT env var)
EXPOSE 3000

# Start server - listens on 0.0.0.0:$PORT per Liliput contract
CMD ["node", "server.js"]
