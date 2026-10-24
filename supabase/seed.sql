-- Intentionally no demo openings or applicants.
-- The four approved recruitment categories and their designations are defined
-- in shared/recruitment.js and returned by GET /api/jobs.
-- public.jobs continues to represent individually approved openings. Add only
-- verified postings through the existing administrative database workflow.
-- Re-running this file is safe and leaves existing records unchanged.
begin;
select 1;
commit;
