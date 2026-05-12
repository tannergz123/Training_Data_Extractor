# syntax=docker/dockerfile:1

FROM node:22.22.2-alpine
WORKDIR /app

# Server dependencies (public npm only)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

# Pre-built client output
COPY client/dist ./client/dist

EXPOSE 8080

# --max-http-header-size=65536 is REQUIRED because auth-proxy injects large JWT
# headers (X-M43-Access-Token, X-M43-Id-Token) that exceed Node's default 16KB limit.
CMD ["node", "--max-http-header-size=65536", "server/src/index.js"]
