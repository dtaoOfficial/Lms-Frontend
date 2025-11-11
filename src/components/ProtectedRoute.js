// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 *
 * Props:
 *  - children: React node to render when allowed
 *  - user: current user object (null when not authenticated)
 *  - allowedRoles: optional array or single role string (case-insensitive)
 *  - loading: boolean (show spinner while resolving user)
 */
export default function ProtectedRoute({ children, user, allowedRoles, loading }) {
  const location = useLocation();

  // While we're validating token, show a spinner (avoid instant redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Not authenticated -> send to login, preserve where we came from
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role restriction present and user role not allowed -> send to login (or could show 403)
  if (allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const allowedUpper = allowed.map(r => (r || "").toString().toUpperCase());
    const userRole = (user?.role || "").toString().toUpperCase();
    if (!allowedUpper.includes(userRole)) {
      // Optionally you could navigate to a "Forbidden" page instead
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  // All good
  return children;
}
