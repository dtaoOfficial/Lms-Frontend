import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
// -------------------

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 10-1.414 1.415l4 4a1 1 0 001.414 0l8-8z"
      clipRule="evenodd"
    />
  </svg>
);
const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// --- UPDATED Toasts component ---
function Toasts({ list, remove }) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout // Animates position when other toasts are removed
            className="bg-secondary shadow-lg rounded-lg p-3 max-w-sm border border-white/10" // <-- DARK MODE FIX
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-text-primary">{t.title}</div> {/* <-- DARK MODE FIX */}
                {t.message && (
                  <div className="text-sm text-text-secondary mt-1">{t.message}</div> // <-- DARK MODE FIX
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-text-secondary/50 hover:text-text-secondary" // <-- DARK MODE FIX
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

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


export default function PendingEnrollments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [modal, setModal] = useState({ open: false, id: null, action: null });
  const [note, setNote] = useState("");
  const [toasts, setToasts] = useState([]);
  const [coursesCache, setCoursesCache] = useState({});

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const pushToast = useCallback((title, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);
  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/enrollments?status=PENDING");
      const data = res.data || [];
      setList(data);

      const uniqueIds = [...new Set(data.map((d) => d.courseId))];
      const cache = {};
      await Promise.all(
        uniqueIds.map(async (cid) => {
          try {
            const r = await api.get(`/api/courses/${cid}`);
            cache[cid] = r.data;
          } catch {
            cache[cid] = null;
          }
        })
      );
      setCoursesCache(cache);
    } catch (e) {
      console.error(e);
      pushToast("Error", "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  useEffect(() => {
    const socket = new SockJS(
      `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/ws`
    );
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe("/topic/enrollments", () => {
          pushToast("🔔 New Enrollment", "A new student enrollment request arrived!");
          loadPending();
        });
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [loadPending, pushToast]);

  const openModal = (id, action) => setModal({ open: true, id, action });
  const closeModal = () => {
    setModal({ open: false, id: null, action: null });
    setNote(""); // Clear note on close
  }

  const performAction = async () => {
    const { id, action } = modal;
    if (!id) return;
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      const endpoint = `/api/admin/enrollments/${id}/${action}`;
      await api.put(endpoint, note ? { note } : {});
      pushToast("Success", `Enrollment ${action}d`);
      setList((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      pushToast("Error", "Operation failed");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
      closeModal();
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto p-6 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <Toasts list={toasts} remove={removeToast} />

      <motion.div variants={itemVariants} className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pending Enrollments</h1> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
            Review and approve or reject student requests
          </p>
        </div>
        <button
          onClick={loadPending}
          className="px-3 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors" // <-- DARK MODE FIX
        >
          Refresh
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          {loading ? (
            <div className="text-text-secondary">Loading...</div> // <-- DARK MODE FIX
          ) : list.length === 0 ? (
            <div className="text-text-secondary">No pending enrollments</div> // <-- DARK MODE FIX
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {list.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }} // Slide left on remove
                    layout // Animate position
                    className="bg-secondary rounded-lg shadow p-4 flex items-center justify-between border border-white/10" // <-- DARK MODE FIX
                  >
                    <div>
                      <div className="font-medium text-text-primary">{e.email}</div> {/* <-- DARK MODE FIX */}
                      <div className="text-sm text-text-secondary"> {/* <-- DARK MODE FIX */}
                        Course:{" "}
                        <span className="font-medium text-text-primary"> {/* <-- DARK MODE FIX */}
                          {coursesCache[e.courseId]?.title || e.courseId}
                        </span>
                        {e.createdAt && (
                          <span className="ml-3 text-xs text-text-secondary/70"> {/* <-- DARK MODE FIX */}
                            requested {new Date(e.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openModal(e.id, "approve")}
                        disabled={!!actionLoading[e.id]}
                        className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-1 hover:bg-green-700 transition-colors"
                      >
                        <CheckIcon /> Approve
                      </button>
                      <button
                        onClick={() => openModal(e.id, "reject")}
                        disabled={!!actionLoading[e.id]}
                        className="px-3 py-2 rounded bg-red-500/10 text-red-500 flex items-center gap-1 hover:bg-red-500/20 transition-colors" // <-- DARK MODE FIX
                      >
                        <XIcon /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollAnimation>
      </motion.div>

      {/* --- ANIMATED MODAL --- */}
      <AnimatePresence>
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="bg-secondary rounded-lg shadow-lg p-4 w-full max-w-md border border-white/10" // <-- DARK MODE FIX
            >
              <h3 className="font-semibold mb-2 capitalize text-text-primary">{modal.action} Enrollment</h3> {/* <-- DARK MODE FIX */}
              <textarea
                className="w-full border border-white/10 rounded p-2 mb-3 bg-background text-text-primary focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note to student..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
                >
                  Cancel
                </button>
                <button
                  onClick={performAction}
                  className={`px-3 py-2 rounded text-white ${
                    modal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors disabled:opacity-50`} // <-- DARK MODE FIX
                  disabled={!!actionLoading[modal.id]}
                >
                  {actionLoading[modal.id]
                    ? "Processing..."
                    : modal.action === "approve"
                    ? "Approve"
                    : "Reject"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}