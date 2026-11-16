FROM node:22-alpine AS build

RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/identity/package.json apps/identity/package.json
COPY apps/posts/package.json apps/posts/package.json
COPY apps/api-gateway/package.json apps/api-gateway/package.json
COPY apps/notification/package.json apps/notification/package.json
# "identity..." = this app plus its workspace dependencies (@connexn/shared)
RUN pnpm install --frozen-lockfile --filter "identity..."

COPY packages/shared packages/shared
COPY apps/identity apps/identity
RUN pnpm --filter "identity..." build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=node:node /app/apps/identity/package.json ./apps/identity/package.json
COPY --from=build --chown=node:node /app/apps/identity/node_modules ./apps/identity/node_modules
COPY --from=build --chown=node:node /app/apps/identity/dist ./apps/identity/dist
COPY --from=build --chown=node:node /app/apps/identity/drizzle.config.ts ./apps/identity/drizzle.config.ts
COPY --from=build --chown=node:node /app/apps/identity/src/db ./apps/identity/src/db
COPY --from=build --chown=node:node /app/apps/identity/drizzle ./apps/identity/drizzle

USER node
WORKDIR /app/apps/identity
EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit push --config=drizzle.config.ts --force && exec node dist/main.js"]
