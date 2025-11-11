import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import NotificationDropdown from "./Notifications/NotificationDropdown"; // 🔔 Notification Bell
import { getMyXp } from "../api/xpEvents"; // 🧩 XP API

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { LuMenu, LuX, LuChevronDown } from "react-icons/lu"; // For burger and dropdown
import MobileSidebar from "./Navbar/MobileSidebar";
import UserDropdown from "./Navbar/UserDropdown";
import ThemeToggle from "./ThemeToggle";
// -------------------

// --- NEW HELPER COMPONENTS ---

// Helper for main desktop links
const DesktopNavLink = ({ to, children }) => (
  <Link
    to={to}
    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/10 hover:text-accent"
  >
    {children}
  </Link>
);

// Helper for links inside the new dropdowns
const DesktopDropdownLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block w-full px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
  >
    {children}
  </Link>
);

// --- END HELPER COMPONENTS ---


export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);

  // --- NEW STATE for Menus ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStudentMoreOpen, setIsStudentMoreOpen] = useState(false);
  const [isAdminMoreOpen, setIsAdminMoreOpen] = useState(false);
  // ---------------------------

  // --- ALL YOUR OLD LOGIC (100% UNCHANGED) ---
  const safeSetUser = (u) => {
    try {
      if (typeof setUser === "function") setUser(u);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout").catch(() => {});
    } catch (_) {}
    try {
      localStorage.removeItem("jwt_token");
    } catch {}
    safeSetUser(null);
    setIsUserMenuOpen(false); // Close dropdown on logout
    setIsMobileMenuOpen(false); // Close sidebar on logout
    navigate("/login");
  };

  const role = (user?.role || "").toString().toUpperCase();

  // 🧠 Fetch XP (only for student)
  useEffect(() => {
    async function loadXp() {
      if (role === "STUDENT") {
        try {
          const data = await getMyXp();
          setXp(data?.totalXp || 0);
        } catch (err) {
          console.warn("Failed to load XP:", err);
        }
      }
    }
    if (user) { // Only fetch XP if user is logged in
      loadXp();
    }
  }, [user, role]); // Depend on user object
  // --- END OF OLD LOGIC ---

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsStudentMoreOpen(false);
    setIsAdminMoreOpen(false);
  }, [navigate]); // navigate object is stable, but this catches navigation actions

  return (
    <>
      {/* 1. The Glassmorphic Floating Navbar */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl rounded-xl border border-white/10 bg-secondary/70 px-4 shadow-lg backdrop-blur-lg sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* ========= LEFT SIDE ========= */}
          {/* 'flex-shrink-0' stops the logo from shrinking */}
          <div className="flex flex-shrink-0 items-center gap-4">
            
            {/* Mobile Burger Button */}
            <button
              className="relative flex h-10 w-10 items-center justify-center md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'x' : 'menu'}
                  initial={{ rotate: isMobileMenuOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: isMobileMenuOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  {isMobileMenuOpen ? <LuX className="h-6 w-6 text-text-primary" /> : <LuMenu className="h-6 w-6 text-text-primary" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Logo */}
            <Link to="/" className="text-2xl font-extrabold text-accent">
              LMS
            </Link>
          </div>

          {/* ========= MIDDLE (Desktop Links) ========= */}
          {/* 'min-w-0' allows this container to shrink. 'hidden md:flex' shows it on desktop/tablet */}
          <div className="hidden min-w-0 flex-1 items-center justify-start gap-1 px-4 md:flex">
            {role === "STUDENT" && (
              <>
                <DesktopNavLink to="/student/dashboard">Dashboard</DesktopNavLink>
                <DesktopNavLink to="/my-courses">My Courses</DesktopNavLink>
                <DesktopNavLink to="/student/courses">All Courses</DesktopNavLink>
                <DesktopNavLink to="/student/exams">🧠 Exams</DesktopNavLink>
                <DesktopNavLink to="/student/leaderboard">Leaderboard 🏆</DesktopNavLink>

                {/* Student "More" Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsStudentMoreOpen(!isStudentMoreOpen)}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/10 hover:text-accent"
                  >
                    More <LuChevronDown className={`h-4 w-4 transition-transform ${isStudentMoreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isStudentMoreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full mt-2 w-48 origin-top-left rounded-md border border-white/10 bg-secondary shadow-lg"
                      >
                        <DesktopDropdownLink to="/student/profile" onClick={() => setIsStudentMoreOpen(false)}>My Profile</DesktopDropdownLink>
                        <DesktopDropdownLink to="/student/xp-history" onClick={() => setIsStudentMoreOpen(false)}>My XP 🎖</DesktopDropdownLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <DesktopNavLink to="/admin/dashboard">Dashboard</DesktopNavLink>
                <DesktopNavLink to="/admin/manage-courses">Courses</DesktopNavLink>
                <DesktopNavLink to="/admin/manage-users">Users</DesktopNavLink>
                <DesktopNavLink to="/admin/enrollments">Enrollments</DesktopNavLink>
                <DesktopNavLink to="/admin/reports">Reports 🚨</DesktopNavLink>
                <DesktopNavLink to="/admin/gamification">Gamification</DesktopNavLink>
                
                {/* Admin "More" Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsAdminMoreOpen(!isAdminMoreOpen)}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/10 hover:text-accent"
                  >
                    More <LuChevronDown className={`h-4 w-4 transition-transform ${isAdminMoreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isAdminMoreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full mt-2 w-56 origin-top-left rounded-md border border-white/10 bg-secondary shadow-lg"
                      >
                        <DesktopDropdownLink to="/admin/notifications" onClick={() => setIsAdminMoreOpen(false)}>🔔 Notifications</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/notification-history" onClick={() => setIsAdminMoreOpen(false)}>🕒 History</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/forum-moderation" onClick={() => setIsAdminMoreOpen(false)}>Moderation</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/leaderboard" onClick={() => setIsAdminMoreOpen(false)}>Leaderboard 🏆</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/email-broadcast" onClick={() => setIsAdminMoreOpen(false)}>📧 Email</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/system-settings" onClick={() => setIsAdminMoreOpen(false)}>⚙️ Settings</DesktopDropdownLink>
                        <DesktopDropdownLink to="/admin/manage-exams" onClick={() => setIsAdminMoreOpen(false)}>🧠 Manage Exams</DesktopDropdownLink>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
            
            {role === "TEACHER" && (
              <DesktopNavLink to="/teacher/dashboard">Dashboard</DesktopNavLink>
            )}
          </div>


          {/* ========= RIGHT SIDE ========= */}
          {/* 'flex-shrink-0' stops this side from shrinking */}
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {role === "STUDENT" && <NotificationDropdown />}

                {/* XP Badge */}
                {role === "STUDENT" && (
                  <span className="hidden sm:block text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded-full">
                    🔥 {xp} XP
                  </span>
                )}

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hidden items-center gap-2 rounded-full bg-secondary p-1 pr-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/20 md:flex"
                  >
                    {/* Placeholder for a profile picture */}
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                    {user.username || user.email.split('@')[0]}
                  </button>
                  
                  {/* The Dropdown component itself */}
                  <UserDropdown
                    user={user}
                    handleLogout={handleLogout}
                    isOpen={isUserMenuOpen}
                    setIsOpen={setIsUserMenuOpen}
                  />
                </div>
              </>
            ) : (
              // Logged-out Links
              <div className="hidden items-center gap-4 md:flex">
                <DesktopNavLink to="/login">Login</DesktopNavLink>
                <Link
                  to="/register"
                  className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. The Mobile Sidebar (rendered outside the nav) */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        user={user}
        handleLogout={handleLogout}
      />
    </>
  );
}