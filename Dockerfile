# Base image with Node.js 20
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public env vars (these are fine as ARG - not secrets)
ARG NEXT_PUBLIC_DEV_MODE
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_DEV_MODE=$NEXT_PUBLIC_DEV_MODE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build the application using secret mounts (secrets are not persisted in image)
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=secret,id=AUTH_SECRET \
    --mount=type=secret,id=PASSWORD \
    --mount=type=secret,id=DATABASE_URL \
    AUTH_SECRET=$(cat /run/secrets/AUTH_SECRET) \
    PASSWORD=$(cat /run/secrets/PASSWORD) \
    DATABASE_URL=$(cat /run/secrets/DATABASE_URL) \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]