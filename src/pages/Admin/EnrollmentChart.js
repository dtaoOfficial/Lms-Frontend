import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// --- NEW: Import useTheme to detect dark mode ---
import { useTheme } from "../../context/ThemeContext";

function EnrollmentChart({ data }) {
  // --- NEW: Get theme state ---
  const { theme } = useTheme();
  
  // --- NEW: Define theme-aware text colors ---
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7285'; // text-text-secondary
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipBg = theme === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)'; // bg-secondary or bg-white

  if (!data || !data.data || Object.keys(data.data).length === 0) return null;

  // Format + sort chronologically (UNCHANGED)
  const chartData = Object.entries(data.data)
    .map(([date, count]) => ({
      date: date.substring(0, 10),
      count: Number(count) || 0,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    // --- DARK MODE FIX: bg-white -> bg-secondary, added border ---
    <div className="bg-secondary border border-white/10 rounded-lg p-4 shadow mt-6">
      {/* --- DARK MODE FIX: Added text-text-primary --- */}
      <h2 className="text-lg font-semibold mb-3 text-text-primary">Enrollments (Last 30 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          {/* --- DARK MODE FIX: Updated stroke color --- */}
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: textColor }} /> {/* <-- DARK MODE FIX */}
          <YAxis tick={{ fill: textColor }} /> {/* <-- DARK MODE FIX */}
          <Tooltip 
            // --- DARK MODE FIX: Styled tooltip ---
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              border: `1px solid ${gridColor}`,
              borderRadius: '0.5rem'
            }}
            cursor={{ stroke: gridColor }}
          />
          <Legend wrapperStyle={{ color: textColor }} /> {/* <-- DARK MODE FIX */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="rgb(var(--color-accent))" // <-- THEME FIX: Use accent color
            strokeWidth={3}
            dot={{ r: 3, fill: "rgb(var(--color-accent))" }} // <-- THEME FIX
            activeDot={{ r: 5, fill: "rgb(var(--color-accent))" }} // <-- THEME FIX
            name="Enrollments"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnrollmentChart;