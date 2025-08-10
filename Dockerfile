# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Copy package files for all workspaces first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Install dependencies for all workspaces (remove --ignore-scripts to ensure proper workspace setup)
RUN npm ci

# Build stage
FROM base AS build
WORKDIR /app
# Copy node_modules from base stage first
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/client/node_modules ./client/node_modules
COPY --from=base /app/server/node_modules ./server/node_modules
COPY --from=base /app/shared/node_modules ./shared/node_modules
# Copy source code (excluding node_modules)
COPY . .
# Build both client and server
RUN npm run -w client build && npm run -w server build

# Runtime image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and built artifacts
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/client/node_modules ./client/node_modules
COPY --from=base /app/server/node_modules ./server/node_modules
COPY --from=base /app/shared/node_modules ./shared/node_modules
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