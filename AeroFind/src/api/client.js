const BASE_URL = "http://localhost:8000/api";

// ─── TOKEN HELPERS ────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("aerofind_access_token");
}

export function setTokens(access, refresh) {
  localStorage.setItem("aerofind_access_token", access);
  localStorage.setItem("aerofind_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("aerofind_access_token");
  localStorage.removeItem("aerofind_refresh_token");
}

export function getRefreshToken() {
  return localStorage.getItem("aerofind_refresh_token");
}

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────
async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/users/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  localStorage.setItem("aerofind_access_token", data.access);
  return data.access;
}

// ─── CORE REQUEST FUNCTION ────────────────────────────────────
// Automatically attaches JWT, refreshes if expired, throws on errors
export async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // token expired — try refreshing once
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } catch {
      clearTokens();
      window.location.href = "/login";
      return;
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw error;
  }

  // 204 No Content has no body
  if (res.status === 204) return null;

  return res.json();
}

// ─── CONVENIENCE METHODS ──────────────────────────────────────
export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
