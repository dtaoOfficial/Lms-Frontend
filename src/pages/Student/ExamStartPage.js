import React, { useState } from "react"; // <-- Removed unused useEffect
import { useParams, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../../api";
import { startExam } from "../../api/studentExams";

// --- NEW IMPORTS ---
import { motion } from "framer-motion";
import { ArrowLeft, Clock, XCircle, CheckCircle, ListChecks } from "lucide-react";
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

export default function ExamStartPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // <-- NEW: Added loading state

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const handleStart = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("⚠️ Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }
      setAuthToken(token);

      setLoading(true); // <-- Set loading
      const res = await startExam(examId);
      console.log("✅ Exam started successfully:", res);

      navigate(`/student/exams/take/${examId}`);
    } catch (err) {
      console.error("❌ Exam start error:", err);
      alert(err?.response?.data?.message || "Failed to start exam. Please try again.");
      setLoading(false); // <-- Unset loading on error
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background flex items-center justify-center" // <-- DARK MODE FIX
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        {/* --- NEW: Back Button --- */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/student/exams")}
          className="flex items-center gap-1 text-accent hover:underline text-sm font-medium mb-4"
        >
          <ArrowLeft size={16} />
          Back to Exams
        </motion.button>

        <motion.div 
          variants={itemVariants}
          className="bg-secondary rounded-xl shadow-lg p-6 sm:p-8 border border-white/10" // <-- DARK MODE FIX
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-text-primary"> {/* <-- DARK MODE FIX */}
            📘 Exam Instructions
          </h2>
          
          <ul className="space-y-3 mb-6 text-text-secondary"> {/* <-- DARK MODE FIX */}
            <li className="flex items-start gap-3">
              <Clock size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <span>Once started, you must complete the exam in one sitting. The timer will not stop.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>Do not close or refresh your browser during the exam, or your progress may be lost.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span>Each question has only one correct answer.</span>
            </li>
            <li className="flex items-start gap-3">
              <ListChecks size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <span>Submit all answers before time expires. Good luck!</span>
            </li>
          </ul>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              disabled={loading} // <-- Disable on click
              className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition-colors font-semibold disabled:opacity-50" // <-- DARK MODE FIX
            >
              {loading ? "Starting..." : "🚀 Begin Exam"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}