import React, { useEffect, useState } from "react";
import { getMyXp } from "../../api/xpEvents";

// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "../../context/ThemeContext"; // To get accent color
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

// --- NEW: Scalable Level Logic ---
const XP_PER_LEVEL = 100; // Each level takes 100 XP

const getLevelInfo = (xp) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpThisLevel = xp % XP_PER_LEVEL;
  const progressPercent = xpThisLevel; // Since it's out of 100
  const xpToNext = XP_PER_LEVEL - xpThisLevel;
  return { level, progressPercent, xpToNext };
};

// --- NEW: Motivational Quote based on XP ---
const getMotivationalQuote = (xp) => {
  if (xp < 50) {
    return "Great start! Keep the momentum going.";
  }
  if (xp < 250) {
    return "You're on a roll! Keep pushing.";
  }
  if (xp < 500) {
    return "Amazing progress! You're a fast learner.";
  }
  if (xp < 1000) {
    return "Incredible! You're becoming a master.";
  }
  return "Wow! You're an expert in the community!";
};
// ---------------------------------

export default function XpCard() {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const { accent } = useTheme(); // Get accent color for progress bar

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    async function fetchXp() {
      try {
        const data = await getMyXp();
        setXp(data?.totalXp || 0);
      } catch (err) {
        console.error("[XpCard] Failed to load XP:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchXp();
  }, []);
  // --- END OF LOGIC ---

  // --- NEW: Get level info and quote ---
  const { level, progressPercent, xpToNext } = getLevelInfo(xp);
  const quote = getMotivationalQuote(xp); // <-- Get the quote
  // ----------------------------------

  // Get accent color for progress bar
  const accentColors = {
    blue: "rgb(59 130 246)",
    purple: "rgb(168 85 247)",
    emerald: "rgb(16 185 129)",
    rose: "rgb(244 63 94)",
    amber: "rgb(245 158 11)",
  };
  const accentColor = accentColors[accent] || accentColors.blue;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="bg-secondary border border-white/10 shadow-lg rounded-xl p-4 text-center flex flex-col justify-between items-center transition-all duration-200 h-full"
    >
      <h2 className="text-lg font-semibold text-text-primary">🎯 Your XP</h2>

      {loading ? (
        <p className="text-text-secondary mt-2">Loading...</p>
      ) : (
        <>
          <div className="w-32 h-32 my-4 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CircularProgressbar
                value={progressPercent}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: accentColor,
                  textColor: "transparent",
                  trailColor: "rgba(255, 255, 255, 0.1)",
                  pathTransitionDuration: 1.5,
                })}
              />
            </motion.div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-text-secondary">LVL</span>
              <span className="text-4xl font-bold text-text-primary">{level}</span>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-accent">
            <NumberAnimation value={xp} /> XP
          </p>
          
          {/* --- UPDATED: Show quote instead of badge --- */}
          <p className="text-sm text-text-secondary mt-1 px-2 h-10"> {/* Added h-10 for consistent size */}
            {quote}
          </p>
          
          <p className="text-xs text-text-secondary/70 mt-2">
            {progressPercent === 100 ? "Level Up!" : `${xpToNext} XP to next level`}
          </p>
        </>
      )}
    </motion.div>
  );
}