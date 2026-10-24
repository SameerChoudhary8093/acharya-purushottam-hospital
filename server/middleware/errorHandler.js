import { MAX_RESUME_MB } from "../../shared/recruitment.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if ((!err.status || err.status >= 500) && err.message !== "SUPABASE_NOT_CONFIGURED") {
    console.error(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: "File too large",
      message: `Resume must be ${MAX_RESUME_MB} MB or smaller.`,
      fields: { resume: `Resume must be ${MAX_RESUME_MB} MB or smaller.` },
    });
    return;
  }

  if (err.message === "INVALID_FILE_TYPE") {
    res.status(400).json({
      error: "Invalid file",
      message: "Please upload a PDF, DOC, or DOCX file.",
      fields: { resume: "Please upload a PDF, DOC, or DOCX file." },
    });
    return;
  }

  if (err.status === 400 && err.fields) {
    res.status(400).json({
      error: "Invalid fields",
      message: err.message || "Please check the form and try again.",
      fields: err.fields,
    });
    return;
  }

  if (err.code?.startsWith("LIMIT_") || err.type === "entity.too.large") {
    res.status(400).json({
      error: "Invalid request",
      message: "The application contains too much data or an unexpected file. Please check the form.",
    });
    return;
  }

  if (err.status === 400) {
    res.status(400).json({
      error: "Invalid request",
      message: err.type === "entity.parse.failed" ? "Please send valid application data." : "Please check your request and try again.",
    });
    return;
  }

  if (err.status === 404) {
    res.status(404).json({
      error: "Not found",
      message: err.message || "The requested resource was not found.",
    });
    return;
  }

  if (err.message === "SUPABASE_NOT_CONFIGURED" || err.status === 503) {
    res.status(503).json({
      error: "Service unavailable",
      message: "We couldn't complete this request right now. Please try again.",
    });
    return;
  }

  res.status(500).json({
    error: "Something went wrong",
    message: "We couldn't submit your application right now. Please try again.",
  });
}
