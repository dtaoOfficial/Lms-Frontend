import React, { useEffect, useState } from "react";
import {
  getForumReports,
  updateForumReportStatus,
  deleteForumReport,
} from "../../api/admin";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
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

function ForumModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // for message modal
  const [adminNote, setAdminNote] = useState(""); // note input

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const data = await getForumReports({ status: statusFilter });
      setReports(data.items || []);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    // Note: The 'prompt()' will not match the new theme.
    // For a full redesign, this prompt should be replaced with a custom modal.
    const note = prompt(
      `Enter a note for marking this report as ${newStatus}:`,
      adminNote
    );
    try {
      await updateForumReportStatus(id, { status: newStatus, adminNote: note });
      setAdminNote("");
      fetchReports();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteForumReport(id);
      fetchReports();
    } catch (err) {
      alert("Delete failed");
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Forum Moderation 🧩</h1> {/* <-- DARK MODE FIX */}
          <p className="text-text-secondary"> {/* <-- DARK MODE FIX */}
            Review and manage reported forum posts or comments.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={refreshing}
          className="px-4 py-2 bg-accent text-white rounded-md shadow hover:bg-accent/90 disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-4">
        <label className="text-sm font-medium text-text-secondary mr-2"> {/* <-- DARK MODE FIX */}
          Filter by status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-white/10 rounded px-2 py-1 text-sm bg-background text-text-primary focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        >
          <option value="OPEN">Open</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="CLOSED">Closed</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <div className="bg-secondary border border-white/10 rounded-lg shadow-sm overflow-x-auto"> {/* <-- DARK MODE FIX */}
            <table className="min-w-full text-sm">
              <thead className="bg-background text-text-secondary border-b border-white/10"> {/* <-- DARK MODE FIX */}
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Target ID</th>
                  <th className="px-4 py-2 text-left">Reporter</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="text-center py-4 text-text-secondary" colSpan="7"> {/* <-- DARK MODE FIX */}
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td className="text-center py-4 text-text-secondary" colSpan="7"> {/* <-- DARK MODE FIX */}
                      No reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/10 hover:bg-accent/10 transition" // <-- DARK MODE FIX
                    >
                      <td className="px-4 py-2 text-text-primary">{i + 1}</td>
                      <td className="px-4 py-2 text-text-secondary">{r.targetType}</td>
                      <td className="px-4 py-2 text-text-secondary">{r.targetId}</td>
                      <td className="px-4 py-2 text-text-secondary">{r.email}</td>
                      <td className="px-4 py-2 text-text-secondary">{r.reason}</td>
                      <td className="px-4 py-2 font-medium">
                        {r.status === "OPEN" ? (
                          <span className="text-red-500">OPEN</span>
                        ) : r.status === "REVIEWED" ? (
                          <span className="text-yellow-500">REVIEWED</span>
                        ) : (
                          <span className="text-green-600">CLOSED</span>
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors" // <-- DARK MODE FIX
                        >
                          View Message
                        </button>

                        {r.status === "OPEN" && (
                          <button
                            onClick={() => handleStatusChange(r.id, "REVIEWED")}
                            className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 transition-colors" // <-- DARK MODE FIX
                          >
                            Mark Reviewed
                          </button>
                        )}

                        {r.status !== "CLOSED" && (
                          <button
                            onClick={() => handleStatusChange(r.id, "CLOSED")}
                            className="px-2 py-1 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors" // <-- DARK MODE FIX
                          >
                            Close
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-2 py-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors" // <-- DARK MODE FIX
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollAnimation>
      </motion.div>

      {/* Message Modal (ANIMATED) */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="bg-secondary rounded-lg shadow-xl max-w-lg w-full p-6" // <-- DARK MODE FIX
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-2 text-text-primary"> {/* <-- DARK MODE FIX */}
                Report Details
              </h2>
              <p className="text-sm text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
                <strong>Target:</strong> {selectedReport.targetType} —{" "}
                {selectedReport.targetId}
              </p>
              <div className="bg-background border border-white/10 rounded-md p-3 mb-3"> {/* <-- DARK MODE FIX */}
                <p className="text-text-primary whitespace-pre-wrap"> {/* <-- DARK MODE FIX */}
                  {selectedReport.text || "(No message provided)"}
                </p>
              </div>

              <div className="mt-3">
                <label className="text-sm font-medium text-text-secondary"> {/* <-- DARK MODE FIX */}
                  Admin Note (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 mt-1 text-sm focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  rows={3}
                  placeholder="Add your note here..."
                />
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                {selectedReport.status === "OPEN" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedReport.id, "REVIEWED");
                      setSelectedReport(null);
                    }}
                    className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 transition-colors" // <-- DARK MODE FIX
                  >
                    Mark Reviewed
                  </button>
                )}
                {selectedReport.status !== "CLOSED" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedReport.id, "CLOSED");
                      setSelectedReport(null);
                    }}
                    className="px-3 py-1 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors" // <-- DARK MODE FIX
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- BUG FIX: ADDED THIS LINE ---
export default ForumModerationPage;