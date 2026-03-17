# syntax=docker/dockerfile:1.6

# -----------------------------------------------------------------------------
# BUILD STAGE
# -----------------------------------------------------------------------------
FROM node:22-slim AS builder

ARG JOB_OPS_REPO=https://github.com/DaKheera47/job-ops.git
ARG JOB_OPS_TAG=v0.2.0

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates \
	git \
	python3 python3-minimal libpython3.11-minimal \
	python3-pip \
	build-essential pkg-config \
	libgtk-3-0 libgtk-3-common \
	libdbus-glib-1-2 libxt6 libx11-xcb1 libasound2 \
	curl && \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

WORKDIR /src

# Clone a pinned upstream release tag at build time.
RUN git clone --depth 1 --branch "${JOB_OPS_TAG}" "${JOB_OPS_REPO}" /src/job-ops

WORKDIR /src/job-ops

RUN pip3 install --no-cache-dir --break-system-packages playwright python-jobspy

RUN python3 -m playwright install firefox

RUN npm install --workspaces --include-workspace-root --include=dev \
	--no-audit --no-fund --progress=false

RUN npx camoufox-js fetch

WORKDIR /src/job-ops/docs-site
RUN npm run build

WORKDIR /src/job-ops/orchestrator
RUN npm run build:client

# -----------------------------------------------------------------------------
# PRODUCTION STAGE
# -----------------------------------------------------------------------------
FROM node:22-slim AS production

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=3001
ENV PYTHON_PATH=/usr/bin/python3
ENV DATA_DIR=/app/data
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV RUN_MIGRATIONS=true

RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates \
	python3 python3-minimal libpython3.11-minimal \
	python3-pip \
	libgtk-3-0 libgtk-3-common \
	libdbus-glib-1-2 libxt6 libx11-xcb1 libasound2 \
	curl && \
	rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/dist-packages /usr/local/lib/python3.11/dist-packages
COPY --from=builder /ms-playwright /ms-playwright
COPY --from=builder /root/.cache/camoufox /root/.cache/camoufox

COPY --from=builder /src/job-ops/package*.json ./
COPY --from=builder /src/job-ops/docs-site/package*.json ./docs-site/
COPY --from=builder /src/job-ops/shared/package*.json ./shared/
COPY --from=builder /src/job-ops/orchestrator/package*.json ./orchestrator/
COPY --from=builder /src/job-ops/extractors/adzuna/package*.json ./extractors/adzuna/
COPY --from=builder /src/job-ops/extractors/hiringcafe/package*.json ./extractors/hiringcafe/
COPY --from=builder /src/job-ops/extractors/gradcracker/package*.json ./extractors/gradcracker/
COPY --from=builder /src/job-ops/extractors/startupjobs/package*.json ./extractors/startupjobs/
COPY --from=builder /src/job-ops/extractors/ukvisajobs/package*.json ./extractors/ukvisajobs/

RUN npm install --workspaces --include-workspace-root --omit=dev \
	--no-audit --no-fund --progress=false

COPY --from=builder /src/job-ops/orchestrator/dist ./orchestrator/dist
COPY --from=builder /src/job-ops/docs-site/build ./orchestrator/dist/docs
COPY --from=builder /src/job-ops/shared ./shared
COPY --from=builder /src/job-ops/orchestrator ./orchestrator
COPY --from=builder /src/job-ops/visa-sponsor-providers ./visa-sponsor-providers
COPY --from=builder /src/job-ops/extractors/adzuna ./extractors/adzuna
COPY --from=builder /src/job-ops/extractors/hiringcafe ./extractors/hiringcafe
COPY --from=builder /src/job-ops/extractors/gradcracker ./extractors/gradcracker
COPY --from=builder /src/job-ops/extractors/jobspy ./extractors/jobspy
COPY --from=builder /src/job-ops/extractors/startupjobs ./extractors/startupjobs
COPY --from=builder /src/job-ops/extractors/ukvisajobs ./extractors/ukvisajobs

COPY entrypoint.override.sh /usr/local/bin/start-job-ops.sh
RUN chmod +x /usr/local/bin/start-job-ops.sh && mkdir -p /app/data/pdfs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["/usr/local/bin/start-job-ops.sh"]
