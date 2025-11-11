import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- FIX: Removed 'Link'
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, ArrowLeft } from "lucide-react";
import forumApi from "../../api/forum";
import QuestionCard from "../../components/Forum/QuestionCard";
import AskQuestionModal from "../../components/Forum/AskQuestionModal";
import { toast } from "react-hot-toast";

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

/**
 * 💬 ForumPage
 * Displays discussion questions for a specific course.
 */
const ForumPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadQuestions = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const data = await forumApi.getQuestionsByCourse(courseId);

      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        console.warn("Unexpected forum response:", data);
        setQuestions([]);
      }
    } catch (err) {
      console.error("❌ Error loading forum:", err);
      toast.error("Failed to load forum discussions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleQuestionAdded = (newQuestion) => {
    if (newQuestion && newQuestion.id) {
      setQuestions((prev) => [newQuestion, ...prev]);
    }
  };

  const handleUpdateQuestion = (updated) => {
    if (updated && updated.id) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/student/courses"); // fallback route
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background px-4 py-6" // <-- DARK MODE FIX
    >
      <div className="max-w-4xl mx-auto">
        {/* 🔙 Back Button */}
        <motion.div variants={itemVariants} className="mb-4 flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-accent hover:underline text-sm font-medium" // <-- DARK MODE FIX
          >
            <ArrowLeft size={16} />
            Back to Course
          </button>
        </motion.div>

        {/* 🧩 Page Title */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl font-semibold mb-6 text-text-primary text-center" // <-- DARK MODE FIX
        >
          Discussion Forum 💬
        </motion.h1>

        {/* 🟢 Ask Question Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-end mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-all" // <-- DARK MODE FIX
          >
            <PlusCircle size={18} />
            Ask Question
          </motion.button>
        </motion.div>

        {/* 🌀 Loading State */}
        {loading ? (
          <motion.div variants={itemVariants} className="text-center py-12 text-text-secondary"> {/* <-- DARK MODE FIX */}
            Loading discussions...
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <AnimatePresence>
              {questions.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-text-secondary py-10" // <-- DARK MODE FIX
                >
                  <p>No discussions yet. Be the first to ask a question!</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }} // Stagger list items
                    >
                      {/* This component (QuestionCard) still needs dark mode fix */}
                      <QuestionCard
                        question={q}
                        onAddReply={handleUpdateQuestion}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 🟣 Ask Question Modal */}
      {/* This component (AskQuestionModal) still needs dark mode fix */}
      <AskQuestionModal
        courseId={courseId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuestionAdded={handleQuestionAdded}
      />
    </motion.div>
  );
};

export default ForumPage;