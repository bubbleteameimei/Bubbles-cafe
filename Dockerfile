# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for all workspaces first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install dependencies for all workspaces
RUN npm ci --ignore-scripts

# Build stage
FROM base AS build
WORKDIR /app
COPY . .
# Build both client and server
RUN npm run -w client build && npm run -w server build

# Runtime image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and built artifacts
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/client/dist ./server/public
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/shared ./shared

# Expose port
EXPOSE 3002

# Start server
CMD ["node", "server/dist/index.js"]