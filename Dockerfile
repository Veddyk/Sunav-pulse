# ─────────────────────────────────────────────────────────────────────────────
# Frontend Dockerfile — Vite build → nginx static serve.
# Runs nginx as the non-privileged `nginx` user (not root), listening on
# port 8080. Port mapping is handled by docker-compose / Vercel / Railway.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: serve (non-root nginx) ──────────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Grant the `nginx` user (uid 101 in the alpine image) write access to the
# directories it needs at runtime: cache, pid file, logs.
# nginx:1.27-alpine already defines the `nginx` user and group.
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Drop root. All subsequent operations (and the CMD) run as `nginx`.
USER nginx

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
