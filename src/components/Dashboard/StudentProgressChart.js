import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- NEW IMPORTS ---
import { useTheme } from "../../context/ThemeContext";
// -------------------

const StudentProgressChart = ({ progressData }) => {
  // --- NEW: Get theme state ---
  const { theme } = useTheme();
  
  // --- NEW: Define theme-aware text colors ---
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7285'; // text-text-secondary
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)'; // bg-secondary or bg-white
  // ------------------------------

  if (!progressData || progressData.length === 0) {
    return (
      <div className="bg-secondary p-6 rounded-xl shadow-md text-center text-text-secondary border border-white/10 h-full flex items-center justify-center"> {/* <-- DARK MODE FIX */}
        No progress data available.
      </div>
    );
  }

  return (
    <div className="bg-secondary p-6 rounded-xl shadow-md border border-white/10 h-full"> {/* <-- DARK MODE FIX */}
      <h3 className="text-lg font-semibold mb-4 text-text-primary"> {/* <-- DARK MODE FIX */}
        Learning Progress Over Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} /> {/* <-- DARK MODE FIX */}
          <XAxis dataKey="date" stroke={textColor} tick={{ fontSize: 11 }} /> {/* <-- DARK MODE FIX */}
          <YAxis stroke={textColor} tick={{ fontSize: 11 }} /> {/* <-- DARK MODE FIX */}
          <Tooltip
            // --- DARK MODE FIX: Styled tooltip ---
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              border: `1px solid ${gridColor}`,
              borderRadius: '0.5rem'
            }}
            cursor={{ stroke: gridColor }}
          />
          <Line 
            type="monotone" 
            dataKey="progress" 
            stroke="rgb(var(--color-accent))" // <-- THEME FIX
            strokeWidth={2} 
            dot={{ r: 3, fill: "rgb(var(--color-accent))" }}
            activeDot={{ r: 5, fill: "rgb(var(--color-accent))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentProgressChart;