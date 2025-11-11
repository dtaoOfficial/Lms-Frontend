// src/hooks/useFullscreenExam.js
import { useState, useCallback, useEffect } from "react";

/**
 * 🖥️ useFullscreenExam
 * Safely controls fullscreen mode for exams — enter, exit, and state tracking.
 * Prevents "Document not active" errors after navigation.
 */
export default function useFullscreenExam() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ Enter fullscreen
  const enterFullscreen = useCallback(() => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } catch (err) {
      console.warn("⚠️ Failed to enter fullscreen:", err.message);
    }
  }, []);

  // ✅ Exit fullscreen safely
  const exitFullscreen = useCallback(() => {
    try {
      if (
        !document ||
        !document.hasFocus() || // page might already be inactive
        (!document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement &&
          !document.msFullscreenElement)
      ) {
        return; // nothing to exit
      }

      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } catch (err) {
      console.warn("⚠️ exitFullscreen skipped:", err.message);
    }
  }, []);

  const handleChange = useCallback(() => {
    const fsElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    setIsFullscreen(!!fsElement);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
    };
  }, [handleChange]);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}
