import React, { useState } from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ResolveReportModal({ report, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("REVIEWED");

  // --- YOUR LOGIC (UNCHANGED) ---
  const handleSubmit = () => {
    onSubmit(report.id, status, note);
    onClose();
  };

  return (
    // This is the Backdrop. It will be animated by the parent's AnimatePresence
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" // <-- DARK MODE FIX
      onClick={onClose} // Close modal on backdrop click
    >
      {/* This is the Modal Panel. It has its own pop-in animation */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking the panel
        className="bg-secondary rounded-lg shadow-lg w-96 p-6 border border-white/10" // <-- DARK MODE FIX
      >
        <h2 className="text-lg font-semibold text-text-primary mb-3"> {/* <-- DARK MODE FIX */}
          Resolve Report
        </h2>
        <p className="text-sm text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
          Update status for report <strong>{report.reason}</strong>
        </p>

        <label className="block text-sm text-text-secondary mb-1">Status</label> {/* <-- DARK MODE FIX */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        >
          <option value="REVIEWED">Reviewed</option>
          <option value="CLOSED">Closed</option>
        </select>

        <label className="block text-sm text-text-secondary mb-1">Admin Note</label> {/* <-- DARK MODE FIX */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="3"
          className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 mb-3 resize-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
          placeholder="Optional note..."
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
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors" // <-- DARK MODE FIX
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}