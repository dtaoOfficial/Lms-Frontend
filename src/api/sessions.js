// src/api/sessions.js
import api from "./index";

const base = "/api/sessions";

/**
 * startSession(body) -> { sessionId, ...session }
 * body optional: { meta: {...} }
 */
export async function startSession(body = {}) {
  const r = await api.post(base, body);
  return r.data;
}

export async function endSession(sessionId) {
  const r = await api.post(`${base}/${sessionId}/end`);
  return r.data;
}

export async function touchSession(sessionId) {
  const r = await api.post(`${base}/${sessionId}/touch`);
  return r.data;
}

export async function updateSessionMeta(sessionId, meta = {}, replace = false) {
  const r = await api.patch(`${base}/${sessionId}/meta`, { meta, replace });
  return r.data;
}

export async function listActiveSessions() {
  const r = await api.get(`${base}/active`);
  return r.data;
}

export default { startSession, endSession, touchSession, updateSessionMeta, listActiveSessions };
