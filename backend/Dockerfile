# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile — Node.js Express API
# Runs as a dedicated non-root `node` user (uid 1000 in node:alpine).
# The `node` user is created by the official node:alpine image automatically.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine

# Install dumb-init: a minimal init process that correctly handles PID 1
# signal forwarding (SIGTERM on `docker stop`) so the Node process exits
# gracefully instead of being SIGKILL'd after the stop timeout.
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy manifests first so the npm install layer is cached independently
# from the source code layer (faster rebuilds on source-only changes).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

# Copy source after installing dependencies
COPY . .

# Grant ownership to the node user before dropping privileges.
# WORKDIR /app is currently owned by root; chown lets the node user
# write pid files, temporary uploads, etc. without needing root.
RUN chown -R node:node /app

# Drop root. All subsequent instructions and the CMD run as `node` (uid 1000).
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:8080/health || exit 1

# dumb-init as PID 1 wraps node and forwards signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
