import api from "./index";

/**
 * 🎓 STUDENT EXAMS API (Frontend ↔ Backend Sync)
 * Backend Controller: StudentExamController.java
 *
 * ✅ Endpoints (confirmed)
 *  - GET    /api/student/exams                 → getAvailableExams()
 *  - POST   /api/student/exams/{examId}/start  → startExam()
 *  - GET    /api/student/exams/{examId}/questions → getExamQuestions()
 *  - POST   /api/student/exams/{examId}/submit → submitExam()
 *  - GET    /api/student/exams/{examId}/result → getExamResult()
 */

// ==============================
// 1️⃣ Get available exams list
// ==============================
export async function getAvailableExams() {
  const res = await api.get("/api/student/exams");
  return res.data;
}

// ==============================
// 2️⃣ Start an exam
// ==============================
export async function startExam(examId) {
  const res = await api.post(`/api/student/exams/${examId}/start`);
  return res.data;
}

// ==============================
// 3️⃣ Get exam questions (after start)
// ==============================
export async function getExamQuestions(examId) {
  const res = await api.get(`/api/student/exams/${examId}/questions`);
  return res.data;
}

// ==============================
// 4️⃣ Submit exam answers
// ==============================
export async function submitExam(examId, payload) {
  const res = await api.post(`/api/student/exams/${examId}/submit`, payload);
  return res.data;
}

// ==============================
// 5️⃣ Get exam result (after submission)
// ==============================
export async function getExamResult(examId) {
  const res = await api.get(`/api/student/exams/${examId}/result`);
  return res.data;
}

export default {
  getAvailableExams,
  startExam,
  getExamQuestions,
  submitExam,
  getExamResult,
};
