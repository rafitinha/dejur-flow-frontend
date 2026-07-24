# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
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
