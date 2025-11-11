import React, { useState } from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ReportModal({ onClose, onSubmit }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [reason, setReason] = useState("INAPPROPRIATE_CONTENT");
  const [text, setText] = useState("");

  const handleSubmit = () => {
    onSubmit({ reason, text });
    onClose();
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" // <-- DARK MODE FIX
      onClick={onClose} // <-- Close on backdrop click
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} // <-- Prevent closing on modal click
        className="bg-secondary rounded-lg shadow-lg w-96 p-6 border border-white/10" // <-- DARK MODE FIX
      >
        <h2 className="text-lg font-semibold text-text-primary mb-3"> {/* <-- DARK MODE FIX */}
          Report Content ⚠️
        </h2>
        <p className="text-sm text-text-secondary mb-3"> {/* <-- DARK MODE FIX */}
          Select a reason and provide optional details.
        </p>

        <label className="block text-sm mb-1 text-text-secondary">Reason</label> {/* <-- DARK MODE FIX */}
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        >
          <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
          <option value="SPAM">Spam</option>
          <option value="IRRELEVANT">Irrelevant</option>
          <option value="OTHER">Other</option>
        </select>

        <label className="block text-sm mb-1 text-text-secondary">Message</label> {/* <-- DARK MODE FIX */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="3"
          placeholder="Add more info (optional)"
          className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 mb-3 resize-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        ></textarea>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" // (Kept semantic red)
          >
            Submit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}