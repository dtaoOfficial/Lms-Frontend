import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import api from "../../api";

/**
 * ✅ Animated number display (with optional % or suffix)
 */
function NumberAnimation({ value, suffix = "" }) {
  const count = useMotionValue(0);
  const roundedWithSuffix = useTransform(count, (latest) => {
    const fixed = value % 1 !== 0 ? 1 : 0;
    return `${latest.toFixed(fixed)}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, value || 0, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{roundedWithSuffix}</motion.span>;
}

/**
 * ✅ Leaderboard Stats Card
 * Displays total students, average progress %, and top student info.
 */
export default function LeaderboardStatsCard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await api.get("/api/leaderboard/global"); // matches backend endpoint
        if (Array.isArray(res.data)) {
          setLeaderboard(res.data);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading)
    return (
      <div className="p-4 bg-secondary border border-white/10 rounded-lg text-text-secondary">
        Loading leaderboard stats...
      </div>
    );

  const total = leaderboard.length;
  const top = leaderboard[0];
  const avgProgress =
    leaderboard.reduce((sum, e) => sum + (e.progressPercent || 0), 0) /
    (total || 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 🧠 Total Students */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4"
      >
        <p className="text-text-secondary text-sm">Total Students</p>
        <h3 className="text-2xl font-bold text-accent">
          <NumberAnimation value={total} />
        </h3>
      </motion.div>

      {/* 📈 Average Progress */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4"
      >
        <p className="text-text-secondary text-sm">Average Progress</p>
        <h3 className="text-2xl font-bold text-green-500">
          <NumberAnimation value={avgProgress} suffix="%" />
        </h3>
      </motion.div>

      {/* 🏆 Top Student */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4"
      >
        <p className="text-text-secondary text-sm">Top Student</p>
        <h3 className="text-lg font-semibold text-text-primary truncate">
          {top?.name || "N/A"}
        </h3>
        <p className="text-sm text-text-secondary truncate">
          {top?.email || ""}
        </p>
      </motion.div>
    </div>
  );
}
