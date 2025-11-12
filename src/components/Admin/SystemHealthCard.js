// src/components/Admin/SystemHealthCard.js
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Activity, Server, CheckCircle, AlertTriangle } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function SystemHealthCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/actuator/health`);
      return res.data;
    },
    refetchInterval: 60000, // auto-refresh every 60s
  });

  if (isLoading)
    return (
      <div className="p-4 bg-secondary/20 rounded-lg border border-white/10 text-text-secondary">
        <Activity className="inline mr-2 animate-spin" size={16} /> Checking
        system health...
      </div>
    );

  if (isError)
    return (
      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400">
        <AlertTriangle className="inline mr-2" size={16} /> Unable to fetch system
        health.
      </div>
    );

  const status = data?.status || "UNKNOWN";
  const color =
    status === "UP"
      ? "text-green-500 bg-green-500/10 border-green-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20";

  return (
    <div
      className={`p-5 rounded-lg border ${color} shadow-sm transition-all duration-300`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Server size={22} />
        <h2 className="font-bold text-lg text-text-primary">System Health</h2>
      </div>

      <p className="text-text-secondary mb-2">
        Server Status:{" "}
        <span
          className={`font-semibold ${
            status === "UP" ? "text-green-400" : "text-red-400"
          }`}
        >
          {status}
        </span>
      </p>

      {data?.components && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {Object.entries(data.components).map(([key, val]) => (
            <div
              key={key}
              className="flex justify-between bg-secondary/30 p-2 rounded-md"
            >
              <span>{key}</span>
              <span
                className={`font-semibold ${
                  val.status === "UP" ? "text-green-400" : "text-red-400"
                }`}
              >
                {val.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm flex items-center gap-2">
        {status === "UP" ? (
          <CheckCircle size={16} className="text-green-400" />
        ) : (
          <AlertTriangle size={16} className="text-red-400" />
        )}
        <span className="text-text-secondary">
          Auto-refresh every 60 seconds
        </span>
      </div>
    </div>
  );
}
