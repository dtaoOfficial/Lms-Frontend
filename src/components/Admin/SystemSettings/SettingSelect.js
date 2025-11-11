import React from "react";

export default function SettingSelect({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col py-3 border-b border-white/10"> {/* <-- DARK MODE FIX */}
      <label className="text-sm font-medium text-text-primary mb-1">{label}</label> {/* <-- DARK MODE FIX */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-white/10 rounded-md px-2 py-1 text-sm bg-background text-text-primary focus:ring-2 focus:ring-accent outline-none" // <-- DARK MODE FIX
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}