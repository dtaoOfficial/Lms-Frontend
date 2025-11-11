import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ResetSettingsModal({ show, onClose, onConfirm }) {
  // We use `show` to control the AnimatePresence in the parent,
  // but for this component, we can just return the animated JSX.
  // The parent's AnimatePresence will handle the in/out.
  
  // All your logic (onClose, onConfirm) is handled by props.

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
        className="bg-secondary rounded-lg shadow-lg p-6 w-full max-w-sm border border-white/10" // <-- DARK MODE FIX
      >
        <h3 className="text-lg font-semibold text-text-primary mb-2"> {/* <-- DARK MODE FIX */}
          Reset All Settings?
        </h3>
        <p className="text-sm text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
          This will revert all settings to default values. Are you sure?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-secondary text-text-primary border border-white/10 rounded-md hover:bg-white/10 transition-colors" // <-- DARK MODE FIX
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" // (Kept semantic red)
          >
            Confirm Reset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}