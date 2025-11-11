import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LeaderboardTableAdmin({ data = [], loading, mode = "GLOBAL" }) {
  const navigate = useNavigate();

  if (loading)
    return <p className="text-center text-text-secondary py-6">Loading...</p>;

  if (!data || data.length === 0)
    return (
      <p className="text-center text-text-secondary py-6">
        No leaderboard data found.
      </p>
    );

  return (
    <div className="bg-secondary border border-white/10 rounded-lg shadow-sm overflow-x-auto mt-6">
      <table className="min-w-full text-sm">
        <thead className="bg-background border-b border-white/10 text-text-secondary">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Rank</th>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">
              {mode === "EXAM" ? "Score (%)" : "Progress %"}
            </th>
            {mode !== "EXAM" && (
              <th className="px-4 py-3 text-left font-semibold">Likes</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          <AnimatePresence>
            {data.map((entry, idx) => (
              <motion.tr
                key={entry.email || idx}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-white/10 hover:bg-white/5 transition cursor-pointer"
                // ✅ Fixed: navigate using email instead of ID
                onClick={() => navigate(`/admin/students/${entry.email}`)}
              >
                <td className="px-4 py-2 font-semibold text-accent">
                  {entry.rank ? `#${entry.rank}` : `#${idx + 1}`}
                </td>
                <td className="px-4 py-2 text-text-primary">{entry.name}</td>
                <td className="px-4 py-2 text-text-secondary">{entry.email}</td>
                <td
                  className={`px-4 py-2 ${
                    mode === "EXAM" ? "text-green-400" : "text-text-secondary"
                  }`}
                >
                  {entry.progressPercent
                    ? `${entry.progressPercent.toFixed(1)}%`
                    : "0%"}
                </td>
                {mode !== "EXAM" && (
                  <td className="px-4 py-2 text-text-secondary">
                    {entry.totalLikes ?? 0}
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
