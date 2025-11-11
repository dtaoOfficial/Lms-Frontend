import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function EmailHistoryTable({ history, loading, onDelete }) {
  if (loading) return <div className="text-text-secondary">Loading...</div>; // <-- DARK MODE FIX

  if (!history.length)
    return <div className="text-text-secondary text-sm">No email history yet.</div>; // <-- DARK MODE FIX

  return (
    <div className="overflow-x-auto mt-4 bg-secondary rounded-lg shadow border border-white/10"> {/* <-- DARK MODE FIX */}
      <table className="min-w-full text-sm">
        <thead className="bg-background text-text-secondary uppercase text-xs"> {/* <-- DARK MODE FIX */}
          <tr>
            <th className="p-3 text-left border-b border-white/10">Subject</th> {/* <-- DARK MODE FIX */}
            <th className="p-3 text-left border-b border-white/10">Recipients</th> {/* <-- DARK MODE FIX */}
            <th className="p-3 text-left border-b border-white/10">Sent By</th> {/* <-- DARK MODE FIX */}
            <th className="p-3 text-left border-b border-white/10">Status</th> {/* <-- DARK MODE FIX */}
            <th className="p-3 text-left border-b border-white/10">Sent At</th> {/* <-- DARK MODE FIX */}
            <th className="p-3 text-left border-b border-white/10">Action</th> {/* <-- DARK MODE FIX */}
          </tr>
        </thead>
        {/* --- NEW: ANIMATED TABLE BODY --- */}
        <tbody className="divide-y divide-white/10">
          <AnimatePresence>
            {history.map((h) => (
              <motion.tr
                key={h.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-left hover:bg-white/5" // <-- DARK MODE FIX
              >
                <td className="border-none p-3 text-text-primary">{h.subject}</td> {/* <-- DARK MODE FIX */}
                <td className="border-none p-3 text-text-secondary">{h.recipients?.length || 0}</td> {/* <-- DARK MODE FIX */}
                <td className="border-none p-3 text-text-secondary">{h.sentBy}</td> {/* <-- DARK MODE FIX */}
                <td className="border-none p-3">
                  {h.success ? (
                    <span className="text-green-500 font-medium">✅ Success</span>
                  ) : (
                    <span className="text-red-500 font-medium">❌ Failed</span>
                  )}
                </td>
                <td className="border-none p-3 text-text-secondary"> {/* <-- DARK MODE FIX */}
                  {new Date(h.sentAt).toLocaleString()}
                </td>
                <td className="border-none p-3">
                  <button
                    onClick={() => onDelete(h.id)}
                    className="text-red-500 hover:text-red-400 font-medium" // <-- DARK MODE FIX
                  >
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}