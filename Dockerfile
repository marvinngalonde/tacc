# Multi-stage Dockerfile for TACC BuildFlow PMS (Next.js 15 + Prisma 5)

# 1) Base deps stage
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 2) Dependencies stage
FROM base AS deps

# Copy package manifests and Prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci --legacy-peer-deps

# 3) Build stage
FROM base AS builder

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build Next.js app
RUN npx prisma generate && \
    npm run build

# 4) Production runtime
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Copy node_modules for Prisma client
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
