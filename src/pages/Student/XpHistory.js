import React, { useEffect, useState } from "react";
import { getMyXp } from "../../api/xpEvents";

// --- NEW IMPORTS ---
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
import { Award, Star, Activity } from "lucide-react";
// -------------------

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- NEW: Animation Component for Numbers ---
function NumberAnimation({ value, suffix = "" }) {
  const count = useMotionValue(0);
  const roundedWithSuffix = useTransform(count, (latest) => {
    return `${Math.round(latest)}${suffix}`;
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

// --- NEW: Rebuilt Stat Card Component ---
const StatCard = ({ title, value, icon }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="bg-secondary rounded-lg shadow-lg p-6 border border-white/10"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-accent/10 rounded-full text-accent">
        {icon}
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
    </div>
    <p className="text-4xl font-bold text-text-primary mt-3">
      {value}
    </p>
  </motion.div>
);

export default function XpHistory() {
  const [xpEvents, setXpEvents] = useState([]);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    async function loadXp() {
      try {
        const data = await getMyXp();
        setTotalXp(data?.totalXp || 0);
        setXpEvents(data?.events || []);
      } catch (err) {
        console.error("[XpHistory] Failed to fetch XP data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadXp();
  }, []);
  // --- END OF LOGIC ---

  // --- NEW: Motivation Logic ---
  const level = totalXp > 0 ? Math.floor(totalXp / 100) + 1 : 1;

  if (loading)
    return <p className="p-6 text-center text-text-secondary mt-10">Loading XP history...</p>; // <-- DARK MODE FIX

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          variants={itemVariants} 
          className="text-2xl font-bold text-text-primary mb-6" // <-- DARK MODE FIX
        >
          🏆 Your XP History
        </motion.h1>

        {/* --- NEW: Stat Cards --- */}
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard 
            title="Total XP" 
            icon={<Star size={20} />}
            value={<NumberAnimation value={totalXp} />} 
          />
          <StatCard 
            title="Current Level" 
            icon={<Award size={20} />}
            value={<NumberAnimation value={level} />} 
          />
          <StatCard 
            title="Activities Logged" 
            icon={<Activity size={20} />}
            value={<NumberAnimation value={xpEvents.length} />} 
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <ScrollAnimation>
            {xpEvents.length === 0 ? (
              <p className="text-text-secondary">No XP activity yet.</p> // <-- DARK MODE FIX
            ) : (
              <div className="bg-secondary shadow-lg rounded-lg border border-white/10 overflow-hidden"> {/* <-- DARK MODE FIX */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background text-text-secondary"> {/* <-- DARK MODE FIX */}
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Message</th>
                        <th className="text-left py-3 px-4 font-semibold">Points</th>
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    {/* --- NEW: Animated Table Body --- */}
                    <tbody className="divide-y divide-white/10">
                      <AnimatePresence>
                        {xpEvents.map((xp, idx) => (
                          <motion.tr
                            key={xp.id || idx} // Use a unique id if available
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: idx * 0.05 }} // Stagger row animation
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-text-primary">{xp.type}</td> {/* <-- DARK MODE FIX */}
                            <td className="py-3 px-4 text-text-secondary">{xp.message}</td> {/* <-- DARK MODE FIX */}
                            <td className="py-3 px-4 text-green-500 font-semibold">
                              +{xp.score}
                            </td>
                            <td className="py-3 px-4 text-text-secondary/70"> {/* <-- DARK MODE FIX */}
                              {new Date(xp.createdAt).toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ScrollAnimation>
        </motion.div>
      </div>
    </motion.div>
  );
}