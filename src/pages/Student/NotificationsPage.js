import React, { useEffect, useState } from "react";
import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../../api/notifications";
import NotificationItem from "../../components/Notifications/NotificationItem";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const loadData = async () => {
    try {
      // Set loading true only if it's not the initial load
      // This prevents the whole list from disappearing
      // setLoading(true); 
      const data = await getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    loadData();
  };

  const handleMarkSingle = async (id) => {
    // Optimistic UI update: remove from list immediately
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Then call API
    await markAsRead(id);
    // No need to call loadData() unless the API call fails
  };

  useEffect(() => {
    loadData();
  }, []);
  // --- END OF LOGIC ---

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">🔔 My Notifications</h1> {/* <-- DARK MODE FIX */}
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-accent hover:underline font-medium" // <-- DARK MODE FIX
          >
            Mark all as read
          </button>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="text-text-secondary">Loading notifications...</div> // <-- DARK MODE FIX
        ) : notifications.length === 0 ? (
          <div className="text-text-secondary">No notifications found.</div> // <-- DARK MODE FIX
        ) : (
          <div className="bg-secondary rounded-lg shadow border border-white/10"> {/* <-- DARK MODE FIX */}
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout // <-- Animates list as items are removed
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0 }} // <-- Slide-out animation
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* This component (NotificationItem) still needs its dark mode fix inside it */}
                  <NotificationItem
                    item={n}
                    onClick={() => handleMarkSingle(n.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}