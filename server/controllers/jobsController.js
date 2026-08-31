import { requireSupabase } from "../services/supabase.js";

const JOB_COLUMNS =
  "id,title,department,category,description,qualification,specialization,experience_min,experience_max,location,employment_type,salary_range,created_at";

export async function listJobs(_req, res, next) {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to list jobs:", error.message);
      if (/relation .*jobs.* does not exist/i.test(error.message) || error.code === "PGRST205") {
        console.error("The jobs table is missing. Run supabase/schema.sql then supabase/seed.sql in the Supabase SQL editor.");
      }
      const err = new Error("JOBS_FETCH_FAILED");
      err.status = 500;
      throw err;
    }

    res.json({ jobs: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function getJob(req, res, next) {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .eq("id", req.params.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch job:", error.message);
      const err = new Error("JOB_FETCH_FAILED");
      err.status = 500;
      throw err;
    }

    if (!data) {
      const err = new Error("This position is no longer available.");
      err.status = 404;
      throw err;
    }

    res.json({ job: data });
  } catch (error) {
    next(error);
  }
}
