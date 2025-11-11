import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthToken, setAuthToken } from "../../api";
import ExamResultSummary from "../../components/Student/Exams/ExamResultSummary";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getExamResult } from "../../api/studentExams";


// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
import { toast } from "react-hot-toast";
import api from "../../api";
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

export default function ExamResultPage() {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef();
  const [loading, setLoading] = useState(true); // <-- Added loading state from your logic

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const ensureAuth = () => {
    const token = getAuthToken();
    if (!token) {
      alert("⚠️ Your session expired. Please log in again.");
      navigate("/login");
      return false;
    }
    setAuthToken(token);
    return true;
  };

  useEffect(() => {
    async function load() {
      try {
        if (!ensureAuth()) return;
        setLoading(true); // <-- Set loading true
        const data = await getExamResult(examId);
        setResult(data);
      } catch (err) {
        console.error("❌ Failed to load exam result:", err);
        alert(err?.response?.data?.message || "Failed to load result");
      } finally {
        setLoading(false); // <-- Set loading false
      }
    }
    load();
  }, [examId, navigate]); // <-- Added navigate to dependencies

  // 🔹 PDF Report Generator (UPDATED FOR DARK MODE)
  const handleDownloadPDF = async () => {
    const element = document.getElementById("student-report");
    if (!element) return;

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // <-- DARK MODE FIX
      onclone: (doc) => {
        // This is needed to make sure text colors are correct in the PDF
        if (isDarkMode) {
          doc.getElementById("student-report").classList.add('dark-pdf-export');
        }
      }
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.setFontSize(10);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()} — Powered by DTAO LMS`,
      10,
      pageHeight - 10
    );
    pdf.save(
      `${result.examName}_${result.studentName || "Student"}_Result.pdf`
    );
  };
  // --- END OF LOGIC ---

  if (loading) { // <-- Use loading state
    return (
      <div className="p-8 text-center text-text-secondary text-lg">
        Loading student details...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Student not found.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <motion.div variants={itemVariants} className="flex justify-end gap-3 mb-4">
          <button
            onClick={() => navigate("/student/exams")}
            className="bg-secondary text-text-primary border border-white/10 px-4 py-2 rounded-md hover:bg-white/10 transition-colors" // <-- DARK MODE FIX
          >
            ← Back
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            📄 Download PDF
          </button>
        </motion.div>

        {/* Printable Report */}
        <motion.div 
          variants={itemVariants} 
          ref={reportRef} 
          className="bg-secondary rounded-xl p-6 shadow-lg border border-white/10" // <-- DARK MODE FIX
          id="student-report"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4"> {/* <-- DARK MODE FIX */}
            <div>
              <h1 className="text-2xl font-bold text-text-primary"> {/* <-- DARK MODE FIX */}
                🏫 DTAO Learning Portal
              </h1>
              <p className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                Student Exam Performance Report
              </p>
            </div>
            {/* You can replace this with your actual logo if you have it in /src/assets */}
            {/* <img src="/logo192.png" alt="Logo" className="w-12 h-12 object-contain" /> */}
          </div>

          {/* Student Info */}
          <div className="bg-background rounded-lg p-4 mb-6 border border-white/10"> {/* <-- DARK MODE FIX */}
            <h3 className="font-semibold text-text-primary mb-2"> {/* <-- DARK MODE FIX */}
              👤 Student Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
              <p>
                <strong>Name:</strong> {result.studentName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {result.studentEmail || "N/A"}
              </p>
              <p>
                <strong>Exam:</strong> {result.examName}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(result.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Summary (This component will still be white) */}
          <ExamResultSummary result={result} />

          {/* Review Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowReview(!showReview)}
              className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition-colors" // <-- DARK MODE FIX
            >
              {showReview ? "Hide Review" : "🧾 Review Your Answers"}
            </button>
          </div>

          {/* Review Section */}
          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-8 bg-background p-4 rounded-lg shadow-inner border border-white/10 overflow-hidden" // <-- DARK MODE FIX
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-text-primary"> {/* <-- DARK MODE FIX */}
                  🧠 Review Answers
                </h3>

                <AnimatePresence>
                  {result.answers?.map((a, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border border-white/10 bg-secondary rounded-lg p-4 mb-4" // <-- DARK MODE FIX
                    >
                      <p className="font-medium text-text-primary mb-1"> {/* <-- DARK MODE FIX */}
                        {idx + 1}. {a.questionText || "Question text missing"}
                      </p>
                      <p className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        <strong>Your Answer:</strong>{" "}
                        <span
                          className={a.correct ? "text-green-500" : "text-red-500"}
                        >
                          {a.selectedOption || "Not answered"}
                        </span>
                      </p>
                      <p className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        <strong>Correct Answer:</strong>{" "}
                        <span className="text-accent"> {/* <-- DARK MODE FIX */}
                          {a.correctAnswer || "N/A"}
                        </span>
                      </p>
                      {a.explanation && (
                        <p className="text-sm text-text-secondary mt-1"> {/* <-- DARK MODE FIX */}
                          💡 <strong>Explanation:</strong> {a.explanation}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-text-secondary border-t border-white/10 pt-3"> {/* <-- DARK MODE FIX */}
            <p>Generated by DTAO LMS © {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}