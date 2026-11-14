FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/identity/package.json apps/identity/package.json
COPY apps/posts/package.json apps/posts/package.json
COPY apps/api-gateway/package.json apps/api-gateway/package.json
COPY apps/notification/package.json apps/notification/package.json
RUN npm ci --include-workspace-root --workspace=@connexn/shared --workspace=identity
COPY packages/shared packages/shared
COPY apps/identity apps/identity
RUN npm run build --workspace=@connexn/shared && npm run build --workspace=identity

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/identity/node_modules ./apps/identity/node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/apps/identity/package.json ./apps/identity/package.json
COPY --from=build --chown=node:node /app/apps/identity/dist ./apps/identity/dist
COPY --from=build --chown=node:node /app/apps/identity/drizzle.config.ts ./apps/identity/drizzle.config.ts
COPY --from=build --chown=node:node /app/apps/identity/src/db ./apps/identity/src/db
COPY --from=build --chown=node:node /app/apps/identity/drizzle ./apps/identity/drizzle
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist

USER node
EXPOSE 3001
CMD ["npm", "run", "start:container", "--workspace=identity"]
