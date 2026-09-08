FROM node:22-alpine AS base
RUN npm install -g pnpm@10

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
# Vite inlines import.meta.env at BUILD time, so the measurement id has to be
# present here — passing it to the running container would be too late and
# analytics would stay silently disabled. Unset is a valid state: the app then
# never loads Google Analytics at all.
ARG VITE_GA_MEASUREMENT_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
RUN pnpm run build

FROM base AS production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY src ./src

ENV VITE_PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "pnpm vite preview --host 0.0.0.0 --port ${VITE_PORT}"]
