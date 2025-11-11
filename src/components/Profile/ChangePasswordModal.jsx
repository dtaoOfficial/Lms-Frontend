import React, { useState } from "react";
import { changePassword } from "../../api/users";
import toast from "react-hot-toast";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
// -------------------

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" }); // <-- Added confirmPassword
  const [loading, setLoading] = useState(false);

  // --- NEW: State for show/hide password ---
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  // ------------------------------------

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    
    // --- NEW: Added confirmation check ---
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setLoading(true);
    const promise = changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    });
    
    toast.promise(promise, {
      loading: "Updating password...",
      success: "Password changed successfully!",
      error: (err) => err.response?.data?.error || "Password change failed",
    });

    try {
      await promise;
      onClose();
    } catch {}
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="bg-secondary p-6 rounded-2xl shadow-lg w-96 border border-white/10" // <-- DARK MODE FIX
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-text-primary"> {/* <-- DARK MODE FIX */}
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- OLD PASSWORD FIELD --- */}
          <div>
            <label className="block text-text-secondary font-medium text-sm"> {/* <-- DARK MODE FIX */}
              Old Password
            </label>
            <div className="relative mt-1">
              <input
                type={showOldPass ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
              <button
                type="button"
                onClick={() => setShowOldPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent"
                aria-label={showOldPass ? "Hide password" : "Show password"}
              >
                {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {/* --- NEW PASSWORD FIELD --- */}
          <div>
            <label className="block text-text-secondary font-medium text-sm"> {/* <-- DARK MODE FIX */}
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showNewPass ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
              />
              <button
                type="button"
                onClick={() => setShowNewPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent"
                aria-label={showNewPass ? "Hide password" : "Show password"}
              >
                {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* --- CONFIRM PASSWORD FIELD --- */}
          <div>
            <label className="block text-text-secondary font-medium text-sm"> {/* <-- DARK MODE FIX */}
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword" // <-- Added name
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors" // <-- DARK MODE FIX
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50" // <-- DARK MODE FIX
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChangePasswordModal;