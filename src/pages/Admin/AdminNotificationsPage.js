import React, { useState } from "react";
import { sendNotification } from "../../api/notifications";

// --- NEW IMPORTS ---
import { motion } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
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
// ---------------------------------------------

export default function AdminNotificationsPage() {
  const [target, setTarget] = useState("ALL");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const payload = {
        email: target === "CUSTOM" ? email.trim() : target,
        title,
        message,
        type: "ADMIN",
      };
      await sendNotification(payload);
      setStatus({ type: "success", msg: "✅ Notification sent successfully!" });
      setTitle("");
      setMessage("");
      setEmail("");
    } catch (err) {
      console.error("Failed to send notification:", err);
      setStatus({ type: "error", msg: "❌ Failed to send notification" });
    } finally {
      setSending(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold mb-4 text-text-primary"> {/* <-- DARK MODE FIX */}
          📢 Admin Notification Center
        </h1>
        <p className="text-text-secondary mb-6"> {/* <-- DARK MODE FIX */}
          Send notifications directly to Students, Teachers, or All Users.
        </p>
      </motion.div>

      {status && (
        <motion.div
          variants={itemVariants}
          className={`p-3 rounded mb-4 ${
            status.type === "success"
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" // <-- DARK MODE FIX
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" // <-- DARK MODE FIX
          }`}
        >
          {status.msg}
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <form
            onSubmit={handleSend}
            className="bg-secondary p-6 rounded-lg shadow border border-white/10 max-w-lg" // <-- DARK MODE FIX
          >
            {/* Target Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                Target Audience
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none" // <-- DARK MODE FIX
              >
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Teachers Only</option>
                <option value="CUSTOM">Specific User (Custom Email)</option>
              </select>
            </div>

            {/* Custom Email (if CUSTOM selected) */}
            {target === "CUSTOM" && (
              <motion.div // <-- Added animation for conditional field
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                  Target Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none" // <-- DARK MODE FIX
                />
              </motion.div>
            )}

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter notification title"
                className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none" // <-- DARK MODE FIX
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Enter notification message..."
                className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none" // <-- DARK MODE FIX
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
                sending ? "bg-gray-500 opacity-60 cursor-not-allowed" : "bg-accent hover:bg-accent/90" // <-- DARK MODE FIX
              }`}
            >
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </form>
        </ScrollAnimation>
      </motion.div>
    </motion.div>
  );
}