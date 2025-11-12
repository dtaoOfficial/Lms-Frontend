import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Displays parsed CSV questions before finalizing upload
 * @param {Array} questions - Parsed CSV question list
 */
export default function ExamPreviewTable({ questions = [] }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary">
        No questions to preview.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 p-2">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-background text-text-secondary uppercase text-xs">
          <tr>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              #
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Question
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Option A
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Option B
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Option C
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Option D
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Answer
            </th>
            <th className="px-3 py-2 border-b border-white/10 text-left font-semibold">
              Explanation
            </th>
          </tr>
        </thead>

        <tbody className="bg-secondary divide-y divide-white/10">
          <AnimatePresence>
            {questions.map((q, i) => (
              <motion.tr
                key={i}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">
                  {i + 1}
                </td>

                {/* ✅ Long multi-line question support */}
                <td className="px-3 py-2 border-b border-white/10 text-text-primary max-w-md whitespace-pre-line break-words">
                  <div className="max-h-40 overflow-y-auto">{q.question}</div>
                </td>

                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">
                  {q.optionA}
                </td>
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">
                  {q.optionB}
                </td>
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">
                  {q.optionC}
                </td>
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary">
                  {q.optionD}
                </td>

                {/* ✅ Highlighted answer */}
                <td className="px-3 py-2 border-b border-white/10 font-semibold text-green-400">
                  {q.answer}
                </td>

                {/* ✅ Proper formatting for explanations */}
                <td className="px-3 py-2 border-b border-white/10 text-text-secondary max-w-md whitespace-pre-line break-words">
                  <div className="max-h-40 overflow-y-auto">{q.explanation}</div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
