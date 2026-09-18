# Job Ops publishes an official, versioned image, so unlike the early versions
# of this template there is nothing to build from source: pin the tag and keep
# the upstream entrypoint, which runs the drizzle migrations and starts the
# server. Runtime configuration is all environment, see .railway/railway.ts.
# https://github.com/DaKheera47/job-ops
FROM ghcr.io/dakheera47/job-ops:v0.13.1

# Railway ignores the image's HEALTHCHECK and probes healthcheckPath instead;
# the upstream default is kept for docker run.
EXPOSE 3001
