import React, { useEffect, useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";

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

export default function AdminNotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notifications/all");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await api.delete(`/api/notifications/${id}`);
      toast.success("Notification deleted");
      loadNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (item) => setEditing(item);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/notifications/${editing.id}`, {
        title: editing.title,
        message: editing.message,
        type: editing.type,
      });
      toast.success("Notification updated");
      setEditing(null);
      loadNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("This will delete ALL notifications. Continue?")) return;
    try {
      await api.delete("/api/notifications/clear");
      toast.success("All notifications cleared");
      loadNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear all");
    }
  };
  // --- END OF LOGIC ---

  if (loading)
    return <div className="p-6 text-text-secondary">Loading notifications...</div>; // <-- DARK MODE FIX

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-text-primary">📜 Notification History</h1> {/* <-- DARK MODE FIX */}
        <button
          onClick={handleClearAll}
          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors" // (Kept semantic red)
        >
          Clear All
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {notifications.length === 0 ? (
            <div className="text-text-secondary">No notifications found.</div> // <-- DARK MODE FIX
          ) : (
            <div className="bg-secondary shadow border border-white/10 rounded-lg overflow-x-auto"> {/* <-- DARK MODE FIX */}
              <table className="min-w-full text-sm text-left">
                <thead className="bg-background text-text-secondary uppercase"> {/* <-- DARK MODE FIX */}
                  <tr>
                    <th className="px-4 py-2 border-b border-white/10">Title</th>
                    <th className="px-4 py-2 border-b border-white/10">Message</th>
                    <th className="px-4 py-2 border-b border-white/10">Type</th>
                    <th className="px-4 py-2 border-b border-white/10">User</th>
                    <th className="px-4 py-2 border-b border-white/10">Created</th>
                    <th className="px-4 py-2 text-center border-b border-white/10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} className="border-t border-white/10 hover:bg-accent/10"> {/* <-- DARK MODE FIX */}
                      <td className="px-4 py-2 text-text-primary">{n.title}</td>
                      <td className="px-4 py-2 text-text-secondary">{n.message}</td>
                      <td className="px-4 py-2 text-text-secondary">{n.type}</td>
                      <td className="px-4 py-2 text-text-secondary">{n.userEmail}</td>
                      <td className="px-4 py-2 text-text-secondary">
                        {new Date(n.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(n)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScrollAnimation>
      </motion.div>

      {/* ✏️ Edit Modal (ANIMATED) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setEditing(null)} // Close on backdrop click
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onSubmit={handleUpdate}
              className="bg-secondary p-6 rounded-lg shadow-lg w-96" // <-- DARK MODE FIX
              onClick={(e) => e.stopPropagation()} // Prevent closing on form click
            >
              <h2 className="text-lg font-semibold mb-4 text-text-primary">Edit Notification</h2> {/* <-- DARK MODE FIX */}
              <label className="block text-sm mb-1 text-text-secondary">Title</label> {/* <-- DARK MODE FIX */}
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full border border-white/10 rounded-md px-3 py-2 mb-3 bg-background text-text-primary focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
              <label className="block text-sm mb-1 text-text-secondary">Message</label> {/* <-- DARK MODE FIX */}
              <textarea
                rows={3}
                value={editing.message}
                onChange={(e) =>
                  setEditing({ ...editing, message: e.target.value })
                }
                className="w-full border border-white/10 rounded-md px-3 py-2 mb-3 bg-background text-text-primary focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors" // <-- DARK MODE FIX
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-accent hover:bg-accent/90 text-white transition-colors" // <-- DARK MODE FIX
                >
                  Update
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}