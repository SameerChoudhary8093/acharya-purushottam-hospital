// The browser always calls this project's API; secrets stay on the server.
async function parseJson(response) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new Error("The application service is unavailable. Please try again.");
  return response.json();
}

export async function getJobs() {
  const response = await fetch("/api/jobs", { cache: "no-store" });
  const data = await parseJson(response);
  if (!response.ok || !Array.isArray(data.jobs)) {
    throw new Error(data.message || "Department information is temporarily unavailable.");
  }
  return data.jobs;
}

export async function getJob(id) {
  const response = await fetch(`/api/jobs/${encodeURIComponent(id)}`, { cache: "no-store" });
  const data = await parseJson(response);
  if (!response.ok) {
    const error = new Error(data.message || "Unable to load this position.");
    error.status = response.status;
    throw error;
  }
  return data.job;
}

export async function submitApplication(formData) {
  const response = await fetch("/api/applications", { method: "POST", body: formData });
  const data = await parseJson(response);
  if (!response.ok) {
    const error = new Error(data.message || "We couldn't submit your application right now. Please try again.");
    error.status = response.status;
    error.fields = data.fields;
    throw error;
  }
  if (response.status !== 201 || data.success !== true || !data.applicationId) {
    throw new Error("We couldn't confirm your application. Please try again.");
  }
  return data;
}
