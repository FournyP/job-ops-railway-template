// Railway Infrastructure as Code: railway config plan | apply
//
// An apply deletes every resource this file does not declare, so link it to a
// project dedicated to this template.
//
// Secrets stay out of here. Export them for the first apply; later runs omit
// them and preserve() keeps what Railway holds.
//
//   export LLM_API_KEY=...
//   export RXRESUME_EMAIL=you@example.com RXRESUME_PASSWORD='...'
//
// Job Ops and nothing else. Its state is SQLite on the volume below, so it
// needs no Postgres, no KeyDB and no bucket. It talks to Reactive Resume over
// HTTP; self-host that from its own project, not this one.

import { defineRailway, github, preserve, project, service, volume } from "railway/iac";

const REPO = "FournyP/job-ops-railway-template";

// Matched by name, so keep these identical to Railway: a mismatch is a
// delete and recreate, not a rename.
const JOB_OPS_SERVICE = "job-ops";
const DATA_VOLUME = "job-ops-data";

// Holds jobs.db and the generated PDFs. Detaching it loses every application.
const DATA_DIR = "/app/data";

/** Push the value from the local environment if present, else keep Railway's. */
const fromEnvOrPreserve = (name: string) => process.env[name] ?? preserve();

export default defineRailway(() => {
  const data = volume(DATA_VOLUME, { sizeMB: 2048 });

  const jobOps = service(JOB_OPS_SERVICE, {
    source: github(REPO, { branch: "main" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    volumeMounts: {
      [DATA_DIR]: data,
    },
    deploy: {
      healthcheckPath: "/health",
      // SQLite is single-writer, and each replica would run the schedule again.
      numReplicas: 1,
    },
    env: {
      PORT: "3001",
      DATA_DIR,

      // The entrypoint runs the drizzle migrations before starting the server.
      RUN_MIGRATIONS: "true",

      // Scoring and generation.
      LLM_API_KEY: fromEnvOrPreserve("LLM_API_KEY"),
      MODEL: "google/gemini-3-flash-preview",

      // The Reactive Resume account Job Ops drives. Leave RXRESUME_URL unset to
      // use the hosted service.
      RXRESUME_EMAIL: fromEnvOrPreserve("RXRESUME_EMAIL"),
      RXRESUME_PASSWORD: fromEnvOrPreserve("RXRESUME_PASSWORD"),

      // Background tasks have no request to derive a host from. Resolves to a
      // bare "https://" until the service has a domain, so generate one before
      // relying on the pipeline's links.
      JOBOPS_PUBLIC_BASE_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",

      // Optional, and preserved rather than omitted: an apply deletes variables
      // this file does not declare, which would silently disable these.
      RXRESUME_URL: fromEnvOrPreserve("RXRESUME_URL"),
      BASIC_AUTH_USER: fromEnvOrPreserve("BASIC_AUTH_USER"),
      BASIC_AUTH_PASSWORD: fromEnvOrPreserve("BASIC_AUTH_PASSWORD"),
      GMAIL_OAUTH_CLIENT_ID: fromEnvOrPreserve("GMAIL_OAUTH_CLIENT_ID"),
      GMAIL_OAUTH_CLIENT_SECRET: fromEnvOrPreserve("GMAIL_OAUTH_CLIENT_SECRET"),
      GMAIL_OAUTH_REDIRECT_URI: fromEnvOrPreserve("GMAIL_OAUTH_REDIRECT_URI"),
      ADZUNA_APP_ID: fromEnvOrPreserve("ADZUNA_APP_ID"),
      ADZUNA_APP_KEY: fromEnvOrPreserve("ADZUNA_APP_KEY"),
      UKVISAJOBS_EMAIL: fromEnvOrPreserve("UKVISAJOBS_EMAIL"),
      UKVISAJOBS_PASSWORD: fromEnvOrPreserve("UKVISAJOBS_PASSWORD"),
    },
  });

  return project("Job Ops", { resources: [data, jobOps] });
});
