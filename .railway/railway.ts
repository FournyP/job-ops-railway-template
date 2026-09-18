// Railway Infrastructure as Code: railway config plan | apply
//
// An apply deletes every resource this file does not declare, so link it to a
// project dedicated to this template.
//
// Nothing is required to boot: Job Ops configures itself from the UI on first
// launch. Secrets stay out of here; export any you want set for the first
// apply, later runs omit them and preserve() keeps what Railway holds.
//
//   export RXRESUME_API_KEY=...
//
// Job Ops and nothing else. Its state is SQLite on the volume below, PDFs are
// rendered locally or through Reactive Resume's hosted API, so it needs no
// Postgres, no Redis, no browser service and no bucket.

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
      // The port the image binds. Pinned so the domain's target port and the
      // port Railway dials cannot disagree, which reads as "connection refused".
      PORT: "3001",
      DATA_DIR,

      // One volume per service, so everything that must survive a redeploy
      // lives under DATA_DIR: the Codex CLI login and Tectonic's LaTeX support
      // bundle, which is otherwise re-downloaded on the first PDF of every
      // deploy and can hit a 429.
      CODEX_HOME: `${DATA_DIR}/codex-home`,
      XDG_CACHE_HOME: `${DATA_DIR}/cache`,

      // Scoring and generation. Any of the providers in upstream's .env.example;
      // the CLI providers (codex, claude_cli, gemini_cli) are bundled in the
      // image and log in from the UI instead of taking a key here.
      LLM_PROVIDER: fromEnvOrPreserve("LLM_PROVIDER"),
      LLM_API_KEY: fromEnvOrPreserve("LLM_API_KEY"),
      MODEL: process.env.MODEL ?? "google/gemini-3-flash-preview",

      // Reactive Resume v5 API key, for tailored CVs rendered by rxresu.me.
      // Leave RXRESUME_URL unset to use the hosted service.
      RXRESUME_API_KEY: fromEnvOrPreserve("RXRESUME_API_KEY"),
      RXRESUME_URL: fromEnvOrPreserve("RXRESUME_URL"),

      // Background tasks have no request to derive a host from. Resolves to a
      // bare "https://" until the service has a domain, so generate one before
      // relying on the pipeline's links.
      JOBOPS_PUBLIC_BASE_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",

      // Optional, and preserved rather than omitted: an apply deletes variables
      // this file does not declare, which would silently disable these.
      BASIC_AUTH_USER: fromEnvOrPreserve("BASIC_AUTH_USER"),
      BASIC_AUTH_PASSWORD: fromEnvOrPreserve("BASIC_AUTH_PASSWORD"),
      GMAIL_OAUTH_CLIENT_ID: fromEnvOrPreserve("GMAIL_OAUTH_CLIENT_ID"),
      GMAIL_OAUTH_CLIENT_SECRET: fromEnvOrPreserve("GMAIL_OAUTH_CLIENT_SECRET"),
      GMAIL_OAUTH_REDIRECT_URI: fromEnvOrPreserve("GMAIL_OAUTH_REDIRECT_URI"),
      ADZUNA_APP_ID: fromEnvOrPreserve("ADZUNA_APP_ID"),
      ADZUNA_APP_KEY: fromEnvOrPreserve("ADZUNA_APP_KEY"),
      APIFY_TOKEN: fromEnvOrPreserve("APIFY_TOKEN"),
      UKVISAJOBS_EMAIL: fromEnvOrPreserve("UKVISAJOBS_EMAIL"),
      UKVISAJOBS_PASSWORD: fromEnvOrPreserve("UKVISAJOBS_PASSWORD"),
    },
  });

  return project("Job Ops", { resources: [data, jobOps] });
});
