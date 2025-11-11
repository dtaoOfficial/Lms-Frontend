import api from "./index";

// =======================
// ADMIN DASHBOARD APIs
// =======================

export async function getAdminStats() {
  const res = await api.get("/api/admin/stats");
  return res.data;
}

export async function getEnrollmentAnalytics() {
  const res = await api.get("/api/admin/analytics/enrollments");
  return res.data;
}

export async function getCourseEngagement() {
  const res = await api.get("/api/admin/analytics/course-engagement");
  return res.data;
}

export async function getStudentProgressAnalytics() {
  const res = await api.get("/api/admin/analytics/student-progress");
  return res.data;
}
// =======================
// ADMIN FORUM MODERATION APIs
// =======================

export async function getForumReports(params = {}) {
  const res = await api.get("/api/admin/forum/reports", { params });
  return res.data;
}

export async function updateForumReportStatus(id, payload) {
  const res = await api.patch(`/api/admin/forum/report/${id}/status`, payload);
  return res.data;
}

export async function deleteForumReport(id) {
  const res = await api.delete(`/api/admin/forum/report/${id}`);
  return res.data;
}

export async function getAdminReports(params = {}) {
  const res = await api.get("/api/admin/reports", { params });
  return res.data;
}

export async function updateAdminReportStatus(id, { status, note }) {
  const res = await api.put(`/api/admin/reports/${id}?status=${status}&note=${note}`);
  return res.data;
}

export async function deleteAdminReport(id) {
  const res = await api.delete(`/api/admin/reports/${id}`);
  return res.data;
}

export async function getAdminGlobalLeaderboard() {
  const res = await api.get("/api/admin/leaderboard/global");
  return res.data;
}

// Get leaderboard for a specific course
export async function getAdminCourseLeaderboard(courseId) {
  const res = await api.get(`/api/admin/leaderboard/course/${courseId}`);
  return res.data;
}

// Reset leaderboard (admin only)
export async function resetLeaderboard(payload = {}) {
  const res = await api.post("/api/admin/leaderboard/reset", payload);
  return res.data;
}

// Get top global students
export async function getTopGlobalStudents(limit = 10) {
  const res = await api.get(`/api/admin/leaderboard/top/${limit}`);
  return res.data;
}

// =======================
// ADMIN LEADERBOARD AUDIT APIs
// =======================

export async function getLeaderboardAuditLogs() {
  const res = await api.get("/api/admin/leaderboard/audit");
  return res.data;
}

// =======================
// NEW: Admin Exam Leaderboard API
// =======================

// ✅ Get leaderboard for a specific exam (marks-based)
export async function getAdminExamLeaderboard(examId) {
  const res = await api.get(`/api/admin/leaderboard/exam/${examId}`);
  return res.data; // { examId, entries: [...] }
}

export default {
  getAdminStats,
  getEnrollmentAnalytics,
  getCourseEngagement,
  getStudentProgressAnalytics,
  getForumReports,
  updateForumReportStatus,
  deleteForumReport,
  getAdminReports,
  updateAdminReportStatus,
  deleteAdminReport,
  getAdminGlobalLeaderboard,
  getAdminCourseLeaderboard,
  resetLeaderboard,
  getTopGlobalStudents,
  getLeaderboardAuditLogs,
  getAdminExamLeaderboard, // ✅ exported
};
