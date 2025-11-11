import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * ✅ WebSocket Hook for Live Notifications
 * Automatically uses .env settings and adapts to HTTPS (wss://)
 * Example .env:
 *   REACT_APP_SOCKET_URL=https://lms-vnu1.onrender.com/ws
 *   REACT_APP_API_URL=https://lms-vnu1.onrender.com
 */
export default function useNotificationsSocket(onNewNotification) {
  useEffect(() => {
    // 1️⃣ Prefer .env value; fallback to API_URL or localhost
    const baseSocketUrl =
      process.env.REACT_APP_SOCKET_URL ||
      `${process.env.REACT_APP_API_URL?.replace(/^http/, "ws") || "http://localhost:8080"}/ws`;

    console.log("[Socket] Connecting to:", baseSocketUrl);

    // ✅ Fix: SockJS expects http(s) scheme, not ws(s)
    const socket = new SockJS(baseSocketUrl.replace(/^ws/, "http"));

    // 3️⃣ Configure STOMP client
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // auto-reconnect every 5s
      debug: (msg) => {
        if (process.env.NODE_ENV !== "production") console.log("[STOMP]", msg);
      },
      onConnect: () => {
        console.log("🟢 WebSocket connected to", baseSocketUrl);
        client.subscribe("/user/topic/notifications", (msg) => {
          try {
            const data = JSON.parse(msg.body);
            onNewNotification?.(data);
          } catch (e) {
            console.error("❌ Failed to parse notification:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();

    return () => {
      try {
        if (client.connected) {
          console.log("🔴 Disconnecting WebSocket...");
          client.deactivate();
        }
      } catch (e) {
        console.warn("Socket cleanup error:", e);
      }
    };
  }, [onNewNotification]);
}
