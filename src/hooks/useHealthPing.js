import { useEffect } from "react";

export default function useHealthPing() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${process.env.REACT_APP_API_URL}/health`)
        .then(() => console.log("✅ Backend awake"))
        .catch(() => console.warn("⚠️ Backend unreachable"));
    }, 2000); // every 2 seconds

    return () => clearInterval(interval);
  }, []);
}
