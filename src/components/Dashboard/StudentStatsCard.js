// src/components/Dashboard/StudentStatsCard.jsx
import React from "react";

const StudentStatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 text-center flex flex-col justify-center items-center hover:shadow-lg transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="text-gray-600 text-sm font-medium uppercase">{title}</h4>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
};

export default StudentStatsCard;
