import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "react-hot-toast";
import forumApi from "../../api/forum";

/**
 * 🧠 ReplyBox Component
 * Adds XP reward toast when a reply is posted successfully.
 */
const ReplyBox = ({ questionId, onAddReply }) => {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      const updatedQuestion = await forumApi.addReply(questionId, reply.trim());

      if (onAddReply && typeof onAddReply === "function") {
        onAddReply(updatedQuestion);
      }

      // ✅ Normal success + XP feedback
      toast.success("💬 Reply added successfully (+5 XP)!", {
        icon: "⚡",
      });

      setReply("");
    } catch (error) {
      console.error("❌ Failed to post reply:", error);
      toast.error(
        error?.response?.data?.error || "Failed to send reply. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 flex items-center gap-2"
    >
      <input
        type="text"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Write a reply..."
        className="flex-1 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background text-text-primary" // <-- DARK MODE FIX
        disabled={loading}
      />

      <button
        onClick={handleReply}
        disabled={loading}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-white transition-all ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-accent hover:bg-accent/90" // <-- DARK MODE FIX
        }`}
        aria-label="Send reply"
      >
        <Send size={16} />
        {loading ? "..." : "Send"}
      </button>
    </motion.div>
  );
};

export default ReplyBox;