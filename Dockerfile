FROM node:22-alpine AS base
RUN npm install -g pnpm@9

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
ARG VITE_BACKEND_URL
ARG VITE_SITE_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_SITE_URL=$VITE_SITE_URL
RUN pnpm run build

FROM base AS runner
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV VITE_PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "pnpm vite preview --host 0.0.0.0 --port ${VITE_PORT}"]
