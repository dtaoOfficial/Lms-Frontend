import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // <-- Added Link
import { verifyEmail, resendOtp } from "../../api";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const initialEmail = (location.state && location.state.email) || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !/^\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail({ email: email.trim().toLowerCase(), otp: otp.trim() });
      setSuccessMsg("✅ Email verified. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Verify error:", err);
      setError(err?.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !/^\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email to resend OTP");
      return;
    }
    setResendLoading(true);
    setError("");
    try {
      await resendOtp({ email: email.trim().toLowerCase() });
      setSuccessMsg("OTP resent. Check your email.");
      setCooldown(60);
    } catch (err) {
      console.error("Resend error:", err);
      setError(err?.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background px-4" // <-- DARK MODE FIX
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-secondary rounded-lg shadow-lg p-6 sm:p-8 border border-white/10 text-center" // <-- DARK MODE FIX
      >
        {/* --- NEW: Back to Home Button --- */}
        <motion.div variants={itemVariants} className="text-left mb-4">
            <Link to="/" className="text-sm text-accent hover:underline flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
        </motion.div>

        <motion.h2 variants={itemVariants} className="text-xl font-semibold mb-2 text-text-primary">Verify your email</motion.h2> {/* <-- DARK MODE FIX */}
        <motion.p variants={itemVariants} className="text-sm text-text-secondary mb-4"> {/* <-- DARK MODE FIX */}
          Enter the 6-digit code we sent to your email to finish account verification.
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20" // <-- DARK MODE FIX
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20" // <-- DARK MODE FIX
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form variants={itemVariants} onSubmit={handleVerify} className="space-y-4 text-left">
          <label className="block">
            <span className="text-sm text-text-secondary">Email</span> {/* <-- DARK MODE FIX */}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-text-secondary">OTP code</span> {/* <-- DARK MODE FIX */}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent tracking-[0.3em] text-center font-semibold" // <-- DARK MODE FIX + Style
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
              required
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded font-medium disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
            >
              {loading ? "Verifying..." : "Verify"}
            </motion.button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
              className="w-full bg-secondary text-text-primary px-3 py-2 rounded border border-white/10 hover:bg-white/10 disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
            >
              {resendLoading ? "Resending..." : cooldown > 0 ? (
                <span className="flex items-center justify-center">
                  Resend (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={cooldown}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="inline-block w-4"
                    >
                      {cooldown}
                    </motion.span>
                  </AnimatePresence>
                  s)
                </span>
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>

          <div className="pt-3 text-sm text-center">
            <button type="button" onClick={() => navigate("/login")} className="text-accent hover:underline"> {/* <-- DARK MODE FIX */}
              Already verified? Go to login
            </button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}