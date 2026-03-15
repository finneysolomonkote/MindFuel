FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/

FROM base AS dependencies

RUN npm ci --workspace=packages

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY services/api ./services/api

RUN npm run build --workspace=services/api

FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/services/api/dist ./dist
COPY --from=build /app/services/api/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/index.js"]
