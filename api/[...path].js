import app from "../server/app.js";

export default function handler(req, res) {
  // Some serverless adapters strip the function prefix. Normalize only here;
  // the local Express server must retain frontend/static asset request paths.
  const url = req.url || "/";
  if (url !== "/api" && !url.startsWith("/api/")) {
    req.url = `/api${url.startsWith("/") ? url : `/${url}`}`;
  }
  return app(req, res);
}
