# Changelog

Notable changes to this template. Entries are named after the Job Ops version they ship,
or after the change itself when a release only touches this template. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Before applying an update, read [Upgrading](README.md#️-upgrading).

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
