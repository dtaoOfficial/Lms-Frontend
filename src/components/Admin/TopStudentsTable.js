import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

export default function TopStudentsTable({ topStudents }) {
  if (!topStudents || !topStudents.length) return null;

  return (
    <div className="bg-secondary p-4 shadow rounded-lg border border-white/10"> {/* <-- DARK MODE FIX */}
      <h2 className="text-lg font-semibold mb-3 text-text-primary">Top Performing Students 🏆</h2> {/* <-- DARK MODE FIX */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-background border-b border-white/10"> {/* <-- DARK MODE FIX */}
            <tr>
              <th className="px-4 py-2 font-medium text-text-secondary">#</th> {/* <-- DARK MODE FIX */}
              <th className="px-4 py-2 font-medium text-text-secondary">Name</th> {/* <-- DARK MODE FIX */}
              <th className="px-4 py-2 font-medium text-text-secondary">Email</th> {/* <-- DARK MODE FIX */}
              <th className="px-4 py-2 font-medium text-text-secondary text-right"> {/* <-- DARK MODE FIX */}
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
            <AnimatePresence>
              {topStudents.map((s, i) => (
                <motion.tr
                  key={s.email || i} // Use a more stable key if possible
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }} // Stagger row animation
                  className="hover:bg-white/5 transition-colors" // <-- DARK MODE FIX
                >
                  <td className="px-4 py-2 text-text-secondary">{i + 1}</td> {/* <-- DARK MODE FIX */}
                  <td className="px-4 py-2 text-text-primary">{s.name}</td> {/* <-- DARK MODE FIX */}
                  <td className="px-4 py-2 text-text-secondary">{s.email}</td> {/* <-- DARK MODE FIX */}
                  <td className="px-4 py-2 text-right font-semibold text-green-600">
                    {s.progress}%
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}