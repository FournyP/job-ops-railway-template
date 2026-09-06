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

## 📝 Notes

- Source repo: https://github.com/FournyP/job-ops-railway-template
- Docs: https://jobops.dakheera47.com/docs

## ⚖️ License

[MIT](LICENSE)
