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

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "src/server.ts"]
