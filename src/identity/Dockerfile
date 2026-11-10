FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY identity/package.json identity/package.json
COPY posts/package.json posts/package.json
COPY api-gateway/package.json api-gateway/package.json
RUN npm ci --include-workspace-root --workspace=@connexn/shared --workspace=identity
COPY packages/shared packages/shared
COPY identity identity
RUN npm run build --workspace=@connexn/shared && npm run build --workspace=identity

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/identity/node_modules ./identity/node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/identity/package.json ./identity/package.json
COPY --from=build --chown=node:node /app/identity/dist ./identity/dist
COPY --from=build --chown=node:node /app/identity/drizzle.config.ts ./identity/drizzle.config.ts
COPY --from=build --chown=node:node /app/identity/src/db ./identity/src/db
COPY --from=build --chown=node:node /app/identity/drizzle ./identity/drizzle
COPY --from=build --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build --chown=node:node /app/packages/shared/dist ./packages/shared/dist

USER node
EXPOSE 3001
CMD ["npm", "run", "start:container", "--workspace=identity"]
