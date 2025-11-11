import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle } from "lucide-react";
import forumApi from "../../api/forum";
import { toast } from "react-hot-toast";

/**
 * 🎯 AskQuestionModal — adds XP reward feedback on successful post
 */
const AskQuestionModal = ({ courseId, isOpen, onClose, onQuestionAdded }) => {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Please enter a question before submitting!");
      return;
    }

    try {
      setLoading(true);
      const newQuestion = await forumApi.createQuestion(
        courseId,
        questionText.trim()
      );

      if (onQuestionAdded && typeof onQuestionAdded === "function") {
        onQuestionAdded(newQuestion);
      }

      setQuestionText("");
      onClose();

      // ✅ Show XP reward toast
      toast.success("🎯 Question posted successfully (+5 XP)!", {
        icon: "🚀",
      });
    } catch (error) {
      console.error("❌ Failed to post question:", error);
      toast.error("Failed to post question. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40" // <-- DARK MODE FIX
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* --- DARK MODE FIX: Updated all colors --- */}
            <div 
              className="bg-secondary rounded-2xl shadow-xl w-full max-w-lg border border-white/10 p-6 relative"
              onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-text-secondary/50 hover:text-red-500 transition-all" // <-- DARK MODE FIX
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-text-primary mb-4" // <-- DARK MODE FIX
              >
                Ask a New Question
              </motion.h2>

              <form onSubmit={handleSubmit}>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question about this course..."
                  className="w-full border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-primary resize-none" // <-- DARK MODE FIX
                  rows={4}
                  disabled={loading}
                />

                <div className="flex justify-end mt-4 gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-all" // <-- DARK MODE FIX
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-white transition-all ${
                      loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-accent hover:bg-accent/90" // <-- DARK MODE FIX
                    }`}
                  >
                    <PlusCircle size={18} />
                    {loading ? "Posting..." : "Post Question"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AskQuestionModal;