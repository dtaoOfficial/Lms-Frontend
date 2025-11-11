import api from "./index"; // axios instance with baseURL + JWT interceptors

/**
 * 👤 USER API — Profile & Account Management
 * 
 * Supports:
 *  - Student profile management (via /api/student/...)
 *  - Admin user management (via /api/users/...)
 *  - Password changes
 *  - Authenticated user details (/me)
 */

// ==========================
// 🧩 STUDENT SECTION
// ==========================

// ✅ Get logged-in student's profile
export async function getProfile() {
  const res = await api.get("/api/student/profile");
  return res.data;
}

// ✅ Update logged-in student's profile (name, phone, dept, about)
export async function updateProfile(data) {
  const res = await api.patch("/api/student/profile", data);
  return res.data;
}

// ✅ Change logged-in student's password
export async function changePassword(data) {
  const res = await api.patch("/api/student/change-password", data);
  return res.data;
}

// ==========================
// 🧩 ADMIN SECTION
// ==========================

// ✅ Create new user (admin only)
export async function createUser(payload) {
  const res = await api.post("/api/users", payload);
  return res.data;
}

// ✅ Get all users (admin)
export async function getAllUsers() {
  const res = await api.get("/api/users");
  return res.data;
}

// ✅ Get user by ID (admin)
export async function getUserById(id) {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}

// ✅ Update user by ID (admin)
export async function updateUserById(id, data) {
  const res = await api.put(`/api/users/${id}`, data);
  return res.data;
}

// ✅ Delete user by ID (admin)
export async function deleteUser(id) {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
}

// ==========================
// 🧩 AUTH HELPERS
// ==========================

// ✅ Get current authenticated user info (/api/users/me)
export async function getCurrentUser() {
  const res = await api.get("/api/users/me");
  return res.data;
}
