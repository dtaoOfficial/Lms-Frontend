import React, { useState } from "react";
import { registerUser } from "../../api";
import { useNavigate, Link } from "react-router-dom"; // <-- Added Link

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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

export default function Register() {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT", // fixed role
    department: "",
    phone: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // This is not used in your logic, but kept it

  const navigate = useNavigate();

  function updateField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const validate = () => {
    if (!form.name || !form.name.trim()) return "Name is required";
    if (!form.email || !form.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test((form.email || "").trim())) return "Email looks invalid";
    if (!form.password) return "Password is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";

    const role = form.role || "STUDENT";
    const dept = form.department || "";
    if ((role === "TEACHER" || role === "ADMIN") && !dept.trim()) {
      return "Department is required for this role";
    }

    const phone = (form.phone || "").trim();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return "Phone must be 10 digits starting with 6/7/8/9";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role, // STUDENT
        department: form.department ? form.department.trim() : undefined,
        phone: form.phone ? form.phone.trim() : undefined
      };

      await registerUser(payload);
      navigate("/verify-email", { state: { email: payload.email } });
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (err) {
      console.error("Register error:", err);
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background px-4 py-8" // <-- DARK MODE FIX
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl bg-secondary rounded-lg shadow-lg p-6 sm:p-8 border border-white/10" // <-- DARK MODE FIX
      >
        {/* --- NEW: Back to Home Button --- */}
        <motion.div variants={itemVariants} className="text-left mb-4">
            <Link to="/" className="text-sm text-accent hover:underline flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
        </motion.div>
          
        <motion.h1 variants={itemVariants} className="text-2xl font-semibold mb-2 text-text-primary">Create your account</motion.h1> {/* <-- DARK MODE FIX */}
        <motion.p variants={itemVariants} className="text-sm text-text-secondary mb-4">Sign up for the LMS</motion.p> {/* <-- DARK MODE FIX */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20" // <-- DARK MODE FIX
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {successMsg && <div className="mb-4 text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">{successMsg}</div>} {/* <-- DARK MODE FIX */}

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-text-secondary">Full name</span> {/* <-- DARK MODE FIX */}
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
            </label>

            <label className="block">
              <span className="text-sm text-text-secondary">Phone (optional)</span> {/* <-- DARK MODE FIX */}
              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
                className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-text-secondary">Email</span> {/* <-- DARK MODE FIX */}
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              className="mt-1 block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* --- PASSWORD FIELD FIX --- */}
            <label className="block">
              <span className="text-sm text-text-secondary">Password</span>
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={updateField}
                  className="block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div key="eye-off" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.1 }}>
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="eye" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.1 }}>
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </label>

            {/* --- CONFIRM PASSWORD FIELD FIX --- */}
            <label className="block">
              <span className="text-sm text-text-secondary">Confirm password</span>
              <div className="relative mt-1">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={updateField}
                  className="block w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showConfirm ? (
                      <motion.div key="eye-off-c" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.1 }}>
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="eye-c" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.1 }}>
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </label>
          </div>

          <input type="hidden" name="role" value={form.role} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded font-medium disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
            >
              {loading ? "Creating..." : "Create account"}
            </motion.button>

            <button type="button" onClick={() => navigate("/login")} className="text-sm text-text-secondary hover:underline mt-4 sm:mt-0"> {/* <-- DARK MODE FIX */}
              Already have an account?
            </button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}