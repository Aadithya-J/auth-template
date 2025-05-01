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

RUN addgroup --system appgroup \
 && adduser --system --ingroup appgroup --home /app --shell /bin/sh appuser

COPY Backend/package.json Backend/package-lock.json ./
RUN chown -R appuser:appgroup /app

USER appuser
ENV HOME=/app

RUN npm ci --omit=dev

COPY Backend/ ./
COPY --from=builder /app/frontend/dist /Frontend/dist

EXPOSE 3000
CMD ["npm", "start"]
