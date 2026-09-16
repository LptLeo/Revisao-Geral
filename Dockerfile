# === ETAPA 1: Build ===
FROM node:24-alpine AS builder
WORKDIR /app

# Copia configs, deps (também as de dev) e instala-as
COPY package*.json ./
RUN npm ci

# Copia o código fonte e gera a pasta de distribuição (dist)
COPY . .
RUN npm run build

# === ETAPA 2: Runner ===
FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/index.js"]