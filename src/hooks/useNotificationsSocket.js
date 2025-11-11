import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * ✅ WebSocket Hook for Live Notifications
 * Automatically uses .env settings and adapts to HTTPS (wss://)
 * Example .env:
 *   REACT_APP_SOCKET_URL=wss://api.yourdomain.com/ws
 *   REACT_APP_API_URL=https://api.yourdomain.com
 */
export default function useNotificationsSocket(onNewNotification) {
  useEffect(() => {
    // 1️⃣ Prefer .env value; fallback to API_URL or localhost
    const baseSocketUrl =
      process.env.REACT_APP_SOCKET_URL ||
      `${process.env.REACT_APP_API_URL?.replace(/^http/, "ws") || "http://localhost:8080"}/ws`;

    console.log("[Socket] Connecting to:", baseSocketUrl);

    // 2️⃣ Initialize SockJS client
    const socket = new SockJS(baseSocketUrl);

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

    // 4️⃣ Activate the client
    client.activate();

    // 5️⃣ Cleanup on unmount
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
