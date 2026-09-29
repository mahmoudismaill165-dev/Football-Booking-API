# Step 1: Base image
FROM node:20-alpine AS base
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Step 2: Dependencies & Build
FROM base AS dependencies
RUN npm ci

# Copy source files
COPY tsconfig.json prisma.config.ts ./
COPY src ./src

# Build contract if needed
RUN npm run contract:emit || true

# Step 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=dependencies /app/src ./src
COPY --from=dependencies /app/prisma ./prisma
COPY --from=dependencies /app/tsconfig.json ./tsconfig.json
COPY --from=dependencies /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

CMD ["npm", "start"]
