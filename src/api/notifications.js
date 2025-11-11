// src/api/notifications.js
import api from "./index";

/**
 * 🔔 Notification API
 * Handles fetching, marking read, and real-time notifications.
 */

// src/api/notifications.js

export async function getMyNotifications() {
  const res = await api.get("/api/notifications");
  return res.data || [];
}

export async function markAsRead(id) {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await api.patch(`/api/notifications/read-all`);
  return res.data;
}

export async function sendNotification(payload) {
  const res = await api.post("/api/notifications/send", payload);
  return res.data;
}

// ✅ Fix for ESLint warning
const notificationsApi = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  sendNotification,
};

export default notificationsApi;
