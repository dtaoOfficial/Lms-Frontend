import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { getStudentDashboardStats } from "../../api/dashboard";
// import StudentStatsCard from "../../components/Dashboard/StudentStatsCard"; // No longer needed
import StudentProgressChart from "../../components/Dashboard/StudentProgressChart";
import RecentActivityList from "../../components/Dashboard/RecentActivityList";
import XpCard from "../../components/Dashboard/XpCard";

// --- NEW IMPORTS ---
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
// import ScrollAnimation from "../../components/ScrollAnimation"; // <-- FIX: REMOVED THIS UNUSED IMPORT
import { BookCopy, Video, Award, ThumbsUp, Quote } from "lucide-react"; // New Icons
// -------------------

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child fades in 0.1s after the last
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- NEW: Animation Component for Numbers (FIXED) ---
function NumberAnimation({ value, suffix = "" }) {
  const count = useMotionValue(0);

  // --- BUG FIX IS HERE ---
  // We combine the number and the suffix inside the transform
  const roundedWithSuffix = useTransform(count, (latest) => {
    return `${Math.round(latest)}${suffix}`;
  });
  // -----------------------

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  // Now we render the new MotionValue that has the suffix built-in
  return <motion.span>{roundedWithSuffix}</motion.span>;
}

// --- NEW: Motivational Welcome Card ---
const WelcomeCard = () => (
  <motion.div 
    variants={itemVariants} 
    className="lg:col-span-2 bg-secondary rounded-lg shadow-lg p-6 border border-white/10 flex flex-col justify-between"
  >
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back, Student! 📚</h2>
      <p className="text-text-secondary">Let's make today a productive learning day.</p>
    </div>
    <div className="mt-6 italic border-l-4 border-accent pl-4">
      <Quote className="text-accent mb-2" size={20} />
      <p className="text-text-secondary">
        "The beautiful thing about learning is that no one can take it away from you." – B.B. King
      </p>
    </div>
  </motion.div>
);

// --- NEW: Rebuilt Stat Card Component ---
const StatCard = ({ title, value, icon, suffix = "" }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.05 }}
    className="bg-secondary rounded-lg shadow-lg p-4 border border-white/10"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-accent/10 rounded-full text-accent">
        {icon}
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
    </div>
    <p className="text-3xl font-bold text-text-primary mt-3">
      <NumberAnimation value={value} suffix={suffix} />
    </p>
  </motion.div>
);

// --- NEW: Rebuilt Progress Card Component ---
const ProgressCard = ({ value }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-secondary rounded-lg shadow-lg p-6 border border-white/10 flex flex-col items-center justify-center"
  >
    <p className="text-sm font-medium text-text-secondary mb-2">Average Progress</p>
    <p className="text-6xl font-bold text-green-500">
      <NumberAnimation value={value} suffix="%" />
    </p>
  </motion.div>
);


export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    isMounted.current = true;
    async function loadDashboard() {
      try {
        const res = await getStudentDashboardStats();
        if (isMounted.current && res) setStats(res);
      } catch (err) {
        console.error("[StudentDashboard] Failed:", err);
        if (isMounted.current)
          setError("Unable to load dashboard data. Please try again later.");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted.current = false;
    };
  }, []);
  // --- END OF LOGIC ---

  return (
    <>
      <Helmet>
        {/* ... (Your Helmet code is unchanged) ... */}
        <title>Student Dashboard | LMS Platform</title>
        <meta
          name="description"
          content="Track your XP, course progress, and certificates in your personalized LMS student dashboard."
        />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-text-primary" // <-- DARK MODE FIX
        >
          🎓 Student Dashboard
        </motion.h1>

        {loading && (
          <div className="text-text-secondary bg-secondary p-4 rounded-lg shadow-sm mb-6 border border-white/10"> {/* <-- DARK MODE FIX */}
            Loading dashboard data...
          </div>
        )}
        {error && (
          <div className="text-red-600 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6"> {/* <-- DARK MODE FIX */}
            {error}
          </div>
        )}

        {!loading && stats && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-4 gap-6" // <-- NEW BENTO GRID
          >
            {/* Row 1 */}
            <WelcomeCard />
            
            {/* XpCard (This will be white until we fix its file) */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <XpCard />
            </motion.div>
            
            <ProgressCard value={stats.averageProgress || 0} />

            {/* Row 2 */}
            {/* StudentProgressChart (This will be white until we fix its file) */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <StudentProgressChart progressData={[]} />
            </motion.div>
            
            {/* RecentActivityList (This will be white until we fix its file) */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <RecentActivityList activities={stats.recentVideos || []} />
            </motion.div>
            
            {/* Row 3 - Small Stats */}
            <StatCard 
              title="Courses Enrolled" 
              value={stats.totalCourses || 0} 
              icon={<BookCopy size={20} />} 
            />
            <StatCard 
              title="Videos Completed" 
              value={stats.completedVideos || 0} 
              icon={<Video size={20} />} 
            />
            <StatCard 
              title="Certificates" 
              value={stats.totalCertificates || 0} 
              icon={<Award size={20} />} 
            />
            <StatCard 
              title="Likes Given" 
              value={stats.totalLikes || 0} 
              icon={<ThumbsUp size={20} />} 
            />
          </motion.div>
        )}
      </motion.div>
    </>
  );
}