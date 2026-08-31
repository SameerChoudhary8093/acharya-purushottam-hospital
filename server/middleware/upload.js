import multer from "multer";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTS = [".pdf", ".doc", ".docx"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    const name = (file.originalname || "").toLowerCase();
    const extOk = ALLOWED_EXTS.some((ext) => name.endsWith(ext));
    const typeOk = !file.mimetype || ALLOWED_TYPES.has(file.mimetype);
    if (extOk || typeOk) cb(null, true);
    else cb(new Error("INVALID_FILE_TYPE"));
  },
});

export const uploadResume = upload.single("resume");
