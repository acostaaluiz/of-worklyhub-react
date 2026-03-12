# syntax=docker/dockerfile:1.7

FROM node:20.19.4-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable

FROM base AS build
WORKDIR /app
ENV HUSKY=0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_CURRENCY_LOCALE
ARG VITE_CURRENCY_CODE
ARG VITE_CURRENCY_PRECISION

ENV VITE_API_BASE_URL="${VITE_API_BASE_URL}"
ENV VITE_CURRENCY_LOCALE="${VITE_CURRENCY_LOCALE}"
ENV VITE_CURRENCY_CODE="${VITE_CURRENCY_CODE}"
ENV VITE_CURRENCY_PRECISION="${VITE_CURRENCY_PRECISION}"

RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1
