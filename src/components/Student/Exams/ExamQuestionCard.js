import React from "react";
import { motion } from "framer-motion"; // <-- NEW IMPORT

export default function ExamQuestionCard({ question, index, selected, onSelect }) {
  const options = ["A", "B", "C", "D"];

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const normalize = (val) => {
    if (!val) return "";
    if (val.startsWith("Option")) return val.replace("Option", "");
    return val;
  };
  // --- END OF LOGIC ---

  return (
    // The parent 'ExamTakingPage' already wraps this in a dark-mode card
    // So this component doesn't need its own 'bg-secondary'
    <div className="p-4 mb-4">
      <p className="font-medium mb-4 text-lg text-text-primary"> {/* <-- DARK MODE FIX */}
        {index + 1}. {question.question || "Question text missing"}
      </p>

      <div className="space-y-3">
        {options.map((opt) => {
          const text = question[`option${opt}`];
          if (!text) return null; // Don't render option if text is missing
          
          const normalizedSelected = normalize(selected);
          const uniqueName = `question-${question.id || question._id || question.questionId || index}`;

          return (
            <motion.label
              key={opt}
              whileHover={{ scale: 1.02 }} // <-- NEW ANIMATION
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md transition-all border ${
                normalizedSelected === opt
                  ? "bg-accent/10 border-accent" // <-- DARK MODE FIX
                  : "bg-background hover:bg-white/10 border-white/10" // <-- DARK MODE FIX
              }`}
            >
              <input
                type="radio"
                name={uniqueName}
                checked={normalizedSelected === opt}
                onChange={() => onSelect(opt)}
                className="h-4 w-4 text-accent focus:ring-accent" // <-- DARK MODE FIX
              />
              <span className="text-text-primary"> {/* <-- DARK MODE FIX */}
                <strong>{opt}.</strong> {text}
              </span>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}