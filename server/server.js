import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import app from "./app.js";
import { isSupabaseConfigured } from "./services/supabase.js";

if (!process.env.VERCEL) {
  dotenv.config();
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === "production";

if (!isVercel && isProduction) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`Supabase configured: ${isSupabaseConfigured()}`);
  });
}
