// src/api/actions.js
import api from "./index";

/**
 * Helper to attach Authorization from localStorage (defensive).
 * Axios instance already sets default header, but some flows (dev reload) lose it.
 */
function authHeaders() {
  const h = { "Content-Type": "application/json" };
  try {
    const t = localStorage.getItem("jwt_token");
    if (t) h.Authorization = `Bearer ${t}`;
  } catch (e) {
    // ignore
  }
  return h;
}

async function handlePost(url, body = undefined) {
  try {
    const resp = await api.post(url, body ?? {}, { headers: authHeaders() });
    // debug log (dev only)
    // console.debug("[API POST]", url, body, "->", resp.status, resp.data);
    return resp;
  } catch (err) {
    // helpful debug logging
    console.error("[API POST ERROR]", url, err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
}

async function handleGet(url, params = {}) {
  try {
    const resp = await api.get(url, { params, headers: authHeaders() });
    // console.debug("[API GET]", url, params, "->", resp.status, resp.data);
    return resp;
  } catch (err) {
    console.error("[API GET ERROR]", url, err?.response?.status, err?.response?.data || err.message);
    throw err;
  }
}

const actions = {
  // Courses
  toggleCourseLike: (courseId) => handlePost(`/api/courses/${courseId}/like`).then(r => r.data),
  toggleCourseDislike: (courseId) => handlePost(`/api/courses/${courseId}/dislike`).then(r => r.data),
  postCourseComment: (courseId, text) => handlePost(`/api/courses/${courseId}/comment`, { text }).then(r => r.data),
  getCourseComments: (courseId, page = 0, size = 20) => handleGet(`/api/courses/${courseId}/comments`, { page, size }).then(r => r.data),
  postCourseReport: (courseId, reason, text) => handlePost(`/api/courses/${courseId}/report`, { reason, text }).then(r => r.data),

  // Videos
  toggleVideoLike: (videoId) => handlePost(`/api/videos/${videoId}/like`).then(r => r.data),
  toggleVideoDislike: (videoId) => handlePost(`/api/videos/${videoId}/dislike`).then(r => r.data),
  postVideoComment: (videoId, text) => handlePost(`/api/videos/${videoId}/comment`, { text }).then(r => r.data),
  getVideoComments: (videoId, page = 0, size = 20) => handleGet(`/api/videos/${videoId}/comments`, { page, size }).then(r => r.data),
  postVideoReport: (videoId, reason, text) => handlePost(`/api/videos/${videoId}/report`, { reason, text }).then(r => r.data),
};

export default actions;
