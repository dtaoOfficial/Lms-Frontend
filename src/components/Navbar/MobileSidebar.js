import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
// --- ICON NAME FIXES ---
import { 
  LayoutDashboard, 
  Book, 
  BookMarked, 
  User, 
  Medal, 
  Trophy, 
  Settings,
  ShieldCheck,
  Users,
  Bell,
  Clock,
  FileCheck,
  Flag,
  Mail,
  LogIn, // <-- Fixed name
  LogOut, // <-- Fixed name
  UserPlus2 // <-- Fixed name
} from 'lucide-react'; 
// -----------------------

// Helper component for links. When you click a link, it closes the menu.
const MobileNavLink = ({ to, onClick, icon: Icon, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-lg px-3 py-3 text-text-secondary transition-all hover:bg-secondary hover:text-text-primary"
  >
    <Icon className="h-5 w-5" />
    <span className="text-lg font-medium">{children}</span>
  </Link>
);

const MobileSidebar = ({ isOpen, setIsOpen, user, handleLogout }) => {
  const role = (user?.role || "").toString().toUpperCase();

  const closeMenu = () => setIsOpen(false);

  const onLogoutClick = () => {
    closeMenu();
    handleLogout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. The Backdrop (Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* 2. The Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-background p-6 md:hidden"
          >
            {/* Logo/Header */}
            <div className="mb-6 flex items-center justify-between">
              <Link to="/" onClick={closeMenu} className="text-2xl font-extrabold text-accent">
                LMS
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {/* --- ICON NAME FIXES --- */}
              {role === 'STUDENT' && (
                <>
                  <MobileNavLink to="/student/dashboard" onClick={closeMenu} icon={LayoutDashboard}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/student/courses" onClick={closeMenu} icon={Book}>All Courses</MobileNavLink>
                  <MobileNavLink to="/my-courses" onClick={closeMenu} icon={BookMarked}>My Courses</MobileNavLink>
                  <MobileNavLink to="/student/exams" onClick={closeMenu} icon={FileCheck}>🧠 Exams</MobileNavLink> {/* ✅ NEW LINE */}
                  <MobileNavLink to="/student/profile" onClick={closeMenu} icon={User}>My Profile</MobileNavLink>
                  <MobileNavLink to="/student/xp-history" onClick={closeMenu} icon={Medal}>My XP</MobileNavLink>
                  <MobileNavLink to="/student/leaderboard" onClick={closeMenu} icon={Trophy}>Leaderboard</MobileNavLink>
                </>
              )}

              {role === 'ADMIN' && (
                <>
                  <MobileNavLink to="/admin/dashboard" onClick={closeMenu} icon={LayoutDashboard}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/admin/manage-courses" onClick={closeMenu} icon={Book}>Manage Courses</MobileNavLink>
                      <MobileNavLink to="/admin/manage-exams" onClick={closeMenu} icon={FileCheck}>Manage Exams</MobileNavLink> {/* ✅ NEW */}
                  <MobileNavLink to="/admin/manage-users" onClick={closeMenu} icon={Users}>Manage Users</MobileNavLink>
                  <MobileNavLink to="/admin/notifications" onClick={closeMenu} icon={Bell}>Notifications</MobileNavLink>
                  <MobileNavLink to="/admin/notification-history" onClick={closeMenu} icon={Clock}>History</MobileNavLink>
                  <MobileNavLink to="/admin/enrollments" onClick={closeMenu} icon={FileCheck}>Enrollments</MobileNavLink>
                  <MobileNavLink to="/admin/forum-moderation" onClick={closeMenu} icon={ShieldCheck}>Moderation</MobileNavLink>
                  <MobileNavLink to="/admin/reports" onClick={closeMenu} icon={Flag}>Reports</MobileNavLink>
                  <MobileNavLink to="/admin/leaderboard" onClick={closeMenu} icon={Trophy}>Leaderboard</MobileNavLink>
                  <MobileNavLink to="/admin/gamification" onClick={closeMenu} icon={Medal}>Gamification</MobileNavLink>
                  <MobileNavLink to="/admin/email-broadcast" onClick={closeMenu} icon={Mail}>Email</MobileNavLink>
                  <MobileNavLink to="/admin/system-settings" onClick={closeMenu} icon={Settings}>Settings</MobileNavLink>
                </>
              )}

              {role === 'TEACHER' && (
                <MobileNavLink to="/teacher/dashboard" onClick={closeMenu} icon={LayoutDashboard}>Dashboard</MobileNavLink>
              )}
            </nav>

            {/* Footer / Auth Buttons */}
            <div className="mt-auto border-t border-white/10 pt-4">
              {user ? (
                <button
                  onClick={onLogoutClick}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-lg font-medium text-red-500 transition-all hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" /> {/* <-- ICON NAME FIX */}
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                  <MobileNavLink to="/login" onClick={closeMenu} icon={LogIn}>Login</MobileNavLink> {/* <-- ICON NAME FIX */}
                  <MobileNavLink to="/register" onClick={closeMenu} icon={UserPlus2}>Register</MobileNavLink>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;