FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
COPY packages/client/package.json packages/client/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 4000
CMD ["bun", "run", "start"]
