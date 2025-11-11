import React, { useEffect, useState } from "react";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  togglePublish,
  uploadExamCSV,
} from "../../api/exams";
import ExamFormModal from "../../components/Admin/Exams/ExamFormModal";
import ExamCSVUploadModal from "../../components/Admin/Exams/ExamCSVUploadModal";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
// -------------------

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
// ---------------------------------------------

export default function ManageExamsPage() {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function fetchExams() {
      try {
        setLoading(true);
        const data = await getAllExams();
        setExams(data || []);
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  const handleCreateExam = async (examData) => {
    try {
      await createExam(examData);
      const updated = await getAllExams();
      setExams(updated);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create exam:", err);
      alert("Error creating exam. Check console for details.");
    }
  };

  const handleUpdateExam = async (id, examData) => {
    try {
      await updateExam(id, examData);
      const updated = await getAllExams();
      setExams(updated);
      setShowForm(false);
      setSelectedExam(null);
    } catch (err) {
      console.error("Failed to update exam:", err);
      alert("Error updating exam. Check console for details.");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete exam:", err);
      alert("Error deleting exam. Check console for details.");
    }
  };

  const handleTogglePublish = async (id, publish) => {
    try {
      await togglePublish(id, publish);
      const updated = await getAllExams();
      setExams(updated);
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      alert("Error toggling publish state.");
    }
  };

  const handleUploadCSV = async (examId, file) => {
    try {
      await uploadExamCSV(examId, file);
      const updated = await getAllExams();
      setExams(updated);
      setShowUpload(false);
      setSelectedExam(null);
    } catch (err) {
      console.error("CSV upload failed:", err);
      alert("Error uploading CSV file. Ensure CSV format is correct.");
    }
  };
  // --- END OF LOGIC ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <p className="text-text-secondary">Loading exams...</p> {/* <-- DARK MODE FIX */}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
          🧠 Manage Exams
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedExam(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors" // <-- DARK MODE FIX
        >
          + Create Exam
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants}>
        {exams.length === 0 ? (
          <div className="text-center text-text-secondary mt-10"> {/* <-- DARK MODE FIX */}
            No exams available. Click “+ Create Exam” to add one.
          </div>
        ) : (
          <div className="overflow-x-auto bg-secondary rounded-lg shadow border border-white/10"> {/* <-- DARK MODE FIX */}
            <table className="min-w-full divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
              <thead className="bg-background"> {/* <-- DARK MODE FIX */}
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Duration (min)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Published
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider"> {/* <-- DARK MODE FIX */}
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
                <AnimatePresence>
                  {exams.map((exam, i) => (
                    <motion.tr 
                      key={exam.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-text-primary"> {/* <-- DARK MODE FIX */}
                        {exam.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        {exam.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        {exam.language}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        {exam.duration}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() =>
                            handleTogglePublish(exam.id, !exam.published)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            exam.published
                              ? "bg-green-500/10 text-green-400" // <-- DARK MODE FIX
                              : "bg-gray-500/10 text-text-secondary" // <-- DARK MODE FIX
                          }`}
                        >
                          {exam.published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowForm(true);
                          }}
                          className="text-accent hover:underline text-sm font-medium" // <-- DARK MODE FIX
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowUpload(true);
                          }}
                          className="text-blue-500 hover:underline text-sm font-medium" // <-- DARK MODE FIX
                        >
                          Upload CSV
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="text-red-500 hover:underline text-sm font-medium" // <-- DARK MODE FIX
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Exam Form Modal */}
      {/* This component is already fixed */}
      <ExamFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedExam(null);
        }}
        onSubmit={(data) =>
          selectedExam
            ? handleUpdateExam(selectedExam.id, data)
            : handleCreateExam(data)
        }
        initialData={selectedExam}
      />

      {/* CSV Upload Modal */}
      {/* This component is already fixed */}
      {showUpload && selectedExam && (
        <ExamCSVUploadModal
          isOpen={showUpload}
          onClose={() => {
            setShowUpload(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
          onUpload={(file) => handleUploadCSV(selectedExam.id, file)}
        />
      )}
    </motion.div>
  );
}