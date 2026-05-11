# syntax=docker/dockerfile:1

# Stage 1: Build React frontend
FROM node:22.22.2-alpine AS client-build
ARG NPM_AUTH_TOKEN
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
COPY .npmrc* ./
RUN npm ci && rm -f .npmrc
COPY client/ ./
RUN npm run build

# Stage 2: Production image
FROM node:22.22.2-alpine
WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 8080

# --max-http-header-size=65536 is REQUIRED because auth-proxy injects large JWT
# headers (X-M43-Access-Token, X-M43-Id-Token) that exceed Node's default 16KB limit.
CMD ["node", "--max-http-header-size=65536", "server/src/index.js"]
