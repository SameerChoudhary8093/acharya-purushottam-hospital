import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler.js";
import applicationsRouter from "./routes/applications.js";
import jobsRouter from "./routes/jobs.js";
import { getSupabaseStatus, isSupabaseConfigured } from "./services/supabase.js";

if (!process.env.VERCEL) {
  dotenv.config();
}

const app = express();
app.set("trust proxy", 1);

app.use((req, _res, next) => {
  const url = req.url || "/";
  if (!url.startsWith("/api")) {
    req.url = `/api${url.startsWith("/") ? url : `/${url}`}`;
  }
  next();
});

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const local = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]);
  if (local.has(origin)) return true;

  if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    supabase: isSupabaseConfigured(),
    ...getSupabaseStatus(),
  });
});

app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found.",
  });
});

app.use(errorHandler);

export default app;
