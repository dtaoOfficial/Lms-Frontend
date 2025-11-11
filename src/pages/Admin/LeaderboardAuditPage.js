import React, { useEffect, useState } from "react";
import { getLeaderboardAuditLogs } from "../../api/admin";
import LeaderboardAuditTable from "../../components/Admin/LeaderboardAuditTable";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- NEW IMPORTS ---
import { motion } from "framer-motion";
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

export default function LeaderboardAuditPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const fetchAudits = async () => {
    try {
      const data = await getLeaderboardAuditLogs();
      setAudits(Array.isArray(data) ? data : []);
    } catch (err) { // <-- SYNTAX ERROR FIX WAS HERE
      console.error(err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.button
        variants={itemVariants}
        onClick={() => navigate("/admin/leaderboard")}
        className="flex items-center gap-1 text-accent hover:underline mb-4 font-medium" // <-- DARK MODE FIX
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.h1 
        variants={itemVariants} 
        className="text-2xl font-bold text-text-primary mb-4" // <-- DARK MODE FIX
      >
        📜 Leaderboard Reset Audit Logs
      </motion.h1>

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {/* This component (LeaderboardAuditTable) still needs its dark mode fix inside it */}
          <LeaderboardAuditTable data={audits} loading={loading} />
        </ScrollAnimation>
      </motion.div>
    </motion.div>
  );
}