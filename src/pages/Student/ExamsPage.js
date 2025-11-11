import React, { useEffect, useState } from "react";
import { getAvailableExams } from "../../api/studentExams";
import { useNavigate } from "react-router-dom";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Play, Check, Clock } from "lucide-react";
// -------------------

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

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    async function load() {
      try {
        const data = await getAvailableExams();
        setExams(data);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  // --- END OF LOGIC ---

  if (loading)
    return <div className="p-6 text-center text-text-secondary">Loading exams...</div>; // <-- DARK MODE FIX

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.h2 
        variants={itemVariants} 
        className="text-2xl font-semibold mb-4 text-text-primary" // <-- DARK MODE FIX
      >
        Available Exams
      </motion.h2>

      {exams.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center text-text-secondary py-20 bg-secondary rounded-lg border border-white/10" // <-- DARK MODE FIX
        >
          No active exams available right now.
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants} // Stagger children
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {exams.map((exam) => (
              <ExamCard 
                key={exam.id} 
                exam={exam} 
                navigate={navigate} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

// --- NEW: Redesigned Exam Card ---
const ExamCard = ({ exam, navigate }) => {
  const getStatusButton = () => {
    if (exam.studentStatus === "COMPLETED") {
      return (
        <button
          onClick={() => navigate(`/student/exams/result/${exam.id}`)}
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Check size={16} /> View Result
        </button>
      );
    }
    if (exam.studentStatus === "IN_PROGRESS") {
      return (
        <button
          onClick={() => navigate(`/student/exams/take/${exam.id}`)}
          className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Clock size={16} /> Continue Exam
        </button>
      );
    }
    return (
      <button
        onClick={() => navigate(`/student/exams/start/${exam.id}`)}
        className="flex-1 bg-accent text-white px-3 py-2 rounded-md hover:bg-accent/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <Play size={16} /> Start Exam
      </button>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -5 }}
      className="border border-white/10 rounded-xl p-4 bg-secondary shadow hover:shadow-lg transition-all flex flex-col" // <-- DARK MODE FIX
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent/10 rounded-full text-accent">
            <FileText size={20} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary truncate">{exam.name}</h3> {/* <-- DARK MODE FIX */}
        </div>
        <p className="text-sm text-text-secondary">Type: {exam.type}</p> {/* <-- DARK MODE FIX */}
        <p className="text-sm text-text-secondary">Language: {exam.language}</p> {/* <-- DARK MODE FIX */}
        <p className="text-sm text-text-secondary mt-1"> {/* <-- DARK MODE FIX */}
          Duration: {exam.duration} min
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {getStatusButton()}
      </div>
    </motion.div>
  );
};