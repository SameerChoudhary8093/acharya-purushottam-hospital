# Recruitment website implementation report

## Scope and preserved architecture

The existing React/Vite frontend, Express routes, Supabase PostgreSQL and private Supabase Storage, and single-project Vercel entry point remain in place. No deployment was performed and no applicant rows or resume objects were inserted, updated or deleted. The reviewed additive SQL migration was applied to the connected Supabase production project through its SQL Editor on 2026-10-23; the migration did not alter existing application records.

The supplied written requirements were implemented. Four reference screenshots were subsequently supplied and reviewed for the latest header, hero, compact form, card and map refinements. The existing logo, navy/white/green palette and local hero image were retained. The local image README calls the photographs temporary; the active image is labelled illustrative, without an official-hospital claim.

## Active page and hidden code

Desktop order is Header → Hero → Four hiring categories → Eligibility → Application → Contact/footer. Below 1024px the same application form appears immediately after the compact header, before the introduction. Responsive CSS reorders one mounted form; there is one state/submission flow.

Navigation is Home, Open Positions, Eligibility, Apply Now and Contact. Each target has an offset for the sticky header. The mobile menu closes on selection and Escape.

The Services, Doctors and Facilities page files are preserved; their former routes redirect to `/`. About, Highlights, WhyJoinUs, JobListings, CtaBanner and related Stats/RevealImage components are retained without rendering in the homepage. Unused fallback job data is retained but no longer imported by the API client. Placeholder phone/email/social links and example-domain SEO URLs have been removed from active output. The existing configurable address is preserved.

The hero retains the reference composition: a full-width header with the logo at left, centered recruitment navigation and Apply at right, plus a white hero blending into the original hospital image. Its four compact information tiles use supported facts: 750 beds, Rajawas/Jaipur, care and education, and founding-team recruitment. The previous 1,050-bed claim remains removed. The hiring introduction is centered with the requested WE ARE HIRING / Join our Founding Team copy. Category cards preview three entries and expand to show the rest of the unchanged designation list.

## Four categories and data model

`shared/recruitment.js` defines the four approved category IDs (`medical`, `nursing`, `allied`, `administration`), exact category titles and all 31 supplied designation entries. The cards, dropdowns, client/server validation and API response share this source. No additional main categories or invented openings were added.

`GET /api/jobs` queries existing active job records, filters them to approved category/designation combinations, and returns `{ jobs, categories }`. Explicit aliases map existing singular job titles to their approved designation groups. Original job titles and IDs remain intact. The jobs table continues to represent individual openings, rather than being replaced by a four-row table.

Each category card scrolls to the form, selects that category and focuses the designation control. Changing categories clears an incompatible designation. Department choices come only from actual matching jobs; no configured/demo department list is used. When designation and department identify exactly one existing job, its ID is submitted and checked by the API. Other applications retain an empty optional job relationship.

## Application and uploads

Following the requested simplification, the visible form collects only full name, email, mobile, hiring category, designation, qualification, experience, resume and accuracy consent. Optional department appears only when matching real jobs provide choices. The other optional fields are omitted from the interface; their existing API payload defaults and database support remain available. Detailed background can be supplied in the CV. The compact desktop form is approximately 704px high, including its heading and section spacing. Labels, required markers, inline errors, status feedback, focus handling and touch controls are accessible. Full selected category/designation text wraps below narrow-screen dropdowns.

Client and server validate category/designation combinations, email, Indian mobile numbers, dates, experience and file type/size. Pending submissions are locked against repeated clicks and controls are disabled. Recoverable errors preserve all entered details and the selected resume. Success is displayed only after a confirmed 201 response.

