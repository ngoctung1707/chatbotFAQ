# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.mjs file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:lts-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Chep CA package-lock.json, khong chi package.json.
#
# Thieu lockfile thi `npm i` giai lai phu thuoc tu dau moi lan build, nen
# container co the nhan mot bo phien ban KHAC voi may dev — dung ho loi "local
# chay ngon, container hong" ma khong co cach nao lan ra tu ma nguon.
#
# Da tung xay ra tren chinh du an nay: `--force` bo qua peerDependencies, va
# `zod` (peer cua ai@7) bien mat, giet MOI loi goi LLM trong khi `tsc` van bao
# sach. Lan do vao duoc dependencies nen gio an toan, nhung co che thi van con
# nguyen neu khong ghim lockfile.
COPY package.json package-lock.json ./
RUN npm i --force


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Remove this line if you do not have this folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
