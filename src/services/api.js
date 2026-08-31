function getApiBase() {
  if (import.meta.env.PROD) return "";

  const configured = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (
    !configured ||
    configured.includes("localhost") ||
    configured.includes("127.0.0.1")
  ) {
    return "";
  }
  return configured;
}

const API_BASE = getApiBase();

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function getJobs() {
  const response = await fetch(`${API_BASE}/api/jobs`, { cache: "no-store" });
  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data.message || "Unable to load open positions.");
    error.status = response.status;
    throw error;
  }

  return data.jobs || [];
}

export async function getJob(id) {
  const response = await fetch(`${API_BASE}/api/jobs/${id}`, { cache: "no-store" });
  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data.message || "Unable to load this position.");
    error.status = response.status;
    throw error;
  }

  return data.job;
}

export async function submitApplication(formData) {
  const response = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    body: formData,
  });
  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "We couldn't submit your application right now. Please try again.",
    );
    error.status = response.status;
    error.fields = data.fields;
    throw error;
  }

  return data;
}
