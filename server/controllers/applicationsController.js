import { validateApplicationPayload } from "../middleware/validation.js";
import { requireSupabase } from "../services/supabase.js";
import { deleteResume, uploadResume } from "../services/storage.js";
import { normalizeRecruitmentJob } from "../../shared/recruitment.js";

export async function createApplication(req, res, next) {
  let uploadedPath = null;

  try {
    const payload = validateApplicationPayload(req.body || {}, req.file);
    const supabase = requireSupabase();

    if (payload.job_id) {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id,title,department,category,is_active")
        .eq("id", payload.job_id)
        .maybeSingle();

      if (jobError) {
        console.error("Job lookup failed:", jobError.message);
        const err = new Error("APPLICATION_FAILED");
        err.status = 500;
        throw err;
      }

      const approvedJob = normalizeRecruitmentJob(job);
      if (!approvedJob) {
        const err = new Error("This position is no longer available.");
        err.status = 400;
        err.fields = { applyingFor: "This position is no longer available." };
        throw err;
      }

      if (
        approvedJob.category !== payload.hiring_category
        || approvedJob.designation !== payload.applying_for
        || (approvedJob.department && approvedJob.department !== payload.department)
      ) {
        const err = new Error("Please select a category, designation and department that match this position.");
        err.status = 400;
        err.fields = { applyingFor: "The selected details do not match this position." };
        throw err;
      }
    }

    uploadedPath = await uploadResume(req.file);

    const { data, error } = await supabase
      .from("applications")
      .insert({
        ...payload,
        resume_path: uploadedPath,
        status: "new",
      })
      .select("id,created_at")
      .single();

    if (error) {
      console.error("Application insert failed:", error.message);
      const err = new Error("APPLICATION_FAILED");
      err.status = 500;
      throw err;
    }

    res.status(201).json({
      success: true,
      applicationId: data.id,
      createdAt: data.created_at,
    });
  } catch (error) {
    if (uploadedPath && error.message !== "STORAGE_UPLOAD_FAILED") {
      await deleteResume(uploadedPath);
    }
    next(error);
  }
}
