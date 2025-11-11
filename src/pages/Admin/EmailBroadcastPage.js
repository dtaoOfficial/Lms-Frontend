import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import emailApi from "../../api/emailApi";
import EmailForm from "../../components/Admin/EmailBroadcast/EmailForm";
import EmailHistoryTable from "../../components/Admin/EmailBroadcast/EmailHistoryTable";
import PreviewEmailModal from "../../components/Admin/EmailBroadcast/PreviewEmailModal";

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

export default function EmailBroadcastPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  async function loadHistory() {
    try {
      setLoading(true);
      const res = await emailApi.getEmailHistory();
      setHistory(res.data || []);
    } catch (e) {
      toast.error("Failed to load email history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (payload) => {
    setPreview(payload); // open preview modal first
  };

  const confirmSend = async (payload) => {
    try {
      toast.loading("Sending broadcast...");
      await emailApi.sendEmail(payload);
      toast.dismiss();
      toast.success("Emails sent successfully!");
      loadHistory();
      setPreview(null);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to send emails");
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 max-w-6xl mx-auto bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.h1 
        variants={itemVariants} 
        className="text-2xl font-bold text-text-primary mb-6" // <-- DARK MODE FIX
      >
        📧 Email Broadcast
      </motion.h1>

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {/* This component (EmailForm) still needs its dark mode fix inside it */}
          <EmailForm onSend={handleSend} />
        </ScrollAnimation>
      </motion.div>

      <motion.hr 
        variants={itemVariants} 
        className="my-6 border-white/10" // <-- DARK MODE FIX
      />

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {/* This component (EmailHistoryTable) still needs its dark mode fix inside it */}
          <EmailHistoryTable
            history={history}
            loading={loading}
            onDelete={async (id) => {
              try {
                await emailApi.deleteEmail(id);
                toast.success("Deleted log");
                loadHistory();
              } catch {
                toast.error("Failed to delete log");
              }
            }}
          />
        </ScrollAnimation>
      </motion.div>

      {/* This component (PreviewEmailModal) still needs its dark mode fix inside it */}
      {preview && (
        <PreviewEmailModal
          data={preview}
          onClose={() => setPreview(null)}
          onConfirm={() => confirmSend(preview)}
        />
      )}
    </motion.div>
  );
}