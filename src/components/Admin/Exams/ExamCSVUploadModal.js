import React, { useState } from "react";
import ExamPreviewTable from "./ExamPreviewTable";
import useCSVUploader from "../../../hooks/useCSVUploader";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function ExamCSVUploadModal({ isOpen, onClose, exam, onUpload }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const { previewData, error, parseCSV, resetCSV } = useCSVUploader();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    parseCSV(selected);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first.");
    try {
      setUploading(true);
      await onUpload(file);
      setUploading(false);
      resetCSV();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check CSV format and try again.");
      setUploading(false);
    }
  };

  const handleClose = () => {
    resetCSV();
    setFile(null);
    onClose();
  };
  // --- END OF LOGIC ---

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4" // <-- DARK MODE FIX
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
            className="bg-secondary rounded-xl shadow-lg w-full max-w-2xl p-6 relative border border-white/10" // <-- DARK MODE FIX
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4"> {/* <-- DARK MODE FIX */}
              <h2 className="text-lg font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
                Upload CSV for Exam:{" "}
                <span className="text-accent">{exam?.name}</span> {/* <-- DARK MODE FIX */}
              </h2>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary text-2xl font-bold" // <-- DARK MODE FIX
              >
                ×
              </button>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                Choose CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" // <-- DARK MODE FIX
              />
              <p className="text-xs text-text-secondary mt-1"> {/* <-- DARK MODE FIX */}
                Expected headers: <b>question, optionA, optionB, optionC, optionD, answer, explanation</b>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-2 rounded mb-3"> {/* <-- DARK MODE FIX */}
                {error}
              </div>
            )}

            {/* Preview (This table component will still be white) */}
            {previewData.length > 0 && (
              <div className="mb-4 max-h-64 overflow-y-auto border border-white/10 rounded-lg"> {/* <-- DARK MODE FIX */}
                <ExamPreviewTable questions={previewData} />
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10 mt-4"> {/* <-- DARK MODE FIX */}
              <button
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  uploading
                    ? "bg-accent/50 cursor-not-allowed"
                    : "bg-accent hover:bg-accent/90"
                }`} // <-- DARK MODE FIX
              >
                {uploading ? "Uploading..." : "Upload CSV"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}