import React, { useEffect } from "react";
// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
// -------------------

// --- NEW: Animation Component for Numbers ---
function NumberAnimation({ value, suffix = "" }) {
  const count = useMotionValue(0);
  // Use useTransform to format the number with suffix
  const roundedWithSuffix = useTransform(count, (latest) => {
    // Check if value is a float (like avgProgress)
    const fixed = value % 1 !== 0 ? 1 : 0;
    return `${latest.toFixed(fixed)}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{roundedWithSuffix}</motion.span>;
}

export default function LeaderboardStatsCard({ leaderboard = [], loading }) {
  if (loading) return null;

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const total = leaderboard.length;
  const top = leaderboard[0];
  const avgProgress =
    leaderboard.reduce((sum, e) => sum + (e.progressPercent || 0), 0) /
    (total || 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4" // <-- DARK MODE FIX
      >
        <p className="text-text-secondary text-sm">Total Students</p> {/* <-- DARK MODE FIX */}
        <h3 className="text-2xl font-bold text-accent"> {/* <-- DARK MODE FIX */}
          <NumberAnimation value={total} />
        </h3>
      </motion.div>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4" // <-- DARK MODE FIX
      >
        <p className="text-text-secondary text-sm">Average Progress</p> {/* <-- DARK MODE FIX */}
        <h3 className="text-2xl font-bold text-green-500">
          <NumberAnimation value={avgProgress} suffix="%" />
        </h3>
      </motion.div>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-lg p-4" // <-- DARK MODE FIX
      >
        <p className="text-text-secondary text-sm">Top Student</p> {/* <-- DARK MODE FIX */}
        <h3 className="text-lg font-semibold text-text-primary truncate"> {/* <-- DARK MODE FIX + truncate */}
          {top?.name || "N/A"}
        </h3>
        <p className="text-sm text-text-secondary truncate">{top?.email || ""}</p> {/* <-- DARK MODE FIX + truncate */}
      </motion.div>
    </div>
  );
}