import React, { useState, useEffect } from "react";
import { getCurrentUser, updateProfile, changePassword } from "../../api";
import { useNavigate } from "react-router-dom";

// --- NEW IMPORTS ---
import { motion } from "framer-motion";
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
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
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
      const res = await getCurrentUser();
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        department: res.data.department || "",
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
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
      });
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background p-6 flex justify-center" // <-- DARK MODE FIX
    >
      <div className="w-full max-w-2xl">
        {loadingProfile ? (
          <div className="text-text-secondary">Loading profile...</div> // <-- DARK MODE FIX
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="bg-secondary rounded-lg shadow border border-white/10 p-6"> {/* <-- DARK MODE FIX */}
              <h2 className="text-2xl font-semibold mb-4 text-text-primary">Profile</h2> {/* <-- DARK MODE FIX */}

              {error && <div className="mb-3 text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>} {/* <-- DARK MODE FIX */}
              {message && <div className="mb-3 text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">{message}</div>} {/* <-- DARK MODE FIX */}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Name</label> {/* <-- DARK MODE FIX */}
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Email (read-only)</label> {/* <-- DARK MODE FIX */}
                  <input
                    name="email"
                    value={profile.email}
                    disabled
                    className="mt-1 w-full border border-white/10 bg-background/50 text-text-secondary rounded-md px-3 py-2 cursor-not-allowed" // <-- DARK MODE FIX
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Phone</label> {/* <-- DARK MODE FIX */}
                  <input
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleProfileChange}
                    className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Department</label> {/* <-- DARK MODE FIX */}
                  <input
                    name="department"
                    value={profile.department || ""}
                    onChange={handleProfileChange}
                    className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-accent text-white px-4 py-2 rounded hover:bg-accent/90 disabled:opacity-60 transition-colors" // <-- DARK MODE FIX
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>

                  <button
                    type="button"
                    onClick={loadProfile}
                    className="bg-secondary text-text-primary px-4 py-2 rounded border border-white/10 hover:bg-white/10 transition-colors" // <-- DARK MODE FIX
                  >
                    Reload
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-secondary rounded-lg shadow border border-white/10 p-6 mt-6"> {/* <-- DARK MODE FIX */}
              <h3 className="text-lg font-medium mb-3 text-text-primary">Change password</h3> {/* <-- DARK MODE FIX */}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <input
                  name="oldPassword"
                  type="password"
                  placeholder="Current password"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  required
                />
                <input
                  name="newPassword"
                  type="password"
                  placeholder="New password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  required
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
                  required
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60 transition-colors" // (Kept semantic green)
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" })}
                    className="bg-secondary text-text-primary px-4 py-2 rounded border border-white/10 hover:bg-white/10 transition-colors" // <-- DARK MODE FIX
                  >
                    Clear
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}