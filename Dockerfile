# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MOCK_API
ARG NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS
ARG NEXT_PUBLIC_MAX_TOTAL_UPLOAD_MB
ARG NEXT_PUBLIC_ENABLE_AUTH_GUARD

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_MOCK_API=$NEXT_PUBLIC_MOCK_API
ENV NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS=$NEXT_PUBLIC_ALLOWED_FILE_EXTENSIONS
ENV NEXT_PUBLIC_MAX_TOTAL_UPLOAD_MB=$NEXT_PUBLIC_MAX_TOTAL_UPLOAD_MB
ENV NEXT_PUBLIC_ENABLE_AUTH_GUARD=$NEXT_PUBLIC_ENABLE_AUTH_GUARD

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

# Optional stage for CI/HMG/PRD E2E execution with Playwright-managed browsers.
FROM mcr.microsoft.com/playwright:v1.56.0-noble AS e2e
WORKDIR /app
ENV APP_ENV=HMG
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx playwright install --with-deps chromium
CMD ["npm", "run", "test:e2e"]
