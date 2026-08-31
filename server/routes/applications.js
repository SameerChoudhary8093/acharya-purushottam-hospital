import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createApplication } from "../controllers/applicationsController.js";
import { uploadResume } from "../middleware/upload.js";

const router = Router();

const applyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    error: "Too many requests",
    message: "Please wait a few minutes before submitting another application.",
  },
});

router.post("/", applyLimiter, uploadResume, createApplication);

export default router;
