import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT
import { CheckCircle2 } from "lucide-react"; // <-- NEW IMPORT

const RecentActivityList = ({ activities }) => {
  return (
    <div className="bg-secondary rounded-xl shadow-md p-6 border border-white/10 h-full"> {/* <-- DARK MODE FIX */}
      <h3 className="text-lg font-semibold text-text-primary mb-3">Recent Activity</h3> {/* <-- DARK MODE FIX */}
      
      {/* --- BUG FIX WAS HERE --- */}
      {(!activities || activities.length === 0) ? (
        <p className="text-text-secondary text-sm">No recent activity found.</p> 
      ) : (
        <ul className="divide-y divide-white/10 space-y-2"> {/* <-- DARK MODE FIX */}
          <AnimatePresence>
            {activities.map((item, idx) => (
              <motion.li 
                key={idx}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.1 }} // Stagger list items
                className="pt-2 text-text-secondary text-sm flex items-center gap-2" // <-- DARK MODE FIX
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="truncate">{item}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default RecentActivityList;