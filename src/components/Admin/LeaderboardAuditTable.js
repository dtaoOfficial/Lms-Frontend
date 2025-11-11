import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function LeaderboardAuditTable({ data = [], loading }) {
  if (loading)
    return (
      <div className="text-center text-text-secondary py-10"> {/* <-- DARK MODE FIX */}
        Loading audit logs...
      </div>
    );

  if (!data.length)
    return (
      <div className="text-center text-text-secondary py-10"> {/* <-- DARK MODE FIX */}
        No audit records found.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-secondary rounded-lg shadow border border-white/10"> {/* <-- DARK MODE FIX */}
      <table className="min-w-full text-sm">
        <thead className="bg-background border-b border-white/10"> {/* <-- DARK MODE FIX */}
          <tr>
            <th className="px-4 py-3 text-left text-text-secondary font-semibold">#</th> {/* <-- DARK MODE FIX */}
            <th className="px-4 py-3 text-left text-text-secondary font-semibold">Admin Email</th> {/* <-- DARK MODE FIX */}
            <th className="px-4 py-3 text-left text-text-secondary font-semibold">Scope</th> {/* <-- DARK MODE FIX */}
            <th className="px-4 py-3 text-left text-text-secondary font-semibold">Note</th> {/* <-- DARK MODE FIX */}
            <th className="px-4 py-3 text-left text-text-secondary font-semibold">Reset Time</th> {/* <-- DARK MODE FIX */}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
          <AnimatePresence>
            {data.map((audit, i) => (
              <motion.tr 
                key={audit.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }} // Stagger row animation
                className="hover:bg-white/5" // <-- DARK MODE FIX
              >
                <td className="px-4 py-2 text-text-primary">{i + 1}</td> {/* <-- DARK MODE FIX */}
                <td className="px-4 py-2 text-accent">{audit.adminEmail}</td> {/* <-- DARK MODE FIX */}
                <td className="px-4 py-2 font-medium text-text-primary">{audit.scope}</td> {/* <-- DARK MODE FIX */}
                <td className="px-4 py-2 text-text-secondary">{audit.note}</td> {/* <-- DARK MODE FIX */}
                <td className="px-4 py-2 text-text-secondary"> {/* <-- DARK MODE FIX */}
                  {new Date(audit.resetAt).toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}