// src/api/progress.js
import api, { getAuthToken } from "./index";

/**
 * progress API client
 * - handleRequest wraps axios promises and normalizes return values
 * - saveVideoProgress has a best-effort retry for transient/network errors
 * - other helpers return null on not-found / network errors (swallowOnError)
 */

/**
 * Execute a promise (axios request) and return res.data or null.
 * If swallowOnError === false the function will rethrow for non-404 errors.
 */
async function handleRequest(promise, swallowOnError = false) {
  try {
    const res = await promise;
    // prefer res.data when present, otherwise fallback to res
    return typeof res?.data !== "undefined" ? res.data : res;
  } catch (err) {
    const status = err?.response?.status;

    // Helpful dev logs
    if (process.env.NODE_ENV !== "production") {
      if (!err?.response) {
        console.warn("[progressApi] Network error (no response)", err?.message || err);
      } else {
        console.warn("[progressApi] request failed:", status, err?.response?.data ?? err.message);
      }
      if (status === 401) {
        console.warn(
          "[progressApi] 401 Unauthorized — request lacked valid credentials. " +
          "Check that a JWT is set (localStorage 'jwt_token') and that setAuthToken() was called after login."
        );
        try {
          const tk = getAuthToken();
          console.warn("[progressApi] current stored token:", tk ? "present" : "missing");
        } catch (_) {}
      }
    }

    // treat 404 as "not found" -> return null
    if (status === 404) return null;

    if (swallowOnError) return null;

    // rethrow for callers to handle
    throw err;
  }
}

/** safe numeric conversion */
const toNumberOrZero = (v) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Save/update video progress on server (best-effort).
 * Returns saved progress object (server response) or null if couldn't persist.
 *
 * The server is allowed to behave eventually-consistent; callers should
 * treat `null` as "couldn't persist now" (UI may remain optimistic).
 */
export async function saveVideoProgress(videoId, body = {}) {
  if (!videoId) throw new Error("videoId required");

  // Defensive: normalize numeric fields before sending
  const lastPosition = toNumberOrZero(body.lastPosition);
  const duration = toNumberOrZero(body.duration);

  // Build payload — include completed only when explicitly true.
  const payload = { lastPosition, duration };
  if (body.completed === true) payload.completed = true;

  // Try once
  try {
    return await handleRequest(api.post(`/api/progress/video/${videoId}`, payload), false);
  } catch (err) {
    const status = err?.response?.status;
    const isNetworkErr = !err?.response;
    const retryable = isNetworkErr || [502, 503, 504].includes(status);

    // If unauthorized, don't retry — return null (UI remains optimistic).
    if (status === 401) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[progressApi] saveVideoProgress 401 — token missing/invalid; progress not saved now.");
      }
      return null;
    }

    if (!retryable) {
      // non-retryable -> rethrow so caller can surface
      throw err;
    }

    // retry once after small backoff (best-effort)
    try {
      await new Promise((r) => setTimeout(r, 250));
      return await handleRequest(api.post(`/api/progress/video/${videoId}`, payload), true);
    } catch (err2) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[progressApi] retry failed:", err2?.message ?? err2);
      }
      // return null on repeated failures (UI is optimistic; background persist may be attempted)
      return null;
    }
  }
}

/**
 * Get saved progress for a single video.
 * Returns progress object or null if missing / network error.
 */
export async function getVideoProgress(videoId) {
  if (!videoId) return null;
  return await handleRequest(api.get(`/api/progress/video/${videoId}`), true);
}

/**
 * Get course-level aggregated progress (percent etc.)
 * Returns object or null on error.
 */
export async function getCourseProgress(courseId) {
  if (!courseId) return null;
  return await handleRequest(api.get(`/api/progress/course/${courseId}`), true);
}

/**
 * Get all my per-video progress entries.
 * Returns array or null on error.
 */
export async function getMyProgress() {
  return await handleRequest(api.get(`/api/progress/me`), true);
}

const progressApi = {
  saveVideoProgress,
  getVideoProgress,
  getCourseProgress,
  getMyProgress,
};

export default progressApi;
