import api from "./index";
import { toast } from "react-hot-toast";

/**
 * 🧠 DISCUSSION FORUM API
 * Includes question/reply handling and reporting endpoints.
 */

// 🟢 Fetch all questions for a specific course
export const getQuestionsByCourse = async (courseId) => {
  try {
    if (!courseId) throw new Error("Course ID is required");
    const res = await api.get(`/api/forum/${courseId}`);
    return res.data || [];
  } catch (error) {
    console.error("❌ Error fetching forum questions:", error);
    toast.error("Failed to load discussions. Please try again.");
    return [];
  }
};

// 🟢 Create a new question
export const createQuestion = async (courseId, questionText) => {
  try {
    if (!courseId || !questionText.trim()) {
      throw new Error("Course ID and question text are required");
    }
    const res = await api.post(`/api/forum/question`, {
      courseId,
      questionText: questionText.trim(),
    });
    toast.success("Question posted successfully 🎯");
    return res.data;
  } catch (error) {
    console.error("❌ Error creating question:", error);
    toast.error("Failed to post question. Please try again.");
    throw error;
  }
};

// 🟢 Add a reply to a question
export const addReply = async (questionId, replyText) => {
  try {
    if (!questionId || !replyText.trim()) {
      throw new Error("Question ID and reply text are required");
    }
    const res = await api.post(`/api/forum/reply`, {
      questionId,
      replyText: replyText.trim(),
    });
    toast.success("Reply added 💬");
    return res.data;
  } catch (error) {
    console.error("❌ Error adding reply:", error);
    toast.error("Failed to add reply. Please try again.");
    throw error;
  }
};

// 🆕 Report a question
export const reportForumQuestion = async (id, payload) => {
  try {
    const res = await api.post(`/api/forum/question/${id}/report`, payload);
    toast.success("Reported successfully 🚨");
    return res.data;
  } catch (error) {
    console.error("❌ Error reporting question:", error);
    toast.error("Failed to report. Please try again.");
    throw error;
  }
};

// 🆕 Report a reply
export const reportForumReply = async (id, payload) => {
  try {
    const res = await api.post(`/api/forum/reply/${id}/report`, payload);
    toast.success("Reported successfully 🚨");
    return res.data;
  } catch (error) {
    console.error("❌ Error reporting reply:", error);
    toast.error("Failed to report. Please try again.");
    throw error;
  }
};

export default {
  getQuestionsByCourse,
  createQuestion,
  addReply,
  reportForumQuestion,
  reportForumReply,
};
