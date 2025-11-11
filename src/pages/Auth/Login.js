import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // <-- Added Link
import { Helmet } from "react-helmet-async";
import { login, setAuthToken, getCurrentUser } from "../../api";
// Removed OptimizedImage, we don't need it

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // <-- Added ArrowLeft
// -------------------

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child fades in 0.1s after the last
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
// ---------------------------------------------


export default function Login({ setUser }) {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await login(
        { email: email.trim(), password, rememberMe },
        { withCredentials: true }
      );
      const data = res.data || {};
      const token = data.accessToken || data.token || null;
      if (token) setAuthToken(token);

      let user = data.user || null;
      if (!user) {
        try {
          const me = await getCurrentUser();
          user = me.data;
        } catch (e) {
          console.warn("Could not fetch /me after login", e);
        }
      }

      if (setUser && user) setUser(user);
      const role = (data.role || (user && user.role) || "").toUpperCase();

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "TEACHER") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.error ||
        (err.message?.includes("Network") && "Server unreachable") ||
        "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <>
      <Helmet>
        {/* ... (Your Helmet code is unchanged) ... */}
        <title>Login | LMS Platform</title>
        <meta
          name="description"
          content="Sign in to your LMS account to access your personalized dashboard, XP, and progress tracking."
        />
      </Helmet>

      {/* 1. PAGE TRANSITION WRAPPER & DARK MODE FIX */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-background px-4"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-secondary rounded-lg shadow-lg p-6 sm:p-8 text-center border border-white/10"
        >
          {/* --- NEW: Back to Home Button --- */}
          <motion.div variants={itemVariants} className="text-left mb-4">
            <Link to="/" className="text-sm text-accent hover:underline flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>

          {/* --- NEW: Text Logo --- */}
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-extrabold text-accent mb-4">DTAO</h1>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl font-semibold mb-2 text-text-primary">Welcome back 👋</motion.h1>
          <motion.p variants={itemVariants} className="text-sm text-text-secondary mb-6">
            Sign in to continue your learning journey
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4 text-left">
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Email</span>
              <input
                type="email"
                className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {/* --- PASSWORD FIELD FIX --- */}
            <label className="block">
              <span className="text-sm font-medium text-text-secondary">Password</span>
              {/* This relative container holds the input and the button */}
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* --- This button is now centered --- */}
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.1 }}
                      >
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </label>
            {/* --- END OF FIX --- */}

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 rounded text-accent focus:ring-accent bg-background border-white/10"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-text-secondary">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-accent hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-white py-2 rounded font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </motion.button>
          </motion.form>

          <motion.div variants={itemVariants} className="mt-6 text-sm text-text-secondary">
            Don’t have an account?{" "}
            <button
              className="text-accent hover:underline font-medium"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}