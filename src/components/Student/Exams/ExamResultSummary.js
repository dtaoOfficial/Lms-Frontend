import React from "react";
import { motion } from "framer-motion";

export default function ExamResultSummary({ result }) {
  if (!result) return null;

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const {
    examName = "Exam Result",
    totalQuestions = 0,
    correctCount = 0,
    wrongCount = 0,
    score = 0,
    percentage = 0,
    grade = "N/A",
    performanceMessage = "",
  } = result;

  // Circle animation setup
  const circleRadius = 60;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference - (percentage / 100) * circleCircumference;

  // Color theme based on grade
  const color =
    grade === "A"
      ? "#16a34a" // green
      : grade === "B"
      ? "rgb(var(--color-accent))" // accent
      : grade === "C"
      ? "#eab308" // yellow
      : grade === "D"
      ? "#f97316" // orange
      : "#dc2626"; // red
  // --- END OF LOGIC ---

  return (
    <motion.div
      className="bg-secondary rounded-2xl shadow-lg p-6 border border-white/10" // <-- DARK MODE FIX
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🧾 Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary">{examName}</h2> {/* <-- DARK MODE FIX */}
        <p className="text-text-secondary text-lg mt-1">🎉 Exam Completed Successfully</p> {/* <-- DARK MODE FIX */}
      </div>

      {/* 🧮 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
        <div className="p-4 bg-background rounded-xl shadow-sm border border-white/10"> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-text-secondary">Total Questions</p> {/* <-- DARK MODE FIX */}
          <p className="text-2xl font-semibold text-text-primary">{totalQuestions}</p> {/* <-- DARK MODE FIX */}
        </div>
        <div className="p-4 bg-green-500/10 rounded-xl shadow-sm border border-green-500/20"> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-green-500">Correct</p>
          <p className="text-2xl font-semibold text-green-500">{correctCount}</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-xl shadow-sm border border-red-500/20"> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-red-500">Wrong</p>
          <p className="text-2xl font-semibold text-red-500">{wrongCount}</p>
        </div>
        <div className="p-4 bg-accent/10 rounded-xl shadow-sm border border-accent/20"> {/* <-- DARK MODE FIX */}
          <p className="text-sm text-accent">Score</p>
          <p className="text-2xl font-semibold text-accent">{score}</p>
        </div>
      </div>

      {/* 🌀 Animated Circular Percentage Ring */}
      <div className="flex flex-col items-center justify-center mt-6 mb-6">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg
            className="transform -rotate-90 w-40 h-40"
            viewBox="0 0 150 150"
          >
            <circle
              cx="75"
              cy="75"
              r={circleRadius}
              stroke="rgb(var(--color-bg-primary))" // <-- DARK MODE FIX (use bg-primary for trail)
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="75"
              cy="75"
              r={circleRadius}
              stroke={color}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleCircumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <motion.p
              className="text-3xl font-bold"
              style={{ color }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {percentage.toFixed(1)}%
            </motion.p>
            <p className="text-sm text-text-secondary">Score</p> {/* <-- DARK MODE FIX */}
          </div>
        </div>

        {/* 🎓 Grade & Message */}
        <div className="text-center mt-4">
          <p className="text-xl font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
            Grade: <span style={{ color }}>{grade}</span>
          </p>
          {performanceMessage && (
            <p className="mt-2 text-md text-text-secondary font-medium"> {/* <-- DARK MODE FIX */}
              {performanceMessage}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}