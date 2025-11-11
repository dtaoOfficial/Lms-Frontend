// src/api/emailApi.js
import api from "./index";

/**
 * Admin Email Broadcast API
 * Handles sending broadcast emails and retrieving history.
 */

const emailApi = {
  sendEmail: (payload) => api.post("/api/admin/email/send", payload),
  getEmailHistory: () => api.get("/api/admin/email/history"),
  deleteEmail: (id) => api.delete(`/api/admin/email/${id}`),
};

export default emailApi;
