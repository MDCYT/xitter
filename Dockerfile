FROM oven/bun:1-slim

WORKDIR /app

# Install system dependencies:
# - ffmpeg / ffprobe for video and media processing
# - postgresql-client for pg_dump backups
# - ca-certificates and curl
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        postgresql-client \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install node dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source and scripts
COPY . .

# Ensure entrypoint is executable
RUN chmod +x docker-entrypoint.sh

ENV PORT=3000
EXPOSE 3000

# unhealthy when the server stops answering or can't reach its database; the
# long start allows for the client download on a first start
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "src/server.ts"]
