# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
# Don't set NODE_ENV=production here since we need devDependencies for building
ENV NODE_ENV=development

# Copy package files for all workspaces first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install dependencies for all workspaces (including devDependencies for building)
RUN npm ci

# Build stage
FROM base AS build
WORKDIR /app
# Copy node_modules from base stage (npm workspaces hoist dependencies to root)
COPY --from=base /app/node_modules ./node_modules
# Copy source code (excluding node_modules)
COPY . .
# Build both client and server
RUN npm run -w client build && npm run -w server build

# Runtime image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies for runtime
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm ci --only=production

# Copy built artifacts
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/shared/dist ./shared/dist

# Copy package files for runtime
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "-w", "server", "start"]