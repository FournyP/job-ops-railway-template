# Changelog

Notable changes to this template. Entries are named after the Job Ops version they ship,
or after the change itself when a release only touches this template. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Before applying an update, read [Upgrading](README.md#️-upgrading).

## Job Ops 0.13.1 — 2026-09-18

### Changed

- The image is now the official `ghcr.io/dakheera47/job-ops` at a pinned tag instead of a
  source build of `v0.2.0`. The upstream entrypoint runs the migrations; the template's own
  entrypoint and `RUN_MIGRATIONS` are gone.
- `RXRESUME_EMAIL` / `RXRESUME_PASSWORD` are replaced by `RXRESUME_API_KEY` (Reactive
  Resume v5), and Reactive Resume is optional: PDFs render locally by default.
- `LLM_PROVIDER` and `APIFY_TOKEN` are declared; `CODEX_HOME` and `XDG_CACHE_HOME` point
  under `DATA_DIR` so CLI logins and the LaTeX cache survive redeploys.
- CI boots the image and waits for `/health` instead of only building it.

### Upgrade notes

- **Back up the volume before upgrading.** Eleven upstream releases of migrations run on
  the first boot.
- Set `RXRESUME_API_KEY` if you still want Reactive Resume; the old email and password
  variables are ignored by 0.13.

## Infrastructure as Code — 2026-09-06

### Added

- `.railway/railway.ts`, an Infrastructure as Code definition of the project. See
  [Infrastructure as Code](README.md#-infrastructure-as-code).
- CI: `docker-build` builds the image, `iac-typecheck` typechecks `railway.ts`.
- The volume holding `jobs.db` and the PDFs is declared with the service, so an apply
  cannot start the app without its storage.

## Job Ops v0.2.0 — 2026-03-17

### Added

- Initial release. Builds [DaKheera47/job-ops](https://github.com/DaKheera47/job-ops) at
  tag `v0.2.0` and runs the drizzle migrations on boot when `RUN_MIGRATIONS` is true.
- State lives in SQLite at `$DATA_DIR/jobs.db` with the generated PDFs beside it, so the
  service needs a volume at `DATA_DIR` and nothing else.

### Upgrade notes

- **Back up the volume before upgrading.** The migrations run automatically on the first
  boot after a redeploy and there is no downgrade path.
