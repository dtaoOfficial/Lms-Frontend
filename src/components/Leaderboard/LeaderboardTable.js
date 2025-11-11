import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🏆 LeaderboardTable Component
 * Supports GLOBAL (XP) and EXAM (Score %) modes
 * Props:
 * - data { entries }
 * - startRank
 * - loading
 * - mode ("GLOBAL" | "EXAM")
 */
export default function LeaderboardTable({
  data,
  startRank = 1,
  loading,
  mode = "GLOBAL",
}) {
  const leaderboard = data?.entries || [];

  if (loading) {
    return (
      <div className="p-6 bg-secondary rounded-xl shadow text-center text-text-secondary border border-white/10">
        Loading...
      </div>
    );
  }

  if (!leaderboard.length) {
    return (
      <div className="p-6 bg-secondary rounded-xl shadow text-center text-text-secondary border border-white/10">
        No leaderboard data available 📊
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-secondary rounded-xl shadow-lg border border-white/10">
      <table className="min-w-full border-collapse rounded-xl overflow-hidden">
        <thead className="bg-background/80 backdrop-blur text-text-secondary uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left font-semibold border-b border-white/10">Rank</th>
            <th className="px-4 py-3 text-left font-semibold border-b border-white/10">Name</th>
            <th className="px-4 py-3 text-left font-semibold border-b border-white/10">Email</th>

            {/* Dynamic heading */}
            <th className="px-4 py-3 text-center font-semibold border-b border-white/10">
              {mode === "EXAM" ? "Score (%)" : "XP"}
            </th>

            {/* Extra columns for XP leaderboard only */}
            {mode !== "EXAM" && (
              <>
                <th className="px-4 py-3 text-center font-semibold border-b border-white/10">
                  Badge 🏅
                </th>
                <th className="px-4 py-3 text-center font-semibold border-b border-white/10">
                  Likes ❤️
                </th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          <AnimatePresence>
            {leaderboard.map((student, index) => {
              const rank = student.rank || startRank + index;
              const isEven = index % 2 === 0;

              return (
                <motion.tr
                  key={`${student.email || student.id || index}-${index}`}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`transition-all ${
                    isEven ? "bg-secondary/40" : "bg-secondary/25"
                  } hover:bg-accent/10 hover:shadow-lg`}
                >
                  <td className="px-4 py-2 text-text-primary font-medium rounded-l-lg">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </td>

                  <td className="px-4 py-2 text-text-primary">{student.name || "Unknown"}</td>

                  <td className="px-4 py-2 text-text-secondary text-sm">
                    {student.email || "—"}
                  </td>

                  {/* Dynamic Score or XP */}
                  <td
                    className={`px-4 py-2 text-center font-semibold ${
                      mode === "EXAM" ? "text-green-400" : "text-purple-400"
                    }`}
                  >
                    {mode === "EXAM"
                      ? `${(student.progressPercent ?? 0).toFixed(1)}%`
                      : student.xp ?? 0}
                  </td>

                  {/* Extra XP columns */}
                  {mode !== "EXAM" && (
                    <>
                      <td className="px-4 py-2 text-center text-text-secondary">
                        {student.badge ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-lg">{student.badge}</span>
                          </span>
                        ) : (
                          <span className="text-text-secondary/60">—</span>
                        )}
                      </td>

                      <td className="px-4 py-2 text-center text-red-400 font-semibold rounded-r-lg">
                        {student.totalLikes ?? 0}
                      </td>
                    </>
                  )}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
