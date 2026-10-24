# Acharya Purushottam Hospital & Medical College — Recruitment

Single-page React/Vite recruitment site with the existing Express API, Supabase PostgreSQL and private Supabase Storage. Frontend and API remain one Vercel project. The additive recruitment schema migration was applied to the connected Supabase production project on 2026-10-23; no applicant records or resume objects were created or changed, and no deployment was performed.

## Local setup

1. Copy `.env.example` to `.env` and fill in server-side Supabase credentials. Never put a secret key in a `VITE_` variable.
2. The connected production database already has `supabase/migrations/20261023_recruitment_categories.sql`. For any **other existing database**, review and run it in the Supabase SQL editor before using the updated submission endpoint. It adds category and consent fields, allows an omitted department, and reinforces resume privacy. Historical applications remain intact.
3. For a **new database**, run `supabase/schema.sql`. `supabase/seed.sql` is deliberately a safe no-op: it creates no unverified vacancies or applicants. The migration can also be run after the schema.
4. Run `npm install`, then `npm run dev`. Vite proxies `/api` to Express on port 5000. Use the URL printed by Vite if its default port is occupied.

Environment names and placeholders are documented in `.env.example`. `.env` and local environment files stay ignored. `SUPABASE_PUBLISHABLE_KEY` is only needed for the optional read-only privacy audit; the frontend does not access Supabase directly.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite and Express development servers |
| `npm run build` | Production frontend build |
| `npm start` | Express API and production `dist/` files |
| `npm test` | Client validation and isolated API/storage tests |
| `node tests/recruitment-browser.mjs http://localhost:5055` | Responsive browser checks, when local Chrome and `puppeteer-core` are available |

## Recruitment content and application flow

`shared/recruitment.js` is the authoritative catalogue used by the category cards, form validation and API. It contains only these categories and the 31 designation entries supplied in the recruitment brief:

- Medical Faculty & Clinical Professionals
- Nursing Professionals
- Allied Healthcare Professionals
- Hospital Administration & Support Services

The catalogue is recruitment information, not a list of invented individual vacancies. `public.jobs` retains its existing purpose as individual verified postings. The API filters existing jobs against the catalogue; a small explicit compatibility map recognizes historical singular titles and category names. It does not insert or delete jobs. Existing records outside the approved catalogue remain in the database but are excluded from this recruitment experience.

Department choices come only from actual matching job records. The form retains a `job_id` when a selected designation and department identify exactly one real opening. Otherwise the optional relationship remains empty. The API verifies any supplied relationship. Every new application stores its canonical category, designation, submitted details, consent, and private `resume_path`.

The form is mounted once. Below 1024px, CSS places it immediately after the compact header; at 1024px and above, the hero, categories and eligibility appear first. A category card selects the correct category and scrolls to the form. Changing categories clears an incompatible designation. Failed submissions preserve entered values and the selected file. A submission lock prevents repeated clicks while pending.

## API and uploads

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Process/configuration status; not a database connectivity assertion |
| GET | `/api/jobs` | Approved real jobs plus shared category/designation catalogue |
| GET | `/api/jobs/:id` | One approved active job; invalid ID 400, unavailable job 404 |
| POST | `/api/applications` | Validated multipart applicant details and `resume` |

Required multipart fields: `full_name`, `email`, `mobile`, `hiring_category`, `applying_for`, `qualification`, `total_experience`, `confirmed=true`, and `resume`. Category accepts the stable catalogue ID or canonical title. Personal/professional optional fields remain supported. Department is optional where not applicable; an explicitly linked job must match it.

Resumes support PDF, DOC and DOCX, **maximum 4 MiB (shown as 4 MB)**. The server checks filename extension, MIME and file signature/container entries, and uploads from memory to the private `resumes` bucket. The file path is saved in the application; no local permanent storage or public download URL is used. Failed database inserts attempt to remove the uploaded file.

The 4 MB limit leaves space for the multipart envelope below [Vercel's 4.5 MB function payload limit](https://vercel.com/docs/functions/limitations). Frontend, API and bucket configuration use the same limit. Application responses never expose internal database errors, resume paths or server secrets.

## Content, images and retained code

Hospital branding and the configured address remain in `src/config/siteContent.js`. Phone, email and generic social links were placeholders and are now blank; set them only after official confirmation. The existing image folder is documented as temporary photography, so the active hero has an explicit illustrative caption and neutral alt text. Replace it with verified hospital photography and update the caption when available. The later four reference screenshots were reviewed to refine the full-width header/hero, centered hiring introduction, shorter expandable cards, compact application and small Rajawas area map.

Services, Doctors and Facilities page files remain intact, but active routes redirect to `/`. Homepage-only About, Highlights, WhyJoinUs, Stats, JobListings and CtaBanner components remain available without rendering. Legacy demo fallback data is retained as an unused file and is never used by the active API client. Restoring a component requires reviewing its old copy and images first.

## Security and production preparation

Read-only verification during this update found that the connected project is missing at least one required application column (`hiring_category` or `confirmed`). **Apply the reviewed migration before live submissions.** The resume bucket is already private and anonymous application reads were denied. Anonymous resume listing returned an empty response; that is not proof of every object-level access policy. Actual upload/insert verification still needs a dedicated staging environment after migration.

- All browser API requests use same-origin `/api`; Vercel routes API requests separately from the SPA fallback. The serverless function includes both `server/` and `shared/` sources.
- The secret key stays in server environment variables. `.env.example` contains placeholders only.
- Application RLS is enabled; anonymous and authenticated application grants are revoked. No public applications endpoint exists.
- The resume bucket remains private. A restrictive storage policy blocks anonymous/authenticated access to recruitment resumes even if an older permissive policy exists. Service-role uploads continue through Express.
- CORS allows configured origins and the current Vercel project URLs, rather than every Vercel deployment.
- Review the additive migration before manually applying it. Verify application grants/RLS and bucket policies in the target project, then perform a real end-to-end submission in a dedicated staging environment. Isolated mocked tests do not prove deployed Supabase permissions.
- No fabricated candidate should be submitted to production. Do not reset the database, drop tables or truncate existing records.

See `docs/recruitment-update.md` for the implementation and verification report.
