# Stage 1: Build webapp (React + Vite 8)
FROM node:22.14.0-alpine AS webapp-build
WORKDIR /build/webapp
COPY webapp/package.json webapp/package-lock.json ./
RUN npm ci
COPY webapp/ ./
RUN npm run build

# Stage 2: Build server (Express + TypeScript)
FROM node:22.14.0-alpine AS server-build
WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production runtime
FROM node:22.14.0-alpine AS runtime
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=server-build /build/server/dist ./dist
COPY server/public ./public
COPY --from=webapp-build /build/webapp/dist ./webapp-dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
