FROM node:20-alpine AS base

RUN npm i -g pnpm


FROM base as dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build
RUN pnpm prune --prod


FROM base AS deploy

RUN apk add --update curl && rm -rf /var/cache/apk/*

WORKDIR /app
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/.sveltekit ./.sveltekit
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY ./.env .env

USER node

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build/index.js"]