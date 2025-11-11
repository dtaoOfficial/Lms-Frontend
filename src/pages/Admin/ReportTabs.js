import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ReportTabs({ filter, setFilter }) {
  const tabs = ["OPEN", "REVIEWED", "CLOSED"];

  return (
    <div className="flex space-x-3 border-b border-white/10 mb-4"> {/* <-- DARK MODE FIX */}
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setFilter(tab)}
          className={`relative px-4 py-2 text-sm font-medium rounded-t-md transition-colors
            ${
              filter === tab
                ? "text-accent" // <-- THEME FIX
                : "text-text-secondary hover:text-text-primary hover:bg-white/10" // <-- DARK MODE FIX
            }
          `}
        >
          {/* Animated underline */}
          {filter === tab && (
            <motion.div
              layoutId="report-tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
            />
          )}
          {tab}
        </button>
      ))}
    </div>
  );
}