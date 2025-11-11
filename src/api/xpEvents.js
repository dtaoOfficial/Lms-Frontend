// src/api/xpEvents.js
import api from "./index";

/**
 * 🎯 XP Event API
 * Handles fetching XP totals and history from backend
 */

export async function getMyXp() {
  const res = await api.get("/api/xp/me");
  return res.data;
}

export async function getUserXp(email) {
  const res = await api.get(`/api/xp/user/${email}`);
  return res.data;
}
