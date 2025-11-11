import api from "./index";

/**
 * 📘 Courses API
 * Provides methods for fetching course data
 */

// ✅ Get all available courses
export async function getAllCourses() {
  try {
    const res = await api.get("/api/courses");
    return res.data || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

// ✅ Export default object
const coursesApi = {
  getAllCourses,
};

export default coursesApi;
