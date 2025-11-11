// src/api/settingsApi.js
import api from "./index";

/**
 * SYSTEM SETTINGS API MODULE
 * Admin-only endpoints for managing global platform settings
 */

const settingsApi = {
  getSettings: () => api.get("/api/admin/settings"),

  updateSettings: (payload) =>
    api.patch("/api/admin/settings/update", payload),

  resetSettings: () => api.post("/api/admin/settings/reset"),
};

export default settingsApi;
