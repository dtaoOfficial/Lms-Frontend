import React, { useEffect, useState } from "react";
import { Trophy, RefreshCw, Zap } from "lucide-react";
import leaderboardApi from "../../api/leaderboard";
import { toast } from "react-hot-toast";

// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
// -------------------

// --- NEW: Animation Component for Numbers ---
function NumberAnimation({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child fades in 0.1s after the last
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
// ---------------------------------------------


/**
 * 🧩 Admin Gamification Dashboard
 * Shows XP statistics, top students, and level progress.
 */
export default function AdminGamificationPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalXP: 0,
    topXP: 0,
    avgXP: 0,
    topStudent: "-",
  });

  // ===============================
  // Fetch leaderboard / XP data (UNCHANGED)
  // ===============================
  const loadXPData = async () => {
    try {
      setLoading(true);
      const res = await leaderboardApi.getGamificationXP();
      if (!Array.isArray(res)) return;

      setData(res);

      if (res.length > 0) {
        const totalXP = res.reduce((sum, s) => sum + (s.xp || 0), 0);
        const top = res[0];
        setStats({
          totalXP,
          topXP: top.xp || 0,
          avgXP: Math.round(totalXP / res.length),
          topStudent: top.email || "N/A",
        });
      }
    } catch (err) {
      console.error("[AdminGamification] Failed:", err);
      toast.error("Failed to load XP data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadXPData();
  }, []);

  // ===============================
  // Refresh handler (UNCHANGED)
  // ===============================
  const handleRefresh = () => {
    toast.loading("Refreshing XP leaderboard...", { id: "xpRefresh" });
    loadXPData().then(() => {
      toast.success("Leaderboard updated!", { id: "xpRefresh" });
    });
  };

  // ===============================
  // Render (UPDATED)
  // ===============================
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2"> {/* <-- DARK MODE FIX */}
          ⚡ Gamification Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition disabled:opacity-60" // <-- DARK MODE FIX
        >
          <RefreshCw size={18} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </motion.div>

      {/* =================== Summary Cards =================== */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              icon={<Zap size={20} />} // <-- Made icon smaller
              title="Total XP"
              value={<NumberAnimation value={stats.totalXP} />} // <-- ANIMATION
              color="blue"
            />
            <StatCard
              icon={<Trophy size={20} />} // <-- Made icon smaller
              title="Top Student"
              value={stats.topStudent} // (No animation for text)
              color="yellow"
            />
            <StatCard
              icon={<Zap size={20} />} // <-- Made icon smaller
              title="Highest XP"
              value={<NumberAnimation value={stats.topXP} />} // <-- ANIMATION
              color="green"
            />
            <StatCard
              icon={<Zap size={20} />} // <-- Made icon smaller
              title="Average XP"
              value={<NumberAnimation value={stats.avgXP} />} // <-- ANIMATION
              color="purple"
            />
          </div>
        </ScrollAnimation>
      </motion.div>

      {/* =================== Leaderboard Table =================== */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <div className="bg-secondary rounded-xl shadow p-6 border border-white/10"> {/* <-- DARK MODE FIX */}
            <h2 className="text-xl font-semibold mb-4 text-text-primary"> {/* <-- DARK MODE FIX */}
              🏆 XP Leaderboard
            </h2>

            {/*
              --- SYNTAX ERROR FIX ---
              Removed comments from inside this JSX block
            */}
            {loading ? (
              <p className="text-text-secondary">Loading leaderboard...</p>
            ) : data.length === 0 ? (
              <p className="text-text-secondary">No XP data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-background text-text-secondary text-sm"> {/* <-- DARK MODE FIX */}
                      <th className="px-4 py-2 text-left border-b border-white/10">Rank</th>
                      <th className="px-4 py-2 text-left border-b border-white/10">Student</th>
                      <th className="px-4 py-2 text-left border-b border-white/10">XP</th>
                      <th className="px-4 py-2 text-left border-b border-white/10">Level</th>
                      <th className="px-4 py-2 text-left border-b border-white/10">Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((s, idx) => (
                      <tr
                        key={s.email}
                        className={`text-sm ${
                          idx % 2 === 0 ? "bg-secondary" : "bg-background" // <-- DARK MODE FIX
                        } hover:bg-accent/10`}
                      >
                        <td className="px-4 py-2 border-b border-white/10 font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-2 border-b border-white/10 text-text-secondary">{s.email}</td> {/* <-- DARK MODE FIX */}
                        <td className="px-4 py-2 border-b border-white/10 font-medium text-text-primary"> {/* <-- DARK MODE FIX */}
                          {s.xp || 0}
                        </td>
                        <td className="px-4 py-2 border-b border-white/10 text-text-secondary"> {/* <-- DARK MODE FIX */}
                          {s.level || 1}
                        </td>
                        <td className="px-4 py-2 border-b border-white/10 text-text-secondary"> {/* <-- DARK MODE FIX */}
                          {s.badge || "New Learner 🐣"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollAnimation>
      </motion.div>
    </motion.div>
  );
}

/* ===============================
  Reusable Stat Card (UPDATED FOR DARK MODE + OVERLAP FIX)
  =============================== */
function StatCard({ icon, title, value, color }) {
  // Theme-aware colors
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }} // <-- HOVER ANIMATION
      className={`flex items-center justify-between p-4 rounded-xl shadow-sm ${ // <-- "Too Big" Fix: p-5 to p-4
        colorClasses[color] || colorClasses.blue
      }`}
    >
      {/* --- OVERLAP FIX ---
        Added min-w-0 to allow text to truncate
      */}
      <div className="min-w-0 flex-1"> 
        <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
          {title}
        </p>
        <p className="text-xl font-bold mt-1 truncate">{value}</p> {/* <-- "Too Big" Fix: text-2xl to text-xl AND added truncate */}
      </div>
      <div className="opacity-80 ml-2">{icon}</div> {/* Added ml-2 for spacing */}
    </motion.div>
  );
}