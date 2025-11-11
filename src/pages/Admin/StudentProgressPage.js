import React, { useEffect, useState } from "react";
import { getStudentProgressAnalytics } from "../../api/admin";
import CourseProgressChart from "../../components/Admin/CourseProgressChart";
import TopStudentsTable from "../../components/Admin/TopStudentsTable";

// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
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
// ---------------------------------------------

function StudentProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getStudentProgressAnalytics();
        setData(res);
      } catch (err) {
        console.error("Error loading student progress analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  // --- END OF LOGIC ---

  if (loading)
    return (
      <div className="p-8 text-text-secondary text-center">Loading analytics...</div> // <-- DARK MODE FIX
    );

  if (!data)
    return (
      <div className="p-8 text-red-500 text-center">
        No analytics data available.
      </div>
    );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2 text-text-primary">Student Progress Analytics 📊</h1> {/* <-- DARK MODE FIX */}
        <p className="text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
          Overview of student learning performance across all courses.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <ScrollAnimation>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-secondary p-4 rounded-lg shadow border border-white/10" // <-- DARK MODE FIX
          >
            <h2 className="text-sm text-text-secondary">Total Students</h2> {/* <-- DARK MODE FIX */}
            <p className="text-2xl font-semibold text-accent"> {/* <-- DARK MODE FIX */}
              <NumberAnimation value={data.totalStudents ?? 0} />
            </p>
          </motion.div>
        </ScrollAnimation>
        
        <ScrollAnimation>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-secondary p-4 rounded-lg shadow border border-white/10" // <-- DARK MODE FIX
          >
            <h2 className="text-sm text-text-secondary">Avg. Progress</h2> {/* <-- DARK MODE FIX */}
            <p className="text-2xl font-semibold text-green-600">
              <NumberAnimation value={data.averageProgress ?? 0} />%
            </p>
          </motion.div>
        </ScrollAnimation>
      </motion.div>

      {/* Course Progress Chart */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {/* This component (CourseProgressChart) still needs its dark mode fix inside it */}
          <CourseProgressChart perCourse={data.perCourse || []} />
        </ScrollAnimation>
      </motion.div>

      {/* Top Students Table */}
      <motion.div variants={itemVariants} className="mt-6">
        <ScrollAnimation>
          {/* This component (TopStudentsTable) still needs its dark mode fix inside it */}
          <TopStudentsTable topStudents={data.topStudents || []} />
        </ScrollAnimation>
      </motion.div>
    </motion.div>
  );
}

export default StudentProgressPage;