import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW IMPORT

/**
 * Displays parsed CSV questions before finalizing upload
 * @param {Array} questions - Parsed CSV question list
 */
export default function ExamPreviewTable({ questions = [] }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary"> {/* <-- DARK MODE FIX */}
        No questions to preview.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse"> {/* <-- DARK MODE FIX */}
        <thead className="bg-background text-text-secondary uppercase text-xs"> {/* <-- DARK MODE FIX */}
          <tr>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              #
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Question
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Option A
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Option B
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Option C
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Option D
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Answer
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold"> {/* <-- DARK MODE FIX */}
              Explanation
            </th>
          </tr>
        </thead>
        <tbody className="bg-secondary divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.tr
                key={i}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }} // Stagger row animation
                className="hover:bg-white/5 transition-colors" // <-- DARK MODE FIX
              >
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">{i + 1}</td> {/* <-- DARK MODE FIX */}
                <td className="px-3 py-2 border-b border-white/10 text-text-primary max-w-xs break-words"> {/* <-- DARK MODE FIX */}
                  {q.question}
                </td>
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">{q.optionA}</td> {/* <-- DARK MODE FIX */}
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">{q.optionB}</td> {/* <-- DARK MODE FIX */}
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">{q.optionC}</td> {/* <-- DARK MODE FIX */}
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">{q.optionD}</td> {/* <-- DARK MODE FIX */}
                <td className="px-3 py-2 border-b border-white/10 font-semibold text-accent"> {/* <-- DARK MODE FIX */}
                  {q.answer}
                </td>
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary max-w-sm break-words"> {/* <-- DARK MODE FIX */}
                  {q.explanation}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}