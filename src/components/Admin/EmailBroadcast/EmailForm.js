import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function EmailForm({ onSend }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [customRecipients, setCustomRecipients] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      subject,
      message,
      target,
      recipients:
        target === "CUSTOM"
          ? customRecipients
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
    };
    onSend(payload);
  };
  // --- END OF LOGIC ---

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-secondary shadow-md rounded-lg p-6 border border-white/10" // <-- DARK MODE FIX
    >
      <h2 className="text-lg font-semibold mb-4 text-text-primary">Compose Broadcast Email</h2> {/* <-- DARK MODE FIX */}

      <div className="mb-3">
        <label className="block text-sm font-medium text-text-secondary">Subject</label> {/* <-- DARK MODE FIX */}
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 mt-1 focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
          placeholder="Enter email subject"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-text-secondary">Message</label> {/* <-- DARK MODE FIX */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 mt-1 h-32 focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
          placeholder="Write your message..."
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-text-secondary"> {/* <-- DARK MODE FIX */}
          Send To
        </label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 mt-1 focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
        >
          <option value="ALL">All Users</option>
          <option value="STUDENT">Students Only</option>
          <option value="TEACHER">Teachers Only</option>
          <option value="CUSTOM">Custom Emails</option>
        </select>
      </div>

      {/* --- NEW: ANIMATED CONDITIONAL FIELD --- */}
      <AnimatePresence>
        {target === "CUSTOM" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <label className="block text-sm font-medium text-text-secondary"> {/* <-- DARK MODE FIX */}
              Custom Recipients (comma-separated)
            </label>
            <textarea
              value={customRecipients}
              onChange={(e) => setCustomRecipients(e.target.value)}
              className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 mt-1 h-20 focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
              placeholder="example1@gmail.com, example2@gmail.com"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md transition-colors" // <-- DARK MODE FIX
      >
        Preview & Send
      </motion.button>
    </form>
  );
}