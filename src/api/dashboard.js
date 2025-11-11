import api from "./index";

/**
 * 🎓 Student Dashboard API
 * Fetches progress, certificates, etc. from backend.
 */
export const getStudentDashboardStats = async () => {
  try {
    const response = await api.get("/api/student/dashboard");
    // Return only the main stats (without XP, Level, Badge)
    // Example expected response: { totalCourses, completedVideos, averageProgress, totalCertificates, recentVideos }
    return response.data;
  } catch (error) {
    console.error("[Dashboard API] Error fetching student dashboard:", error);
    throw error;
  }
};
