import React, { useEffect, useState } from "react";

export default function ExamTimer({ durationMinutes, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      className={`text-lg font-semibold ${
        secondsLeft <= 60 ? "text-red-600" : "text-gray-800"
      }`}
    >
      ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
