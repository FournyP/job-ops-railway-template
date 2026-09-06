# Job Ops Railway Template

Deploys [Job Ops](https://github.com/DaKheera47/job-ops), a job-application tracker that
scores postings with an LLM and generates tailored CVs through Reactive Resume.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/job-ops?referralCode=C3Uv6n&utm_medium=integration&utm_source=template&utm_campaign=generic)

## ✨ Features

- **One service, one volume.** State is SQLite at `$DATA_DIR/jobs.db`, with the generated
  PDFs beside it — no Postgres, no KeyDB and no bucket to run.
- **LLM scoring and generation**, via any OpenAI-compatible endpoint (`LLM_API_KEY`, `MODEL`).
- **PDF generation through Reactive Resume.** Uses the hosted service at rxresu.me by
  default; set `RXRESUME_URL` to point at your own instance, deployed separately.
- **Optional extras**: basic auth on writes, Gmail tracking, and the Adzuna and
  UKVisaJobs extractors.

## 💁‍♀️ How to use

- Click the Railway button 👆
- Fill in the variables
- Deploy! 🚄

## 🧱 Infrastructure as Code

`.railway/railway.ts` defines the whole project — the service, its volume and every
variable.

```bash
railway link
npm install

# First apply only; later runs omit these and preserve() keeps the values.
export LLM_API_KEY=...
export RXRESUME_EMAIL=you@example.com RXRESUME_PASSWORD='...'

npm run plan     # read the diff before applying
npm run apply
railway domain --service job-ops
```

This template deploys Job Ops and nothing else. Its state is SQLite on the volume, so it
needs no Postgres, no KeyDB and no bucket. It talks to Reactive Resume over HTTP and
defaults to the hosted service; set `RXRESUME_URL` to use your own instance, deployed from
its own project.

Needs the Railway CLI 5.42.1 or newer: the IaC engine ships in the CLI, not in the npm
package. If you forked this repo, change `REPO` in `railway.ts` to your own before applying.

Link it to a project dedicated to this template. An apply deletes every resource **and
every variable** the file does not declare, so from then on variables live in `railway.ts`,
not the dashboard. Do not point it at a project created from the deploy button — the
service names differ, and a mismatch is a delete and recreate, not a rename.

## ⬆️ Upgrading

Railway template updates are opt-in — an existing deployment keeps running until you apply the update. See the [changelog](CHANGELOG.md) for what each update contains.

## 📝 Notes

- Source repo: https://github.com/FournyP/job-ops-railway-template
- Docs: https://jobops.dakheera47.com/docs

## ⚖️ License

[MIT](LICENSE)
