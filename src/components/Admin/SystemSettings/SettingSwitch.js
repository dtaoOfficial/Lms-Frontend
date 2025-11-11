import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function SettingSwitch({ label, checked, onChange, description }) {
  // --- Animation for the switch knob ---
  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10"> {/* <-- DARK MODE FIX */}
      <div>
        <h4 className="text-sm font-medium text-text-primary">{label}</h4> {/* <-- DARK MODE FIX */}
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p> /* <-- DARK MODE FIX */
        )}
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer" // Hides the default checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {/* --- NEW Animated Switch --- */}
        <motion.div
          className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
            checked ? 'bg-accent' : 'bg-gray-600' // <-- DARK MODE FIX
          }`}
        >
          <motion.div
            className="w-4 h-4 bg-white rounded-full shadow-md"
            layout // This tells Framer Motion to animate the layout change
            transition={spring} // Use the spring animation
            style={{ x: checked ? '100%' : '0%' }} // Move based on state
          />
        </motion.div>
      </label>
    </div>
  );
}