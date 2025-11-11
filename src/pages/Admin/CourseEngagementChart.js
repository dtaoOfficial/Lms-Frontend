import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- NEW: Import useTheme to detect dark mode ---
import { useTheme } from "../../context/ThemeContext";

function CourseEngagementChart({ data }) {
  // --- NEW: Get theme state ---
  const { theme } = useTheme();
  
  // --- NEW: Define theme-aware text colors ---
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7285'; // text-text-secondary
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)'; // bg-secondary or bg-white

  if (!data || !data.courses || !Array.isArray(data.courses)) return null;

  const chartData = data.courses.map((c, i) => ({
    id: i,
    title: c.title?.length > 20 ? c.title.slice(0, 20) + "..." : c.title,
    enrolled: c.enrolledStudents || 0,
    rating: c.rating || 0,
  }));

  return (
    // --- DARK MODE FIX: bg-white -> bg-secondary, added border ---
    <div className="bg-secondary border border-white/10 rounded-lg p-4 shadow mt-6"> 
      {/* --- DARK MODE FIX: Added text-text-primary --- */}
      <h2 className="text-lg font-semibold mb-3 text-text-primary">Course Engagement</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          {/* --- DARK MODE FIX: Updated stroke color --- */}
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" /> 
          <XAxis
            dataKey="title"
            tick={{ fontSize: 11, fill: textColor }} // <-- DARK MODE FIX
            interval={0}
            angle={-25}
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
          <Legend wrapperStyle={{ color: textColor }} /> {/* <-- DARK MODE FIX */}
          <Bar dataKey="enrolled" name="Enrolled Students" fill="#10b981" />
          {/* --- THEME FIX: Use accent color --- */}
          <Bar dataKey="rating" name="Rating" fill="rgb(var(--color-accent))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CourseEngagementChart;