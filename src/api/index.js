// src/api/index.js
import axios from "axios";
import forumApi from "./forum"; // 🧩 Forum API module
import leaderboardApi from "./leaderboard"; // 🏆 New Leaderboard API module
import settingsApi from "./settingsApi"; // ⚙️ Admin System Settings API
import emailApi from "./emailApi"; // 📧 Admin Email Broadcast API
import * as dashboardApi from "./dashboard";
import * as notificationsApi from "./notifications";

/**
 * Axios API instance
 * - withCredentials enabled (for cookie-backed refresh flows)
 * - JWT bearer support (via Authorization header)
 * - Automatic token refresh on 401 with queueing
 *
 * Defensive improvements:
 * - tolerant header checks (Authorization vs authorization)
 * - exports getAuthToken for debugging/tests
 * - small console warnings to aid debugging (non-prod)
 */

// NOTE: Using process.env.REACT_APP_API_URL (CRA) — safest for your current Babel setup.
// If you use Vite and want import.meta.env, I can provide that variant separately.
const resolvedBaseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true, // ✅ enable cookies for refresh token
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- Token helpers ---------------- */
const STORAGE_KEY = "jwt_token";

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      api.defaults.headers.common = api.defaults.headers.common || {};
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      if (api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common.Authorization;
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.warn("setAuthToken storage error", e);
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// initialize header from storage (best-effort)
try {
  if (typeof window !== "undefined") {
    const t = getAuthToken();
    if (t) {
      api.defaults.headers.common = api.defaults.headers.common || {};
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    }
  }
} catch (e) {
  /* ignore */
}

/* ---------------- Refresh handling & queue ---------------- */
let isRefreshing = false;
let refreshQueue = [];

function enqueueRetry(cb) {
  refreshQueue.push(cb);
}

function resolveQueue(err, token = null) {
  refreshQueue.forEach((cb) => {
    try {
      cb(err, token);
    } catch (_) {}
  });
  refreshQueue = [];
}

/* ---------------- UPDATED refreshAccess (safer) ---------------- */
export async function refreshAccess() {
  try {
    // ✅ ensure refresh request includes cookies
    const resp = await api.post("/api/auth/refresh", null, { withCredentials: true });
    const newToken =
      resp?.data?.accessToken ||
      resp?.data?.token ||
      resp?.data?.access_token ||
      null;

    if (newToken) {
      setAuthToken(newToken);
      return newToken;
    }

    console.warn("[auth] Refresh returned no new token — keeping current one.");
    return getAuthToken(); // ✅ keep old token if refresh failed
  } catch (err) {
    console.warn("[auth] Refresh request failed — preserving existing token.");
    return getAuthToken(); // ✅ never clear token here
  }
}

function isAuthEndpoint(url = "") {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("/api/auth/login") ||
    u.includes("/api/auth/register") ||
    u.includes("/api/auth/verify-email") ||
    u.includes("/api/auth/resend-otp") ||
    u.includes("/api/auth/logout") ||
    u.includes("/api/auth/refresh")
  );
}

/* ---------------- Request interception ---------------- */
/*
  Guaranteed-safe request interceptor:
  - reads token from localStorage for freshest value on every request
  - tolerant header checks
*/
api.interceptors.request.use(
  (cfg) => {
    try {
      if (typeof window !== "undefined") {
        // Read directly from localStorage to ensure fresh token (handles runtime updates)
        const token = localStorage.getItem(STORAGE_KEY);
        cfg.headers = cfg.headers || {};
        const hasAuth =
          cfg.headers.Authorization ||
          cfg.headers.authorization ||
          (cfg.headers.common &&
            (cfg.headers.common.Authorization || cfg.headers.common.authorization));
        if (token && !hasAuth) {
          cfg.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production")
        console.warn("request interceptor error", e);
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

/* ---------------- Response interception & refresh flow ---------------- */
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    try {
      const original = error?.config;
      if (!error?.response || error.response.status !== 401)
        return Promise.reject(error);

      const origUrl = original?.url || "";
      if (origUrl && isAuthEndpoint(origUrl)) {
        if (origUrl.toLowerCase().includes("/api/auth/refresh")) {
          setAuthToken(null);
        }
        return Promise.reject(error);
      }

      if (!original) {
        setAuthToken(null);
        return Promise.reject(error);
      }

      if (original._retry) {
        setAuthToken(null);
        return Promise.reject(error);
      }
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueueRetry(async (err, token) => {
            if (err || !token) return reject(error);
            try {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
              const res = await api.request(original);
              resolve(res);
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        // ✅ ensure refresh request includes cookies
        const r = await api.post("/api/auth/refresh", null, { withCredentials: true });
        const newToken =
          r?.data?.accessToken ||
          r?.data?.token ||
          r?.data?.access_token ||
          null;

        if (!newToken) {
          setAuthToken(null);
          resolveQueue(new Error("no_token_after_refresh"), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        setAuthToken(newToken);
        resolveQueue(null, newToken);
        isRefreshing = false;

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      } catch (err) {
        isRefreshing = false;
        setAuthToken(null);
        resolveQueue(err, null);
        return Promise.reject(err);
      }
    } catch (outerErr) {
      try {
        setAuthToken(null);
      } catch (_) {}
      return Promise.reject(error);
    }
  }
);

if (process.env.NODE_ENV !== "production") {
  api.interceptors.response.use(
    (resp) => resp,
    (err) => {
      try {
        if (err?.response?.status === 401) {
          const url = err?.config?.url || "(unknown)";
          if (url && url.includes("/api/progress")) {
            console.warn(
              "[api] 401 on progress endpoint — auth token missing or invalid:",
              url
            );
          }
        }
      } catch (_) {}
      return Promise.reject(err);
    }
  );
}

/* ---------------- API convenience exports ---------------- */

// AUTH
export function login(payload) {
  return api.post("/api/auth/login", payload);
}
export function registerUser(payload) {
  return api.post("/api/auth/register", payload);
}
export function verifyEmail(payload) {
  return api.post("/api/auth/verify-email", payload);
}
export function resendOtp(payload) {
  return api.post("/api/auth/resend-otp", payload);
}
export function logout(payload) {
  return api.post("/api/auth/logout", payload);
}
export function refresh(payload) {
  // keep convenience wrapper; callers can pass payload if desired
  return api.post("/api/auth/refresh", payload);
}

// USERS
export function getCurrentUser() {
  return api.get("/api/users/me");
}
export function updateProfile(payload) {
  return api.put("/api/users/update-profile", payload);
}
export function changePassword(payload) {
  return api.post("/api/users/change-password", payload);
}

// ADMIN
export function getAllUsers(params = {}) {
  return api.get("/api/users", { params });
}
export function createUser(payload) {
  return api.post("/api/users", payload);
}
export function updateUser(id, payload) {
  return api.put(`/api/users/${id}`, payload);
}
export function deleteUser(id) {
  return api.delete(`/api/users/${id}`);
}

// CERTIFICATES
export function generateCertificate(payload) {
  return api.post("/api/certificates/generate", payload);
}
export function getMyCertificates(params = {}) {
  return api.get("/api/certificates/me", { params });
}

/* 🧠 FORUM & LEADERBOARD INTEGRATIONS ---------------- */
export const forum = forumApi; // available globally under api.forum
export const leaderboard = leaderboardApi; // available globally under api.leaderboard

/* ---------------- Final safety interceptor ---------------- */
// ✅ Final global guard: ensure Authorization header is always applied
// Moved to bottom so it applies after any refresh/token updates above
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.warn("final auth interceptor error", e);
  }
  return cfg;
});

/* ---------------- Default Export ---------------- */
export const settings = settingsApi; // available globally under api.settings
export const email = emailApi; // available globally under api.email
export const dashboard = dashboardApi;
export const notifications = notificationsApi; // available globally as api.notifications

export default api;
