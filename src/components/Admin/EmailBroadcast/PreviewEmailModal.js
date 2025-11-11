import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function PreviewEmailModal({ data, onClose, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" // <-- DARK MODE FIX
      onClick={onClose} // <-- Close on backdrop click
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} // <-- Prevent closing on modal click
        className="bg-secondary rounded-lg shadow-lg p-6 w-full max-w-md border border-white/10" // <-- DARK MODE FIX
      >
        <h3 className="text-lg font-semibold mb-2 text-text-primary">📧 Preview Email</h3> {/* <-- DARK MODE FIX */}
        <p className="text-sm text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
          <strong>Subject:</strong> {data.subject}
        </p>
        
        {/* Added a max-h for long messages */}
        <div className="max-h-60 overflow-y-auto bg-background p-3 rounded-md border border-white/10 my-3"> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-text-primary whitespace-pre-wrap"> {/* <-- DARK MODE FIX */}
            {data.message}
          </p>
        </div>
        
        <p className="text-xs text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
          Target: {data.target}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors" // <-- DARK MODE FIX
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}