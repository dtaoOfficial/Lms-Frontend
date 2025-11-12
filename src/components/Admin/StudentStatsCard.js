// src/components/Admin/StudentStatsCard.js
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, Activity, BarChart3 } from "lucide-react";
import api from "../../api";

function NumberAnimation({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value || 0, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StudentStatsCard() {
  const [data, setData] = useState({ total: 0, active: 0, avgProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/api/admin/analytics/student-progress");
        const d = res.data || {};
        setData({
          total: d.totalStudents || 0,
          active: d.activeStudents || 0,
          avgProgress: Math.round(d.averageProgress || 0),
        });
      } catch (err) {
        console.error("Failed to fetch student stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-secondary rounded-lg border border-white/10 p-5 shadow-sm transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-3">
        <Users size={22} className="text-blue-400" />
        <h2 className="font-bold text-lg text-text-primary">Student Insights</h2>
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Loading student data...</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Students:</span>
            <span className="text-text-primary font-semibold">
              <NumberAnimation value={data.total} />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Active Students:</span>
            <span className="text-green-400 font-semibold">
              <NumberAnimation value={data.active} />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Avg Progress:</span>
            <span className="text-yellow-400 font-semibold">
              <NumberAnimation value={data.avgProgress} />%
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
        <Activity size={14} className="text-accent" />
        <BarChart3 size={14} className="text-accent" />
        <span>Auto-refresh on page reload</span>
      </div>
    </motion.div>
  );
}
