import { validateApplicationPayload } from "../middleware/validation.js";
import { requireSupabase } from "../services/supabase.js";
import { deleteResume, uploadResume } from "../services/storage.js";

export async function createApplication(req, res, next) {
  let uploadedPath = null;

  try {
    const payload = validateApplicationPayload(req.body || {}, req.file);
    const supabase = requireSupabase();

    if (payload.job_id) {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id,title,department,is_active")
        .eq("id", payload.job_id)
        .maybeSingle();

      if (jobError) {
        console.error("Job lookup failed:", jobError.message);
        const err = new Error("APPLICATION_FAILED");
        err.status = 500;
        throw err;
      }

      if (!job || job.is_active === false) {
        const err = new Error("This position is no longer available.");
        err.status = 400;
        err.fields = { applyingFor: "This position is no longer available." };
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
      await deleteResume(uploadedPath);
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
