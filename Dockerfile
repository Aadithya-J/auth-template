# build stage
FROM node:20-alpine AS builder
WORKDIR /app/frontend
RUN apk add --no-cache python3 make g++
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

# final stage
FROM node:20-slim
WORKDIR /app

# Install ffmpeg CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup --home /app --shell /bin/sh appuser

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY Backend/ ./
COPY --from=builder /app/frontend/dist /Frontend/dist

RUN mkdir -p /app/uploads \
    && chown -R appuser:appgroup /app \
    && chmod -R 755 /app \
    && chmod -R 777 /app/uploads

USER appuser
ENV HOME=/app

EXPOSE 3000
CMD ["npm", "start"]