import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion"; // <-- NEW IMPORTS

// --- NEW: Animation Component for Numbers ---
function NumberAnimation({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5, // Animate over 1.5 seconds
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function StatsCards({ data = {}, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 animate-pulse">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="bg-secondary h-24 rounded-lg shadow-sm" // <-- DARK MODE FIX
              aria-busy="true"
            ></div>
          ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: data.totalUsers },
    { label: "Students", value: data.totalStudents },
    { label: "Teachers", value: data.totalTeachers },
    { label: "Courses", value: data.totalCourses },
    { label: "Enrollments", value: data.totalEnrollments },
    { label: "Pending Requests", value: data.pendingRequests },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }} // <-- NEW ANIMATION
          className="bg-secondary border border-white/10 shadow rounded-lg p-4 transition-all" // <-- DARK MODE FIX
          aria-label={`${card.label}: ${card.value ?? 0}`}
        >
          <h2 className="text-sm text-text-secondary">{card.label}</h2> {/* <-- DARK MODE FIX */}
          <p className="text-2xl font-semibold text-accent"> {/* <-- DARK MODE FIX */}
            <NumberAnimation value={card.value ?? 0} /> {/* <-- NEW ANIMATION */}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default StatsCards;