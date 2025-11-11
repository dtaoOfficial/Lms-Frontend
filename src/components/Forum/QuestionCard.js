import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Flag } from "lucide-react"; // <-- NEW IMPORT
import ReplyBox from "./ReplyBox";
import ReportModal from "./ReportModal";
import { reportForumQuestion, reportForumReply } from "../../api/forum";

const QuestionCard = ({ question, onAddReply }) => {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [expanded, setExpanded] =useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const handleReplyAdded = (updatedQuestion) => {
    if (onAddReply && typeof onAddReply === "function") {
      onAddReply(updatedQuestion);
    }
  };

  const handleReport = async (payload) => {
    try {
      if (reportTarget?.type === "question") {
        await reportForumQuestion(reportTarget.id, payload);
      } else if (reportTarget?.type === "reply") {
        await reportForumReply(reportTarget.id, payload);
      }
    } catch (_) {}
  };
  // --- END OF LOGIC ---

  return (
    <>
      <motion.div
        layout
        // Removed initial/animate/exit, as the parent list (ForumPage) now handles this
        transition={{ duration: 0.25 }}
        className="bg-secondary border border-white/10 rounded-xl shadow-sm p-4 mb-4" // <-- DARK MODE FIX
      >
        {/* Question Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
              {question?.questionText || "Untitled Question"}
            </h3>
            <p className="text-sm text-text-secondary truncate"> {/* <-- DARK MODE FIX */}
              Asked by: {question?.userEmail || "Anonymous"}
            </p>
            <button
              onClick={() =>
                setReportTarget({ type: "question", id: question?.id })
              }
              className="text-xs text-red-500 hover:underline mt-1 flex items-center gap-1"
            >
              <Flag size={12} /> Report
            </button>
          </div>

          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="ml-4 text-text-secondary hover:text-accent transition-colors" // <-- DARK MODE FIX
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Replies Section */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="replies"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3"
            >
              <div className="border-t border-white/10 pt-3 space-y-3"> {/* <-- DARK MODE FIX */}
                {Array.isArray(question?.replies) && question.replies.length > 0 ? (
                  question.replies.map((reply, idx) => (
                    <motion.div
                      key={reply.id || idx}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }} // Stagger replies
                      className="bg-background rounded-lg p-3 border border-white/10" // <-- DARK MODE FIX
                    >
                      <p className="text-text-primary text-sm"> {/* <-- DARK MODE FIX */}
                        {reply?.replyText || "—"}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-text-secondary"> {/* <-- DARK MODE FIX */}
                          — {reply?.userEmail || "User"}
                        </p>
                        <button
                          onClick={() =>
                            setReportTarget({ type: "reply", id: reply?.id })
                          }
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                           <Flag size={12} /> Report
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                    No replies yet. Be the first!
                  </p>
                )}
              </div>

              {/* Reply Box */}
              <div className="mt-4">
                {/* This component (ReplyBox) still needs its dark mode fix */}
                <ReplyBox
                  questionId={question?.id}
                  onAddReply={handleReplyAdded}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* This component (ReportModal) still needs its dark mode fix */}
      {reportTarget && (
        <ReportModal
          onClose={() => setReportTarget(null)}
          onSubmit={handleReport}
        />
      )}
    </>
  );
};

export default QuestionCard;