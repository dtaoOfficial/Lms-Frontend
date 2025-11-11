// src/api/exams.js
import api from "./index";

/**
 * =============================
 * 📘 EXAM MANAGEMENT API (ADMIN)
 * =============================
 * Base Path: /api/admin/exams
 * Requires: ROLE_ADMIN
 * Handles CRUD + CSV Upload + Publish Toggle
 */

/* ------------------ GET ALL EXAMS ------------------ */
/**
 * Fetches all exams (admin view)
 * @returns {Promise<Array>} List of all exams
 */
export async function getAllExams() {
  const res = await api.get("/api/admin/exams");
  return res.data;
}

/* ------------------ GET SINGLE EXAM ------------------ */
/**
 * Fetch single exam by ID
 * @param {string} examId
 * @returns {Promise<Object>} Exam details
 */
export async function getExamById(examId) {
  const res = await api.get(`/api/admin/exams/${examId}`);
  return res.data;
}

/* ------------------ CREATE EXAM ------------------ */
/**
 * Create a new exam
 * @param {Object} payload
 * @returns {Promise<Object>} Created exam
 */
export async function createExam(payload) {
  const res = await api.post("/api/admin/exams", payload);
  return res.data;
}

/* ------------------ UPDATE EXAM ------------------ */
/**
 * Update exam by ID
 * @param {string} examId
 * @param {Object} payload
 * @returns {Promise<Object>} Updated exam
 */
export async function updateExam(examId, payload) {
  const res = await api.put(`/api/admin/exams/${examId}`, payload);
  return res.data;
}

/* ------------------ DELETE EXAM ------------------ */
/**
 * Delete an exam by ID
 * @param {string} examId
 * @returns {Promise<void>}
 */
export async function deleteExam(examId) {
  const res = await api.delete(`/api/admin/exams/${examId}`);
  return res.data;
}

/* ------------------ TOGGLE PUBLISH ------------------ */
/**
 * Publish or unpublish exam
 * @param {string} examId
 * @param {boolean} publish
 * @returns {Promise<Object>} Updated exam
 */
export async function togglePublish(examId, publish) {
  const res = await api.patch(`/api/admin/exams/${examId}/publish`, null, {
    params: { publish },
  });
  return res.data;
}

/* ------------------ UPLOAD EXAM CSV ------------------ */
/**
 * Uploads CSV file for MCQ exams
 * @param {string} examId
 * @param {File} file
 * @returns {Promise<Object>} Exam with updated question list
 */
export async function uploadExamCSV(examId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/api/admin/exams/${examId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

/* ------------------ GET PUBLISHED EXAMS ------------------ */
/**
 * Fetches only published exams (for preview or analytics)
 * @returns {Promise<Array>}
 */
export async function getPublishedExams() {
  const res = await api.get("/api/admin/exams/published");
  return res.data;
}

/* ------------------ GET ACTIVE EXAMS ------------------ */
/**
 * Fetch currently active exams within date range
 * @returns {Promise<Array>}
 */
export async function getActiveExams() {
  const res = await api.get("/api/admin/exams/active");
  return res.data;
}

/* ------------------ EXPORT DEFAULT ------------------ */
export default {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  togglePublish,
  uploadExamCSV,
  getPublishedExams,
  getActiveExams,
};
