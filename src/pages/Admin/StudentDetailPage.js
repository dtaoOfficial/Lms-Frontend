import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"; // <-- NEW
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import api from "../../api";
import ScrollAnimation from "../../components/ScrollAnimation";

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

// --- NEW: Animation Component for Numbers ---
function NumberAnimation({ value, prefix = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${prefix}${Math.round(latest)}`);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}
// ---------------------------------------------

export default function StudentDetailPage() {
  const { email } = useParams();
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        setLoading(true);
        const [profileRes, examsRes, coursesRes] = await Promise.all([
          api.get(`/api/admin/student/${email}`),
          api.get(`/api/admin/student/${email}/exams`),
          api.get(`/api/admin/student/${email}/courses`),
        ]);
        setStudent(profileRes.data || {});
        setExams(examsRes.data || []);
        setCourses(coursesRes.data || []);
      } catch (err) {
        console.error("Error fetching student details:", err);
        toast.error("Failed to load student details");
      } finally {
        setLoading(false);
      }
    }
    fetchStudentDetails();
  }, [email]);

  const handleDownloadReport = async () => {
    const element = document.getElementById("student-report");
    if (!element) return;
    const canvas = await html2canvas(element, { 
      scale: 2,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#FFFFFF' // Handle dark/light mode background
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${student.name || "student"}_report.pdf`);
  };
  // --- END OF LOGIC ---

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary text-lg">
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-text-secondary">
        Student not found.
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants} // <-- ANIMATION
      initial="hidden" // <-- ANIMATION
      animate="visible" // <-- ANIMATION
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            👤 Student Details
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium shadow transition-colors" // (Kept semantic green)
            >
              📄 Download Report
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg text-white font-medium shadow transition-colors" // <-- DARK MODE FIX
            >
              ← Back
            </button>
          </div>
        </motion.div>

        {/* Profile Card (INSIDE THE PDF-EXPORT DIV) */}
        <div id="student-report">
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <div className="bg-secondary border border-white/10 rounded-xl p-6 shadow mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">
                      {student.name || "Unnamed Student"}
                    </h2>
                    <p className="text-text-secondary mb-2">📧 {student.email}</p>
                    <p className="text-text-secondary mb-2">
                      🏫 Department: {student.department || "N/A"}
                    </p>
                    <p className="text-text-secondary mb-2">
                      📱 Phone: {student.phone || "N/A"}
                    </p>
                    <p className="text-text-secondary">
                      🧾 Joined:{" "}
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex-1 text-center">
                        <p className="text-sm text-text-secondary">🏆 Rank</p>
                        <p className="text-2xl font-bold text-accent">
                          <NumberAnimation value={student.rank || 0} prefix="#"/> {/* <-- ANIMATION */}
                        </p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex-1 text-center">
                        <p className="text-sm text-text-secondary">💎 XP Points</p>
                        <p className="text-2xl font-bold text-purple-400">
                          <NumberAnimation value={student.xp ?? 0} /> {/* <-- ANIMATION */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </motion.div>

          {/* Exams Table */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <div className="bg-secondary border border-white/10 rounded-xl p-6 shadow mb-8">
                <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center gap-2">
                  🧠 Exams & Scores
                </h2>
                {exams.length === 0 ? (
                  <p className="text-text-secondary text-sm">
                    No exams attempted yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="bg-background text-text-secondary border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Exam</th>
                          <th className="px-4 py-3 text-left font-semibold">Score</th>
                          <th className="px-4 py-3 text-left font-semibold">Total Marks</th>
                          <th className="px-4 py-3 text-left font-semibold">Percentage</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        <AnimatePresence>
                          {exams.map((exam, i) => (
                            <motion.tr 
                              key={exam._id || i}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="hover:bg-white/5 transition"
                            >
                              <td className="px-4 py-2 text-text-primary">
                                {exam.title || exam.name}
                              </td>
                              <td className="px-4 py-2 text-text-secondary">
                                {exam.score ?? 0}
                              </td>
                              <td className="px-4 py-2 text-text-secondary">
                                {exam.totalMarks ?? 0}
                              </td>
                              <td className="px-4 py-2 text-green-400 font-medium">
                                {exam.percentage
                                  ? `${exam.percentage.toFixed(1)}%`
                                  : "0%"}
                              </td>
                              <td className="px-4 py-2 text-text-secondary">
                                {exam.status || "—"}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ScrollAnimation>
          </motion.div>

          {/* Courses Table */}
          <motion.div variants={itemVariants}>
            <ScrollAnimation>
              <div className="bg-secondary border border-white/10 rounded-xl p-6 shadow mb-8">
                <h2 className="text-xl font-semibold mb-4 text-text-primary flex items-center gap-2">
                  📘 Enrolled Courses
                </h2>
                {courses.length === 0 ? (
                  <p className="text-text-secondary text-sm">No courses enrolled.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="bg-background text-text-secondary border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Course</th>
                          <th className="px-4 py-3 text-left font-semibold">Progress %</th>
                          <th className="px-4 py-3 text-left font-semibold">Videos Completed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        <AnimatePresence>
                          {courses.map((course, i) => (
                            <motion.tr 
                              key={course._id || i}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="hover:bg-white/5 transition"
                            >
                              <td className="px-4 py-2 text-text-primary">
                                {course.title || course.name}
                              </td>
                              <td className="px-4 py-2 text-purple-400 font-medium">
                                {course.progressPercent
                                  ? `${course.progressPercent.toFixed(1)}%`
                                  : "0%"}
                              </td>
                              <td className="px-4 py-2 text-text-secondary">
                                {course.completedVideos ?? 0}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ScrollAnimation>
          </motion.div>
        </div> {/* End of #student-report div */}
      </div>
    </motion.div>
  );
}