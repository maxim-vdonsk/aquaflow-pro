FROM node:22-alpine

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm@11.9.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/mcp/package.json ./apps/mcp/
COPY packages/database/package.json ./packages/database/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @aquaflow/database build
RUN pnpm --filter @aquaflow/web build

# output: standalone — copy static assets next to standalone server
RUN cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
