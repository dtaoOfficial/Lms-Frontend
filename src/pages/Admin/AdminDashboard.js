// src/pages/Admin/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import api from "../../api";
import StatsCards from "./StatsCards";
import EnrollmentChart from "./EnrollmentChart";
import CourseEngagementChart from "./CourseEngagementChart";

// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
// -------------------

// --- Animated Number ---
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

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [enrollments, setEnrollments] = useState({});
  const [engagement, setEngagement] = useState({});
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setRefreshing(true);
    try {
      const [s, e, c, p] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/analytics/enrollments"),
        api.get("/api/admin/analytics/course-engagement"),
        api.get("/api/admin/analytics/student-progress").catch(() => ({ data: null })),
      ]);
      setStats(s.data);
      setEnrollments(e.data);
      setEngagement(c.data);
      setStudentProgress(p.data || null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | LMS Platform</title>
        <meta
          name="description"
          content="Admin Dashboard – manage users, track student performance, and oversee LMS platform analytics."
        />
      </Helmet>

      <motion.div initial="hidden" animate="visible" exit={{ opacity: 0, y: -15 }} variants={containerVariants}>
        <div className="p-6 min-h-screen bg-background">
          {/* HEADER */}
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">⚙️ Admin Dashboard</h1>
              <p className="text-text-secondary">Your control center for platform insights.</p>
            </div>
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="px-5 py-2 bg-accent text-white rounded-lg shadow hover:bg-accent/90 disabled:opacity-60 transition-colors"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </motion.div>

          {/* STATS OVERVIEW */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <StatsCards data={stats} loading={loading} />
            </ScrollAnimation>
          </motion.div>

          {/* QUICK ACTION CARDS */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* STUDENT PROGRESS */}
                <motion.div whileHover={{ scale: 1.03 }} className="bg-secondary border border-white/10 rounded-xl shadow-lg p-6 transition-all">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">🎓 Student Progress</h2>
                  <p className="text-sm text-text-secondary mb-3">
                    Track overall student learning progress.
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    <NumberAnimation value={studentProgress?.averageProgress ?? 0} />%
                  </p>
                  <button
                    onClick={() => navigate("/admin/student-progress")}
                    className="mt-4 w-full bg-accent text-white py-2 rounded-md font-medium hover:bg-accent/90 transition-colors"
                  >
                    View Analytics
                  </button>
                </motion.div>

                {/* FORUM MODERATION */}
                <motion.div whileHover={{ scale: 1.03 }} className="bg-secondary border border-white/10 rounded-xl shadow-lg p-6 transition-all">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">💬 Forum Moderation</h2>
                  <p className="text-sm text-text-secondary mb-3">
                    Handle student Q&A and review reported posts.
                  </p>
                  <button
                    onClick={() => navigate("/admin/forum-moderation")}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-md font-medium hover:bg-red-700 transition"
                  >
                    Manage Forum
                  </button>
                </motion.div>

                {/* REPORTS */}
                <motion.div whileHover={{ scale: 1.03 }} className="bg-secondary border border-white/10 rounded-xl shadow-lg p-6 transition-all">
                  <h2 className="text-lg font-semibold text-text-primary mb-2">🚨 Reports & Flags</h2>
                  <p className="text-sm text-text-secondary mb-3">
                    View and resolve reported content (videos, comments, forums).
                  </p>
                  <button
                    onClick={() => navigate("/admin/reports")}
                    className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-md font-medium hover:bg-yellow-600 transition"
                  >
                    Review Reports
                  </button>
                </motion.div>
              </div>
            </ScrollAnimation>
          </motion.div>

          {/* CHARTS SECTION */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnrollmentChart data={enrollments} />
                <CourseEngagementChart data={engagement} />
              </div>
            </ScrollAnimation>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default AdminDashboard;
