import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ReportCard({ report, onDelete, onResolve }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }} // <-- NEW ANIMATION
      className="bg-secondary border border-white/10 rounded-lg shadow-sm p-4 flex justify-between items-start transition-shadow" // <-- DARK MODE FIX
    >
      <div className="min-w-0"> {/* <-- Added to prevent text overflow */}
        <h3 className="font-semibold text-text-primary mb-1"> {/* <-- DARK MODE FIX */}
          {report.targetType} — <span className="text-accent">{report.reason}</span> {/* <-- DARK MODE FIX */}
        </h3>
        <p className="text-sm text-text-secondary mb-2"> {/* <-- DARK MODE FIX */}
          <span className="font-medium text-text-primary">Reported by:</span> {report.email} {/* <-- DARK MODE FIX */}
        </p>
        {report.text && <p className="text-text-secondary text-sm italic">“{report.text}”</p>} {/* <-- DARK MODE FIX */}
        <p className="text-xs text-text-secondary/70 mt-2"> {/* <-- DARK MODE FIX */}
          Status:{" "}
          <span
            className={`font-semibold ${
              report.status === "OPEN"
                ? "text-red-600"
                : report.status === "REVIEWED"
                ? "text-yellow-600"
                : "text-green-600"
            }`} // (Kept semantic colors)
          >
            {report.status}
          </span>{" "}
          • {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col space-y-2 ml-4 flex-shrink-0"> {/* <-- Added ml-4 and flex-shrink-0 */}
        <button
          onClick={onResolve}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors" // (Kept semantic color)
        >
          Resolve
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors" // (Kept semantic color)
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}