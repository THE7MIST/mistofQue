# MCQ Arena

Modern full-stack MCQ practice platform built with React, Vite, TailwindCSS, Cloudflare Pages, Google Apps Script, and Google Sheets.

## Project Structure

```text
src/
  components/       Reusable UI, sidebar, quiz palette, review items
  context/          Auth and dark-mode state
  data/             Subject/stage route metadata
  hooks/            Quiz session engine
  layouts/          Protected app shell
  pages/            Login, dashboard, topics, quiz, results, analytics
  routes/           Route protection
  services/         Apps Script API, result storage, quiz loaders
  utils/            Shuffle, scoring, time formatting
public/
  data/             CDN-cacheable MCQ JSON by subject and topic
google-apps-script/
  Code.gs           Lightweight API for auth, results, analytics
```

## Local Development

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` and set:

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_DEFAULT_QUIZ_MINUTES=15
```

Without an Apps Script URL, local preview accepts:

```text
demo@mcqarena.dev / demo123
```

## Google Sheets

Users sheet:

| Email | PasswordTkn | Name |
| --- | --- | --- |
| user@gmail.com | abc123 | Candidate |

Results sheet starts with:

| user | subject | score | correct | wrong | date |
| --- | --- | --- | --- | --- | --- |

The backend also stores `stage`, `unattempted`, `totalQuestions`, and `weakAreas` for analytics.

## Cloudflare Pages Deployment

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a project from the repo.
3. Set build command: `npm run build`.
4. Set build output directory: `dist`.
5. Add environment variable `VITE_APPS_SCRIPT_URL`.
6. Deploy.

The `public/_redirects` file enables React Router SPA refreshes, and `public/_headers` adds asset/data caching plus baseline security headers.
