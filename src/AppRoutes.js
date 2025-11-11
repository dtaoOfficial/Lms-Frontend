import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, setAuthToken, refreshAccess } from "./api";
import { AnimatePresence } from "framer-motion"; // <-- 1. NEW IMPORT

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// =================== AUTH Pages ===================
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const LandingPage = lazy(() => import("./pages/Auth/LandingPage"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));

// =================== ADMIN PAGES ===================
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ProfileAdmin = lazy(() => import("./pages/Admin/Profile"));
const ManageUsers = lazy(() => import("./pages/Admin/ManageUsers"));
const ManageCourses = lazy(() => import("./pages/Admin/ManageCourses"));
const ManageExamsPage = lazy(() => import("./pages/Admin/ManageExamsPage")); // ✅ NEW
const PendingEnrollments = lazy(() => import("./pages/Admin/PendingEnrollments"));
const StudentProgressPage = lazy(() => import("./pages/Admin/StudentProgressPage"));
const ForumModerationPage = lazy(() => import("./pages/Admin/ForumModerationPage"));
const ReportsPage = lazy(() => import("./pages/Admin/ReportsPage"));
const LeaderboardAdminPage = lazy(() => import("./pages/Admin/LeaderboardAdminPage"));
const LeaderboardAuditPage = lazy(() => import("./pages/Admin/LeaderboardAuditPage"));
const SystemSettingsPage = lazy(() => import("./pages/Admin/SystemSettingsPage"));
const EmailBroadcastPage = lazy(() => import("./pages/Admin/EmailBroadcastPage"));
const AdminNotificationsPage = lazy(() => import("./pages/Admin/AdminNotificationsPage"));
const AdminNotificationHistory = lazy(() => import("./pages/Admin/AdminNotificationHistory"));
const AdminGamificationPage = lazy(() => import("./pages/Admin/AdminGamificationPage"));
const StudentDetailPage = lazy(() => import("./pages/Admin/StudentDetailPage"));


// =================== TEACHER PAGES ===================
const TeacherDashboard = lazy(() => import("./pages/Teacher/TeacherDashboard"));
const ManageStudents = lazy(() => import("./pages/Teacher/ManageStudents"));

// =================== STUDENT PAGES ===================
const StudentDashboard = lazy(() => import("./pages/Student/StudentDashboard"));
const AllCoursesStudent = lazy(() => import("./pages/Student/AllCourses"));
const CourseDetail = lazy(() => import("./pages/Student/CourseDetail"));
const MyCourses = lazy(() => import("./pages/Student/MyCourses"));
const ProfileStudent = lazy(() => import("./pages/Student/Profile"));
const ForumPage = lazy(() => import("./pages/Student/ForumPage"));
const LeaderboardPage = lazy(() => import("./pages/Student/LeaderboardPage"));
const NotificationsPage = lazy(() => import("./pages/Student/NotificationsPage"));
const XpHistory = lazy(() => import("./pages/Student/XpHistory"));
// =================== STUDENT EXAMS PAGES ===================
const ExamsPage = lazy(() => import("./pages/Student/ExamsPage"));
const ExamStartPage = lazy(() => import("./pages/Student/ExamStartPage"));
const ExamTakingPage = lazy(() => import("./pages/Student/ExamTakingPage"));
const ExamResultPage = lazy(() => import("./pages/Student/ExamResultPage"));


export default function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // This is used for AnimatePresence
  const navigate = useNavigate();

  const hideNavbar = ["/", "/login", "/register", "/verify-email"].includes(
    location.pathname
  );

  // --- 4. NEW: Scroll to top on page change ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  // -------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);

      const token = (() => {
        try {
          return localStorage.getItem("jwt_token");
        } catch {
          return null;
        }
      })();

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      setAuthToken(token);

      let fetchedUser = null;
      try {
        const res = await getCurrentUser();
        fetchedUser = res?.data || null;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          try {
            const newToken = await refreshAccess();
            if (newToken) {
              const res2 = await getCurrentUser();
              fetchedUser = res2?.data || null;
            } else {
              setAuthToken(null);
              fetchedUser = null;
            }
          } catch {
            setAuthToken(null);
            fetchedUser = null;
          }
        } else {
          setAuthToken(null);
          fetchedUser = null;
        }
      }

      if (!mounted) return;

      setUser(fetchedUser);
      setLoading(false);

      if (fetchedUser) {
        const onAuthPages = ["/", "/login", "/register", "/verify-email"].includes(
          location.pathname
        );
        if (onAuthPages) {
          const role = (fetchedUser?.role || "").toUpperCase();
          if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
          else if (role === "TEACHER")
            navigate("/teacher/dashboard", { replace: true });
          else navigate("/student/dashboard", { replace: true });
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* 5. UPDATED: Theme-aware loading text */}
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      {/* ⚡ Lazy load routes with Suspense fallback */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-text-secondary">
            Loading page...
          </div>
        }
      >
        {/* 2. WRAP WITH ANIMATEPRESENCE */}
        <AnimatePresence mode="wait">
          {/* 3. ADD LOCATION AND KEY TO ROUTES */}
          <Routes location={location} key={location.pathname}>
            {/* Public / Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* =================== ADMIN =================== */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gamification"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <AdminGamificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ProfileAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-users"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-courses"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            {/* ✅ NEW: Manage Exams route */}
            <Route
              path="/admin/manage-exams"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ManageExamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <PendingEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/student-progress"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <StudentProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/forum-moderation"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ForumModerationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaderboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <LeaderboardAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaderboard/audit"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <LeaderboardAuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/email-broadcast"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <EmailBroadcastPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/system-settings"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
                  <AdminNotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notification-history"
              element={<AdminNotificationHistory />}
            />

   <Route
  path="/admin/students/:email"
  element={
    <ProtectedRoute user={user} allowedRoles={["ADMIN"]} loading={loading}>
      <StudentDetailPage />
    </ProtectedRoute>
  }
/>





            {/* =================== TEACHER =================== */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["TEACHER"]} loading={loading}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/manage-students"
              element={
                <ProtectedRoute user={user} allowedRoles={["TEACHER"]} loading={loading}>
                  <ManageStudents />
                </ProtectedRoute>
              }
            />

            {/* =================== STUDENT =================== */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <ProfileStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <AllCoursesStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:id"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/xp-history"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <XpHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forum/:courseId"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["STUDENT", "TEACHER", "ADMIN"]}
                  loading={loading}
                >
                  <ForumPage />
                </ProtectedRoute>
              }
            />

{/* =================== STUDENT EXAMS =================== */}
<Route
  path="/student/exams"
  element={
    <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
      <ExamsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/exams/start/:examId"
  element={
    <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
      <ExamStartPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/exams/take/:examId"
  element={
    <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
      <ExamTakingPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/exams/result/:examId"
  element={
    <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
      <ExamResultPage />
    </ProtectedRoute>
  }
/>


            <Route
              path="/student/leaderboard"
              element={
                <ProtectedRoute user={user} allowedRoles={["STUDENT"]} loading={loading}>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}
