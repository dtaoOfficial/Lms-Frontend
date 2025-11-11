import api from "./index";

/**
 * 🏆 Leaderboard API calls
 * Supports both per-course and global leaderboards.
 */

// ✅ Course-specific leaderboard
export async function getCourseLeaderboard(courseId) {
  try {
    const res = await api.get(`/api/leaderboard/${courseId}`);
    return res.data; // { courseId, leaderboard: [...] }
  } catch (error) {
    console.error("Error fetching course leaderboard:", error);
    throw error;
  }
}

// ✅ Global leaderboard (overall student performance)
export async function getGlobalLeaderboard() {
  try {
    const res = await api.get(`/api/leaderboard/global`);
    return res.data; // [{ email, progressPercent, totalLikes, rank }]
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    throw error;
  }
}

// ✅ Gamification XP leaderboard (Admin Dashboard)
export async function getGamificationXP() {
  try {
    const res = await api.get(`/api/admin/gamification/xp`);
    return res.data; // [{ email, xp, level, badge, rank }]
  } catch (error) {
    console.error("Error fetching gamification XP data:", error);
    throw error;
  }
}

// ✅ Exam leaderboard (marks/percentage-based)
export async function getExamLeaderboard(examId) {
  try {
    const res = await api.get(`/api/leaderboard/exam/${examId}`);
    return res.data; // { examId, entries: [...] }
  } catch (error) {
    console.error("Error fetching exam leaderboard:", error);
    throw error;
  }
}

// ✅ Get all available exams for the logged-in student
export async function getStudentExams() {
  try {
    const res = await api.get("/api/student/exams");
    return res.data; // [{ id, name, language, duration, studentStatus, ... }]
  } catch (error) {
    console.error("Error fetching student exams:", error);
    throw error;
  }
}

// ✅ Export all functions
const leaderboardApi = {
  getCourseLeaderboard,
  getGlobalLeaderboard,
  getGamificationXP,
  getExamLeaderboard,
  getStudentExams, // ✅ added
};

export default leaderboardApi;
