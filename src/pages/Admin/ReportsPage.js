import React, { useEffect, useState, useCallback } from "react"; // <-- NEW: Added useCallback
import { getAdminReports, deleteAdminReport, updateAdminReportStatus } from "../../api/admin";
import ReportTabs from "./ReportTabs";
import ReportCard from "./ReportCard";
import ResolveReportModal from "./ResolveReportModal";

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

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("OPEN");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- BUG FIX: Wrap fetchReports in useCallback ---
  const fetchReports = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getAdminReports({ status: filter });
      setReports(res.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]); // <-- Add filter as a dependency
  // --------------------------------------------------

  // --- BUG FIX: Add fetchReports to dependency array ---
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  // --------------------------------------------------

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    await deleteAdminReport(id);
    fetchReports();
  };

  const handleResolve = async (id, status, note) => {
    await updateAdminReportStatus(id, { status, note });
    fetchReports();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Reports & Flag Handling 🚨</h1> {/* <-- DARK MODE FIX */}
        <button
          onClick={fetchReports}
          disabled={refreshing}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        {/* This component (ReportTabs) still needs its dark mode fix inside it */}
        <ReportTabs filter={filter} setFilter={setFilter} />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <ScrollAnimation>
          {loading ? (
            <p className="text-text-secondary mt-4">Loading reports...</p> // <-- DARK MODE FIX
          ) : reports.length === 0 ? (
            <p className="text-text-secondary mt-4 italic">No reports found.</p> // <-- DARK MODE FIX
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {reports.map((r) => (
                  <motion.div
                    key={r.id}
                    layout // <-- Animates list when items are removed
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <ReportCard
                      report={r}
                      onDelete={() => handleDelete(r.id)}
                      onResolve={() => setSelectedReport(r)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollAnimation>
      </motion.div>

      {/* --- ANIMATED MODAL --- */}
      <AnimatePresence>
        {selectedReport && (
          // This component (ResolveReportModal) still needs its dark mode fix inside it
          <ResolveReportModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onSubmit={handleResolve}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}