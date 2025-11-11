import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamInstructionsModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Exam Instructions
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>Once started, timer will begin immediately.</li>
            <li>Do not close the browser or refresh the page.</li>
            <li>Each question has one correct answer.</li>
            <li>Submit your answers before time ends.</li>
          </ul>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Begin Exam
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
