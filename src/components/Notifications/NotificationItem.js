import React from "react";
import dayjs from "dayjs";

export default function NotificationItem({ item, onClick }) {
  const time = dayjs(item.createdAt).format("MMM D, h:mm A");
  const isUnread = !item.read;

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`px-4 py-3 cursor-pointer border-b border-white/10 transition-colors ${
        isUnread
          ? "bg-accent/10 border-l-4 border-accent" // <-- DARK MODE FIX
          : "bg-secondary hover:bg-white/5" // <-- DARK MODE FIX
      }`}
    >
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-text-primary"> {/* <-- DARK MODE FIX */}
          {item.title || "Notification"}
        </h4>
        <span className="text-xs text-text-secondary">{time}</span> {/* <-- DARK MODE FIX */}
      </div>
      <p className="text-sm text-text-secondary mt-1">{item.message}</p> {/* <-- DARK MODE FIX */}
    </div>
  );
}