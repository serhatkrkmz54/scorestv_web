# ===================================================================
# Multi-stage build — scorestv_web (Next.js 16)
# Stage 1 (deps): npm ci
# Stage 2 (builder): next build → .next/standalone
# Stage 3 (runner): slim Alpine + standalone server.js
# Sonuc: ~120MB imaj (full deps 500MB+ olur).
# ===================================================================

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
WORKDIR /app
# alpine'da Sharp icin libc6-compat gerekebilir
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Stage 2: builder ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# build-time env (NEXT_PUBLIC_*) gerekiyorsa burada `ARG` ile alinabilir.
RUN npm run build

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# root degil — security best practice
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nextjs

# Static asset'leri + standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js Next standalone tarafindan uretilir; HOSTNAME=0.0.0.0
# Docker network'ten dis erisim icin gerekli.
ENV PORT=3000 \
    HOSTNAME=0.0.0.0

# Container healthcheck — nginx upstream'i bunu kullanabilir
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
