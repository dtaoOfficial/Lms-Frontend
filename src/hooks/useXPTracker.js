import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function useXPTracker(pollInterval = 10000) {
  const [xpData, setXpData] = useState({
    xp: 0,
    level: 1,
    badge: "New Learner 🐣",
  });

  const isMounted = useRef(true);

  const fetchXP = async () => {
    try {
      const res = await api.get("/api/gamification/me");
      if (isMounted.current && res?.data) {
        setXpData({
          xp: res.data.xp ?? 0,
          level: res.data.level ?? 1,
          badge: res.data.badge ?? "New Learner 🐣",
        });
      }
    } catch (err) {
      console.error("[useXPTracker] Failed to fetch XP data:", err);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchXP();
    const interval = setInterval(fetchXP, pollInterval);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [pollInterval]);

  return xpData;
}
