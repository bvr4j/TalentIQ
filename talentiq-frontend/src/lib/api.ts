/**
 * API client for TalentIQ backend.
 * All requests include the JWT from localStorage when available.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("talentiq:token");
}

export function setToken(token: string): void {
  localStorage.setItem("talentiq:token", token);
}

export function clearToken(): void {
  localStorage.removeItem("talentiq:token");
  localStorage.removeItem("talentiq:refreshToken");
  sessionStorage.removeItem("isAuthenticated");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (authenticated) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(name: string, email: string, password: string, company?: string) {
  return request<{ access_token: string; refresh_token: string; user: { id: string; name: string; email: string } }>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify({ name, email, password, company }) },
    false
  );
}

export async function apiLogin(email: string, password: string) {
  return request<{ access_token: string; refresh_token: string; user: { id: string; name: string; email: string } }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
}

export async function apiGetMe() {
  return request<{ id: string; name: string; email: string; company: string | null }>(
    "/api/auth/me"
  );
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export async function apiCreateJob(data: Record<string, string | undefined>) {
  return request<{ id: string; title: string }>(
    "/api/jobs",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function apiListJobs() {
  return request<Array<{ id: string; title: string; status: string; candidate_count: number }>>(
    "/api/jobs"
  );
}

// ── Upload ───────────────────────────────────────────────────────────────────

export async function apiUploadResume(
  file: File,
  jobId?: string,
  githubUrl?: string,
  linkedinUrl?: string
) {
  const form = new FormData();
  form.append("file", file);
  if (jobId) form.append("job_id", jobId);
  if (githubUrl) form.append("github_url", githubUrl);
  if (linkedinUrl) form.append("linkedin_url", linkedinUrl);

  return request<{ candidate_id: string; name: string | null; status: string; message: string }>(
    "/api/upload",
    { method: "POST", body: form }
  );
}

// ── Candidates ───────────────────────────────────────────────────────────────

export async function apiListCandidates(jobId?: string) {
  const qs = jobId ? `?job_id=${jobId}` : "";
  return request<Array<{ id: string; name: string | null; overall_score: number | null; recommendation: string | null; status: string }>>(
    `/api/candidates${qs}`
  );
}

export async function apiGetCandidate(id: string) {
  return request<Record<string, unknown>>(`/api/candidates/${id}`);
}

// ── Analytics ────────────────────────────────────────────────────────────────

export async function apiGetAnalytics() {
  return request<Record<string, unknown>>("/api/analytics/summary");
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function apiGetSettings() {
  return request<Record<string, unknown>>("/api/settings");
}

export async function apiUpdateSettings(data: Record<string, unknown>) {
  return request<Record<string, unknown>>("/api/settings", { method: "PUT", body: JSON.stringify(data) });
}
