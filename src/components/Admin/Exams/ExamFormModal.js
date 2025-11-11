import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function ExamFormModal({ isOpen, onClose, onSubmit, initialData }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [form, setForm] = useState({
    name: "",
    type: "MCQ",
    language: "General",
    startDate: "",
    endDate: "",
    duration: 30,
    published: false,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "MCQ",
        language: initialData.language || "General",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 16)
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 16)
          : "",
        duration: initialData.duration || 30,
        published: initialData.published || false,
      });
    } else {
      // Reset form when opening for "Create New"
      setForm({
        name: "",
        type: "MCQ",
        language: "General",
        startDate: "",
        endDate: "",
        duration: 30,
        published: false,
      });
    }
  }, [initialData, isOpen]); // <-- Run effect when isOpen changes too

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        ...form,
        duration: parseInt(form.duration, 10),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      });
      // onClose(); // Let parent handle close on success
    } catch (err) {
      console.error("Exam form submission error:", err);
    } finally {
      setSubmitting(false);
    }
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
            className="bg-secondary rounded-xl shadow-lg w-full max-w-lg p-6 relative border border-white/10" // <-- DARK MODE FIX
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4"> {/* <-- DARK MODE FIX */}
              <h2 className="text-xl font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
                {initialData ? "Edit Exam" : "Create New Exam"}
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary text-2xl font-bold" // <-- DARK MODE FIX
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                  Exam Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                />
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                  Exam Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                >
                  <option value="MCQ">MCQ</option>
                  <option value="CODING">CODING</option>
                  <option value="DEBUG">DEBUG</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                  Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                >
                  <option value="General">General</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
              </div>

              {/* Start / End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-white/10 bg-background text-text-primary rounded-lg focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center">
                <input
                  id="published"
                  type="checkbox"
                  name="published"
                  checked={form.published}
                  onChange={handleChange}
                  className="h-4 w-4 text-accent focus:ring-accent border-white/10 bg-background rounded" // <-- DARK MODE FIX
                />
                <label htmlFor="published" className="ml-2 text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                  Publish exam immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-4"> {/* <-- DARK MODE FIX */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    submitting
                      ? "bg-accent/50 cursor-not-allowed"
                      : "bg-accent hover:bg-accent/90"
                  }`} // <-- DARK MODE FIX
                >
                  {submitting ? "Saving..." : initialData ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}