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

# LEGAL_* прилетают из docker-compose build.args (.env проекта, не в git).
# ДОЛЖНЫ стоять строго ДО next build: статичные страницы и футер запекают
# их в HTML во время сборки — объявленные позже они уже не видны билду.
ARG LEGAL_OPERATOR_NAME
ARG LEGAL_OPERATOR_SHORT
ARG LEGAL_OGRNIP
ARG LEGAL_INN
ARG LEGAL_ADDRESS
ARG LEGAL_BANK_ACCOUNT
ARG LEGAL_BANK_NAME
ARG LEGAL_BIK
ARG LEGAL_PHONE
ARG LEGAL_EMAIL
ENV LEGAL_OPERATOR_NAME=$LEGAL_OPERATOR_NAME \
    LEGAL_OPERATOR_SHORT=$LEGAL_OPERATOR_SHORT \
    LEGAL_OGRNIP=$LEGAL_OGRNIP \
    LEGAL_INN=$LEGAL_INN \
    LEGAL_ADDRESS=$LEGAL_ADDRESS \
    LEGAL_BANK_ACCOUNT=$LEGAL_BANK_ACCOUNT \
    LEGAL_BANK_NAME=$LEGAL_BANK_NAME \
    LEGAL_BIK=$LEGAL_BIK \
    LEGAL_PHONE=$LEGAL_PHONE \
    LEGAL_EMAIL=$LEGAL_EMAIL

COPY . .

RUN pnpm --filter @aquaflow/database build
RUN pnpm --filter @aquaflow/web build

# output: standalone — copy static assets next to standalone server
RUN cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
