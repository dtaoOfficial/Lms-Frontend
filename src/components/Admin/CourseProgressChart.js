import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- NEW IMPORTS ---
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
// -------------------

function CourseProgressChart({ perCourse }) {
  // --- NEW: Get theme state ---
  const { theme } = useTheme();
  
  // --- NEW: Define theme-aware text colors ---
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7285'; // text-text-secondary
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)'; // bg-secondary or bg-white
  // ------------------------------
  
  if (!perCourse || !perCourse.length) return null;

  const chartData = perCourse.map((c) => ({
    name: c.courseTitle,
    completion: c.avgCompletion,
  }));

  return (
    <motion.div 
      className="bg-secondary p-4 shadow rounded-lg mb-6 border border-white/10" // <-- DARK MODE FIX
    >
      <h2 className="text-lg font-semibold mb-3 text-text-primary"> {/* <-- DARK MODE FIX */}
        Course Completion Overview
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} /> {/* <-- DARK MODE FIX */}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: textColor }} // <-- DARK MODE FIX
            angle={-20}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11, fill: textColor }} /> {/* <-- DARK MODE FIX */}
          <Tooltip
            // --- DARK MODE FIX: Styled tooltip ---
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              border: `1px solid ${gridColor}`,
              borderRadius: '0.5rem'
            }}
            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          />
          <Bar dataKey="completion" fill="rgb(var(--color-accent))" /> {/* <-- THEME FIX */}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default CourseProgressChart;