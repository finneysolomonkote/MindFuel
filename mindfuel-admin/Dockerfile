FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/

FROM base AS dependencies

RUN npm ci --workspace=packages

FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY apps/admin ./apps/admin

RUN npm run build --workspace=apps/admin

FROM nginx:alpine AS production

COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
