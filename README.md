# Acharya Purushottam Hospital & Medical College — Careers

One-page recruitment website for **Acharya Purushottam Hospital & Medical College**, an SGVU initiative. Candidates browse open positions and submit applications with a resume. The React frontend talks only to a Node.js API; Supabase credentials stay on the server.

## Stack

- React + Vite + Tailwind CSS
- Express REST API
- Supabase PostgreSQL + Storage (`resumes` bucket)

## Local setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Create a Supabase project, then in the SQL editor run:

- [`supabase/schema.sql`](supabase/schema.sql) — tables, indexes, RLS, private `resumes` bucket
- [`supabase/seed.sql`](supabase/seed.sql) — sample jobs (replace before production)

3. Put these values in `.env`:

```text
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_new_secret_key
PORT=5000
VITE_API_URL=
```

`SUPABASE_URL` must be the real project URL from **Supabase → Project Settings → Data API** (example: `https://abcdefghijklmnop.supabase.co`). Placeholders will not connect.

Leave `VITE_API_URL` empty locally so the site calls same-origin `/api` through the Vite proxy.

Never put the secret key in frontend code or `VITE_*` variables. The API uses `SUPABASE_SECRET_KEY` server-side only.

4. Install and run:

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- API: http://localhost:5000 (`GET /api/health`)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite frontend + API together |
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | API only |
| `npm run build` | Production frontend build |
| `npm start` | Serve API (and `dist/` in production) |

## Content and images

Editable copy lives in [`src/config/siteContent.js`](src/config/siteContent.js): hospital name, address, contact placeholders, statistics, hero text, and social links.

Replace photographs in `public/images/hospital/` without changing component code:

- `hero.jpg`
- `exterior.jpg`
- `interior.jpg`
- `medical-team.jpg`
- `facilities.jpg`

Replace `public/favicon.svg` and the inline logo in `src/components/Logo.jsx` when the official brand mark is available.

Contact phone and email are placeholders (`+91 XXXXX XXXXX`, `careers@example.com`) until the hospital/SGVU team confirms production values.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | Active jobs |
| GET | `/api/jobs/:id` | One active job |
| POST | `/api/applications` | Multipart application + `resume` file |

Allowed resume types: PDF, DOC, DOCX, max 5 MB. Files are stored at `applications/{uuid}-{sanitized-filename}` in the private `resumes` bucket. The database stores `resume_path` only.

## Security notes

- Applications are never queried from the browser.
- RLS is enabled on `jobs` and `applications` with no anon/authenticated policies.
- The `resumes` bucket is private.
- An admin dashboard is out of scope for this version; the schema is ready for one later.
