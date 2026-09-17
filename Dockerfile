FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are bundled by Next.js at build time. Only public
# browser-safe values belong here; server secrets are runtime environment vars.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_META_PIXEL_ID
ARG NEXT_PUBLIC_LINKEDIN_PARTNER_ID
ARG NEXT_PUBLIC_ENABLE_GOOGLE_AUTH
ARG NEXT_PUBLIC_DEMO_BOOKING_URL
ARG NEXT_PUBLIC_LEAN_PRODUCT_SCOPE
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=$NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID \
    NEXT_PUBLIC_META_PIXEL_ID=$NEXT_PUBLIC_META_PIXEL_ID \
    NEXT_PUBLIC_LINKEDIN_PARTNER_ID=$NEXT_PUBLIC_LINKEDIN_PARTNER_ID \
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=$NEXT_PUBLIC_ENABLE_GOOGLE_AUTH \
    NEXT_PUBLIC_DEMO_BOOKING_URL=$NEXT_PUBLIC_DEMO_BOOKING_URL \
    NEXT_PUBLIC_LEAN_PRODUCT_SCOPE=$NEXT_PUBLIC_LEAN_PRODUCT_SCOPE
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    BACKUP_DIR=/data/backups \
    PG_DUMP=/usr/bin/pg_dump
RUN apt-get update \
    && apt-get install --no-install-recommends -y postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs \
    && mkdir -p /data/backups \
    && chown -R nextjs:nodejs /app /data
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
