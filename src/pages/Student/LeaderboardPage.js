import React, { useEffect, useState } from "react";
import {
  getGlobalLeaderboard,
  getExamLeaderboard,
  getStudentExams,
} from "../../api/leaderboard";
import LeaderboardTable from "../../components/Leaderboard/LeaderboardTable";

import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
import { Trophy, Award, Medal } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// 🥇 Podium Card for top 3 ranks (kept same)
const PodiumCard = ({ user, rank, color, icon, isFirst = false, mode = "GLOBAL" }) => {
  if (!user) {
    return (
      <motion.div
        variants={itemVariants}
        className={`relative bg-secondary/50 rounded-lg p-6 text-center border border-dashed border-white/10 ${
          isFirst ? "md:scale-110 md:-translate-y-4 z-10" : "md:scale-95"
        } transition-all flex items-center justify-center`}
      >
        <p className="text-text-secondary">Rank #{rank}</p>
      </motion.div>
    );
  }

  const displayValue =
    mode === "EXAM" ? `${(user.progressPercent ?? 0).toFixed(1)}%` : `${user.xp ?? 0} XP`;
  const textColor = mode === "EXAM" ? "text-green-400" : color.replace("bg-", "text-");

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative bg-secondary rounded-lg shadow-lg p-6 text-center border border-white/10 ${
        isFirst ? "md:scale-110 md:-translate-y-4 z-10" : "md:scale-95"
      } transition-all`}
    >
      <div
        className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shadow-md`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-primary mt-6 truncate">{user.name}</p>
      <p className="text-sm text-text-secondary truncate">{user.email}</p>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{displayValue}</p>
      <p className="text-xs text-text-secondary mt-1">Rank #{rank}</p>
    </motion.div>
  );
};

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("GLOBAL");
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  // Load student exams once
  useEffect(() => {
    async function loadExams() {
      try {
        const res = await getStudentExams();
        setExams(res || []);
      } catch (err) {
        console.error("Failed to load exams:", err);
        setExams([]);
      }
    }
    loadExams();
  }, []);

  // Auto-fetch leaderboard on mode or exam change
  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedExam]);

  // Fetch leaderboard (XP / Exam)
  async function fetchLeaderboard() {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (mode === "GLOBAL") {
        res = await getGlobalLeaderboard();
      } else if (mode === "EXAM" && selectedExam) {
        res = await getExamLeaderboard(selectedExam);
      } else {
        res = { entries: [] };
      }
      setData(res);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
      setError("Unable to load leaderboard data.");
      setData({ entries: [] });
    } finally {
      setLoading(false);
    }
  }

  const entries = data?.entries || [];
  const topThree = [entries[0], entries[1], entries[2]];
  const restOfUsers = entries.slice(3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-6 text-text-primary">
        {mode === "GLOBAL" ? "⚡ XP Leaderboard" : "🧠 Exam Leaderboard"}
      </motion.h1>

      {/* Dropdown Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-3 mb-6 bg-secondary/20 p-3 rounded-lg border border-white/10"
      >
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border border-white/10 px-3 py-2 rounded-md text-sm bg-background text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
        >
          <option value="GLOBAL">⚡ XP Score</option>
          <option value="EXAM">🧠 Exam Score</option>
        </select>

        {mode === "EXAM" && (
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="border border-white/10 px-3 py-2 rounded-md text-sm bg-background text-text-primary w-64 focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <option value="">Select Exam</option>
            {[...new Map(exams.map(ex => [ex.id || ex._id, ex])).values()]
              .sort((a, b) => a.name?.localeCompare(b.name))
              .map((exam) => (
                <option key={exam.id || exam._id} value={exam.id || exam._id}>
                  {exam.name || `Exam (${exam.language || "N/A"})`}
                </option>
              ))}
          </select>
        )}

        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:scale-105 transition-transform shadow-md"
        >
          Load
        </button>
      </motion.div>

      {loading && (
        <motion.div
          variants={itemVariants}
          className="text-text-secondary bg-secondary p-4 rounded-lg shadow-sm mb-4 border border-white/10"
        >
          Loading leaderboard...
        </motion.div>
      )}

      {error && (
        <motion.div
          variants={itemVariants}
          className="text-red-600 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {!loading && !error && (
        <>
          {/* 🥇 Podium (kept same) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <PodiumCard
              user={topThree[1]}
              rank={2}
              color="bg-gray-400"
              icon={<Medal size={24} />}
              mode={mode}
            />
            <PodiumCard
              user={topThree[0]}
              rank={1}
              color="bg-yellow-500"
              icon={<Trophy size={28} />}
              isFirst
              mode={mode}
            />
            <PodiumCard
              user={topThree[2]}
              rank={3}
              color="bg-yellow-700"
              icon={<Award size={24} />}
              mode={mode}
            />
          </motion.div>

          {/* 📋 Leaderboard Table (rest users) */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <LeaderboardTable
                data={{ ...data, entries: restOfUsers }}
                startRank={4}
                loading={loading}
                mode={mode}
              />
            </ScrollAnimation>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
