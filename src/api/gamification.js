// src/api/gamification.js
import api from "./index";
import toast from "react-hot-toast";

/**
 * 🎮 Gamification API
 * Handles XP, Levels, and Badges management
 */
const gamificationApi = {
  /**
   * 🔹 Get global XP leaderboard (for admin / student leaderboard)
   */
  async getLeaderboard() {
    try {
      const res = await api.get("/api/leaderboard/xp");
      return res.data || [];
    } catch (err) {
      console.error("[gamificationApi] getLeaderboard error:", err);
      return [];
    }
  },

  /**
   * 🔹 Get individual student XP summary
   */
  async getMyXP() {
    try {
      const res = await api.get("/api/gamification/me");
      return res.data || { xp: 0, level: 1, badge: "New Learner 🐣" };
    } catch (err) {
      console.error("[gamificationApi] getMyXP error:", err);
      return { xp: 0, level: 1, badge: "New Learner 🐣" };
    }
  },

  /**
   * 🔹 Manually adjust XP (Admin use)
   * @param {string} email - user email
   * @param {number} amount - XP points to add or remove
   */
  async adjustXP(email, amount) {
    try {
      const res = await api.post("/api/gamification/adjust", { email, amount });
      toast.success(`XP updated for ${email}: ${amount > 0 ? "+" : ""}${amount} XP`);
      return res.data;
    } catch (err) {
      console.error("[gamificationApi] adjustXP error:", err);
      toast.error("Failed to adjust XP");
      throw err;
    }
  },

  /**
   * 🔹 Reset XP (Admin use)
   */
  async resetXP(email) {
    try {
      const res = await api.post("/api/gamification/reset", { email });
      toast.success(`XP reset for ${email}`);
      return res.data;
    } catch (err) {
      console.error("[gamificationApi] resetXP error:", err);
      toast.error("Failed to reset XP");
      throw err;
    }
  },
};

export default gamificationApi;