PDF, DOC and DOCX files are limited to **4 MiB**, displayed as **4 MB**. A lower limit than the previous 5 MB is necessary because [Vercel Functions cap the whole request payload at 4.5 MB](https://vercel.com/docs/functions/limitations). The server checks extension, MIME and PDF/DOC/OOXML signatures/container entries. Uploads use in-memory buffers and the private `resumes` bucket, with a randomized `applications/...` path. Only that path is saved. Failed application inserts attempt to remove the uploaded object. The Vercel filesystem is not used for permanent storage.

## SQL changes for review

Migration: `supabase/migrations/20261023_recruitment_categories.sql`.

- Add `applications.hiring_category` and `applications.confirmed` without fabricating historical values.
- Allow an omitted department.
- Add approved-category and consent constraints while retaining historical rows.
- Retain application RLS and revoke anonymous/authenticated application grants.
- Keep the resume bucket private and add a restrictive storage policy for it.
- Align bucket file-size configuration with the application upload limit.

`supabase/schema.sql` reflects the new-install structure. `supabase/seed.sql` is safely rerunnable and creates no demonstration openings. No extra tables were added; no tables or application records are dropped or truncated.

## Security and deployment configuration

The API uses the secret key only on the server. A scan of the built client found no configured server secret and no active fallback job payload. Existing local environment files are ignored and were not tracked in the inspected Git history; no secret-style tokens/service-role JWT/private keys were found in the all-commit audit. The user's pre-existing `.gitignore` change was preserved.

There is no public applications read route. API responses expose neither resume paths nor internal database errors. CORS is restricted to configured/local/current-project origins. The API uses appropriate 400/404/201 status paths and a generic service error on external failures. Existing rate limiting remains active.

Production browser requests always use same-origin `/api`. The serverless function bundles `server/` and `shared/`; the SPA rewrite excludes API routes, including bare `/api`. Local static/SPA requests are no longer rewritten into API requests.

## Verification

Recorded local production-server checks:

| Check | Observed result |
| --- | --- |
| `/` | 200 HTML |
| `/services` refresh | 200 frontend HTML, with client redirect handled by React |
| Built JS asset | 200 JavaScript |
| `/api` | 404 JSON, not frontend HTML |
| `GET /api/health` | 200, configured true; this alone is not a DB connectivity test |
| `GET /api/jobs` | 200; five approved existing jobs and exactly four categories |
| `GET /api/jobs/not-a-uuid` | 400 |
| `GET /api/jobs/:id` for unknown valid UUID | 404 |
| `GET /api/applications` | 404 JSON |
| `POST /api/applications` invalid JSON fields, without a resume | 400 with required-field errors; no candidate record or upload created |

Final checks:

- `npm run build`: passed.
- `npm test`: **16 passed, 0 failed** (six client validation tests and ten isolated backend tests). The real Express/multipart/Supabase-client flow uses intercepted fake Supabase requests. All four category payloads, matching job IDs/departments, optional details/consent/resume paths, PDF/DOC/DOCX acceptance, bad files, invalid data, upload failures and insert-failure cleanup were exercised. No production candidate was created.
- Local production server: started successfully on port 5055. `GET /api/jobs/:id` with a real approved job ID returned 200 in addition to the route results above.
- Browser suite: **162 passed, 0 failed** across **320, 375, 430, 768, 1024 and 1440px**. Checked one mounted form, essential visible fields, compact desktop height, mobile application-first order, desktop hero-first order, all four category buttons at every width, designation filtering/reset, disclosure expansion and all 31 retained entries, map presence, centered introduction, repeated selection, anchor offset, legacy route refreshes, empty/invalid/oversized uploads, pending lock, recoverable-error preservation and success/reset behavior. The reference hero was additionally inspected at 1920×958, with 32px edge spacing for the logo and header Apply button. Long selected designations were checked separately on tablet and desktop.
- Browser application POSTs were intercepted, with one simulated 503 and one simulated 201. These UI simulations are not real Supabase persistence tests. The 503 produces one expected browser console resource error; before simulation there were no console errors or failed requests, and there were no JavaScript runtime errors.
- Lazy Google-map document requests cancelled by page navigation are reported separately; an independent map check returned HTTP 200 and visually confirmed the Rajawas area map. The map intentionally identifies the supplied locality, rather than asserting an unverified exact hospital pin.
- No horizontal overflow, clipped ordinary input controls, overlapping controls, or broken images were found at the requested widths. Top and full-page screenshots at 375 and 1440px were also visually inspected.
- Screenshot/results directory: `/private/tmp/hospital-recruitment-qa/` (temporary local QA artifacts).
- `git diff --check`: passed.

Read-only deployed Supabase audit (`tests/supabase-readonly-check.mjs`):

| Check | Observed result and limit |
| --- | --- |
| Jobs table | Available |
| Application category/consent column metadata, zero applicant rows read | `hiring_category` and `confirmed` now available after migration |
| Resume bucket metadata | `public=false`, 4 MiB limit, PDF/DOC/DOCX MIME allowlist |
| Anonymous application query | 401 denied; no application rows returned |
| Anonymous resume listing | 200 with an empty list; cannot by itself prove denial for every object |
| Production data mutations/resume downloads | None performed |

**Submission failure diagnosis and fix:** the connected table was missing both `applications.hiring_category` and `applications.confirmed`, explaining the generic insert error. The additive migration has now added them, kept historical values null, and restricted accepted category/consent values for new records. It also added bucket-level size/MIME limits and a restrictive private-resume policy. Post-migration zero-row schema checks pass for both columns; `/api/health` and `/api/jobs` return 200, with four approved categories and five existing job records. An incomplete synthetic request returns 400 before upload or insert.

No valid candidate application or resume was sent to production. A real end-to-end insert/upload and unauthenticated object-download check remain unverified; test those in staging before handling candidate submissions. No deployment was performed.

## Manual steps before production use

1. The migration is applied to the connected production project. For any other existing environment, review and apply the SQL migration there; for a fresh project, run the schema instead. Do not reset existing data.
2. Review the actual application grants/RLS and private resume bucket policies. Prepared SQL and mocked tests cannot establish deployed permissions by themselves.
3. Keep `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel server environment variables. Set `CLIENT_ORIGIN` for the verified custom domain as applicable. Do not use a `VITE_` secret.
4. Review existing jobs against approved real recruitment information; no demo postings are seeded automatically.
5. Replace the illustrative hero with verified hospital photography and add official contact phone/email only when confirmed. Review visual fidelity against the unavailable reference attachments.
6. Complete one real end-to-end submission and private-file retrieval audit in a dedicated staging environment after applying the migration. No fabricated candidate submission was sent to production during this task.

## Files changed

Frontend composition and content: `src/App.jsx`, `src/pages/Home.jsx`, `src/components/Header.jsx`, `Hero.jsx`, `CareerCategories.jsx`, new `Eligibility.jsx`, `ApplicationForm.jsx`, `LocationContact.jsx`, `Footer.jsx`, `src/config/siteContent.js`, `src/services/api.js`, `src/utils/validation.js`, `src/styles/index.css`, `index.html`.

Shared model: new `shared/recruitment.js`.

API/security: `server/app.js`, `server/server.js`, `server/controllers/jobsController.js`, `applicationsController.js`, `server/middleware/validation.js`, `upload.js`, `errorHandler.js`, `server/services/storage.js`, `supabase.js`, `api/[...path].js`, `vercel.json`.

Database review files: `supabase/schema.sql`, `supabase/seed.sql`, new `supabase/migrations/20261023_recruitment_categories.sql`.

Documentation/checks: `README.md`, `package.json`, this report, `tests/frontend-validation.test.js`, `server/tests/recruitment.test.js`, `tests/supabase-readonly-check.mjs`, and `tests/recruitment-browser.mjs`.
