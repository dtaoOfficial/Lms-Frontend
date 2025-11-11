import { useEffect, useState, useCallback } from "react";

/**
 * 🕒 useExamTimer
 * Custom hook for managing countdown timer in exams.
 *
 * @param {number} durationMinutes - total exam duration in minutes
 * @param {function} onTimeUp - callback triggered when time runs out
 */
export default function useExamTimer(durationMinutes, onTimeUp) {
  const totalSeconds = Math.max(durationMinutes * 60, 0);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  // Format time nicely (MM:SS)
  const formatTime = useCallback((secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onTimeUp]);

  return {
    secondsLeft,
    formatted: formatTime(secondsLeft),
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
  };
}
