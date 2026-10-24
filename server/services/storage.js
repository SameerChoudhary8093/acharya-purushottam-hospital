import { randomUUID } from "node:crypto";
import path from "node:path";
import { requireSupabase } from "./supabase.js";

const BUCKET = "resumes";

export function sanitizeFilename(originalName) {
  const ext = path.extname(originalName || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  const safeExt = [".pdf", ".doc", ".docx"].includes(ext) ? ext : ".pdf";
  const base = path
    .basename(originalName || "resume", path.extname(originalName || ""))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
  const safeBase = base || "resume";
  return `${safeBase}${safeExt}`;
}

export function buildResumePath(originalName) {
  return `applications/${randomUUID()}-${sanitizeFilename(originalName)}`;
}

export async function uploadResume(file) {
  const client = requireSupabase();
  const storagePath = buildResumePath(file.originalname);
  const { error } = await client.storage.from(BUCKET).upload(storagePath, file.buffer, {
    contentType: file.mimetype || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    console.error("Resume upload failed:", error.message);
    const err = new Error("STORAGE_UPLOAD_FAILED");
    err.status = 500;
    throw err;
  }

  return storagePath;
}

export async function deleteResume(storagePath) {
  if (!storagePath) return;
  try {
    const client = requireSupabase();
    const { error } = await client.storage.from(BUCKET).remove([storagePath]);
    if (error) console.error("Failed to clean up uploaded resume.");
  } catch (error) {
    console.error("Failed to clean up uploaded resume:", error.message);
  }
}
