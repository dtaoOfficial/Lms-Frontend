import React, { useEffect, useState, useRef } from "react";
import { getMyNotifications, markAsRead, markAllAsRead } from "../../api/notifications";
import NotificationItem from "./NotificationItem";
import useNotificationsSocket from "../../hooks/useNotificationsSocket";
import { toast } from "react-hot-toast";
import notificationSound from "../../assets/notify.mp3"; // 🎵 add notify.mp3 in src/assets folder

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom"; // <-- NEW: Replaced <a> with <Link>
// -------------------

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
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
    loadNotifications();
  };

  const handleItemClick = async (item) => {
    await markAsRead(item.id);
    loadNotifications();
  };

  // 🧩 WebSocket listener — live updates
  useNotificationsSocket((data) => {
    try {
      // play sound
      const audio = new Audio(notificationSound);
      audio.play().catch(() => {});

      // --- DARK MODE FIX for toast ---
      toast(`${data.title || "Notification"}: ${data.message}`, {
        icon: "🔔",
        style: {
          background: "rgb(var(--color-bg-secondary))",
          color: "rgb(var(--color-text-primary))",
          border: "1px solid rgb(var(--color-accent) / 0.5)",
          fontSize: "0.9rem",
          borderRadius: "10px",
        },
      });
      // -----------------------------

      // update instantly
      setNotifications((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Error handling live notification:", err);
    }
  });

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  // --- END OF LOGIC ---

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Icon */}
      <button
        className="relative p-2 rounded-full text-text-primary hover:bg-white/10 focus:outline-none transition-colors" // <-- DARK MODE FIX
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} /> {/* <-- NEW ICON */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" // <-- Sized for consistency
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-secondary rounded-lg shadow-lg border border-white/10 z-50" // <-- DARK MODE FIX
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10"> {/* <-- DARK MODE FIX */}
              <h3 className="text-sm font-semibold text-text-primary">Notifications</h3> {/* <-- DARK MODE FIX */}
              {unreadCount > 0 && ( // <-- Hide button if no unread
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-accent hover:underline" // <-- DARK MODE FIX
                >
                  Mark all read
                </button>
              )}
            </div>

            {loading ? (
              <div className="p-4 text-sm text-text-secondary">Loading...</div> // <-- DARK MODE FIX
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-text-secondary">No notifications yet.</div> // <-- DARK MODE FIX
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* NotificationItem will still be white, needs its own fix */}
                {notifications.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            )}

            <div className="p-2 text-center border-t border-white/10"> {/* <-- DARK MODE FIX */}
              <Link // <-- NEW: Use <Link>
                to="/student/notifications"
                className="text-xs text-accent hover:underline" // <-- DARK MODE FIX
                onClick={() => setOpen(false)}
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}