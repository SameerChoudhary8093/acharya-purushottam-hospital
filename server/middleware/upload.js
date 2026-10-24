import path from "node:path";
import multer from "multer";
import { MAX_RESUME_BYTES } from "../../shared/recruitment.js";

export { MAX_RESUME_BYTES };
const MIME_BY_EXTENSION = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function invalidFile() {
  const error = new Error("INVALID_FILE_TYPE");
  error.status = 400;
  return error;
}

function hasDocxEntries(buffer) {
  // Inspect ZIP central-directory filenames; nothing is extracted or executed.
  const entries = new Set();
  for (let offset = 0; offset <= buffer.length - 46; offset += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) continue;
    const length = buffer.readUInt16LE(offset + 28);
    const extra = buffer.readUInt16LE(offset + 30);
    const comment = buffer.readUInt16LE(offset + 32);
    const end = offset + 46 + length + extra + comment;
    if (end > buffer.length) return false;
    entries.add(buffer.subarray(offset + 46, offset + 46 + length).toString("utf8"));
    offset = end - 1;
  }
  return entries.has("[Content_Types].xml") && entries.has("word/document.xml");
}

export function validateResumeContent(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mime = MIME_BY_EXTENSION[extension];
  const buffer = file.buffer;
  if (!mime || !Buffer.isBuffer(buffer) || !buffer.length) throw invalidFile();
  if (buffer.length > MAX_RESUME_BYTES) {
    const error = new Error("Resume too large");
    error.code = "LIMIT_FILE_SIZE";
    throw error;
  }
  if (file.mimetype && file.mimetype !== mime && file.mimetype !== "application/octet-stream") throw invalidFile();

  let valid = false;
  if (extension === ".pdf") valid = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === ".doc") {
    valid = buffer.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"))
      && buffer.includes(Buffer.from("WordDocument", "utf16le"));
  }
  if (extension === ".docx") {
    valid = buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50 && hasDocxEntries(buffer);
  }
  if (!valid) throw invalidFile();
  file.mimetype = mime;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 24, fieldSize: 4000, parts: 25 },
  fileFilter(_req, file, callback) {
    const expected = MIME_BY_EXTENSION[path.extname(file.originalname || "").toLowerCase()];
    if (expected && (!file.mimetype || file.mimetype === expected || file.mimetype === "application/octet-stream")) callback(null, true);
    else callback(invalidFile());
  },
});

export const uploadResume = upload.single("resume");
