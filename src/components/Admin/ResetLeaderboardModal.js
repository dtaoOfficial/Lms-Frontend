import React, { useState } from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ResetLeaderboardModal({ scope, onClose, onConfirm }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (!note.trim()) {
      alert("Please enter a short note for the reset action.");
      return;
    }
    onConfirm(note);
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
          Confirm Leaderboard Reset ⚠️
        </h2>
        <p className="text-sm text-text-secondary mb-3"> {/* <-- DARK MODE FIX */}
          You are about to reset <b>{scope}</b> leaderboard data.
          <br />This action will be logged in the audit history.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Enter a short note or reason"
          className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 mb-3 resize-none text-sm focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" // (Kept semantic red)
          >
            Confirm Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}