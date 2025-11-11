import React, { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "../../api/users";
import { useNavigate } from "react-router-dom";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
// -------------------

// --- NEW: Stagger Animation for Page Sections ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
// ---------------------------------------------

export default function Profile() {
  // --- FIX: Removed unused 'profile', 'loading', and 'setLoading' ---
  const [, setProfile] = useState(null); 
  // const [loading, setLoading] = useState(false); // This was unused
  // ------------------------------------------------------------------

  const [form, setForm] = useState({
    name: "",
    phone: "",
    about: "",
    department: "",
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "", 
  });

  // --- NEW: State for show/hide password ---
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  // ------------------------------------

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true); 
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    setError("");
    setMessage("");
    setLoadingProfile(true);
    try {
      const res = await getProfile(); 
      setProfile(res); 
      setForm({
        name: res.name || "",
        phone: res.phone || "",
        about: res.about || "",
        department: res.department || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load profile from server.";
      setError(msg);
      if (err?.response?.status === 401) {
        setTimeout(() => navigate("/login"), 1200);
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleProfileChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingProfile(true); 
    try {
      await updateProfile(form);
      setMessage("✅ Profile updated successfully");
      await loadProfile();
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err?.response?.data?.error || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    if (!passwords.oldPassword || !passwords.newPassword) {
      setError("Please fill all password fields");
      return;
    }

    setSavingPassword(true); 
    try {
      await changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      setMessage("✅ Password changed successfully");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password change failed:", err);
      setError(err?.response?.data?.error || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };
  // --- END OF LOGIC ---


  if (loadingProfile) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center bg-background p-6"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-secondary shadow-lg rounded-xl p-6 w-full border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">
            My Profile
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleProfileSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                name="name" 
                value={form.name}
                onChange={handleProfileChange}
                className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleProfileChange}
                className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleProfileChange}
                className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">About</label>
              <textarea
                name="about"
                value={form.about}
                onChange={handleProfileChange}
                className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none min-h-[80px]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={savingProfile} 
              className={`w-full py-2 rounded text-white transition-colors ${
                savingProfile
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90"
              }`}
            >
              {savingProfile ? "Saving..." : "Update Profile"}
            </button>
          </form>

          <hr className="my-8 border-white/10" />

          <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">
            Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none pr-10"
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

            <div>
              <label className="block text-sm text-text-secondary mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none pr-10"
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

            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border border-white/10 bg-background text-text-primary rounded focus:ring-2 focus:ring-accent outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent"
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                >
                  {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword} 
              className={`w-full py-2 rounded text-white transition ${
                savingPassword
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {savingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}