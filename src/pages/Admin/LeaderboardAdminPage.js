import React, { useEffect, useState } from "react";
import {
  getAdminExamLeaderboard,
  resetLeaderboard,
} from "../../api/admin";
import { getPublishedExams } from "../../api/exams";
import LeaderboardTableAdmin from "../../components/Admin/LeaderboardTableAdmin";
import LeaderboardStatsCard from "../../components/Admin/LeaderboardStatsCard";
import ResetLeaderboardModal from "../../components/Admin/ResetLeaderboardModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LeaderboardAdminPage() {
  const [data, setData] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch exams list (published only)
  const fetchExams = async () => {
    try {
      const res = await getPublishedExams();
      setExams(res || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
      setExams([]);
    }
  };

  // ✅ Fetch leaderboard data for selected exam
  const fetchLeaderboard = async () => {
    if (!selectedExam) return;
    try {
      setLoading(true);
      setRefreshing(true);
      const res = await getAdminExamLeaderboard(selectedExam);
      setData(res.entries || []);
    } catch (err) {
      console.error("Failed to load exam leaderboard:", err);
      toast.error("Failed to load exam leaderboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) fetchLeaderboard();
  }, [selectedExam]);

  const handleResetConfirm = async (note) => {
    try {
      await resetLeaderboard({ scope: "EXAM", note });
      toast.success("Exam leaderboard reset successfully 🚀");
      setShowResetModal(false);
      fetchLeaderboard();
    } catch (err) {
      toast.error("Reset failed. Try again.");
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-between items-center mb-5 gap-3"
      >
        <h1 className="text-2xl font-bold text-text-primary">
          🧠 Exam Leaderboard Management
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* ✅ Only one dropdown now — Select Exam */}
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="border border-white/10 px-3 py-2 rounded-md text-sm bg-background text-text-primary focus:ring-2 focus:ring-accent w-64"
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id || exam._id} value={exam.id || exam._id}>
                {exam.title || exam.name || "Untitled Exam"}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLeaderboard}
            disabled={!selectedExam || refreshing}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-60 transition-colors"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            disabled={!selectedExam}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            Reset
          </button>

          <button
            onClick={() => navigate("/admin/leaderboard/audit")}
            className="px-4 py-2 bg-secondary text-text-primary rounded-md hover:bg-white/10 border border-white/10 transition-colors"
          >
            View Audit Logs 📜
          </button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <LeaderboardStatsCard leaderboard={data} loading={loading} />
        </ScrollAnimation>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <LeaderboardTableAdmin data={data} loading={loading} />
        </ScrollAnimation>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <ResetLeaderboardModal
            scope="EXAM"
            onClose={() => setShowResetModal(false)}
            onConfirm={handleResetConfirm}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
