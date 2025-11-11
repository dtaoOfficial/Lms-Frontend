import React, { useState, useEffect } from "react";
import { updateProfile } from "../../api/users";
import toast from "react-hot-toast";
import { motion } from "framer-motion"; // <-- NEW IMPORT

const EditProfileForm = ({ profile, refresh }) => {
  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    department: profile?.department || "",
    about: profile?.about || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        department: profile.department || "",
        about: profile.about || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatePromise = updateProfile(form);
    toast.promise(updatePromise, {
      loading: "Saving profile...",
      success: "Profile updated successfully!",
      error: (err) => err.response?.data?.error || "Failed to update profile",
    });

    try {
      await updatePromise;
      refresh();
    } catch {
      // handled by toast
    } finally {
      setLoading(false);
    }
  };
  // --- END OF LOGIC ---

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-t border-white/10 pt-4" // <-- DARK MODE FIX
    >
      <div>
        <label className="block text-text-secondary font-medium">Name</label> {/* <-- DARK MODE FIX */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        />
      </div>

      <div>
        <label className="block text-text-secondary font-medium">Phone</label> {/* <-- DARK MODE FIX */}
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        />
      </div>

      <div>
        <label className="block text-text-secondary font-medium">Department</label> {/* <-- DARK MODE FIX */}
        <input
          name="department"
          value={form.department}
          onChange={handleChange}
          className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        />
      </div>

      <div>
        <label className="block text-text-secondary font-medium">About</label> {/* <-- DARK MODE FIX */}
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          rows={3}
          className="w-full border border-white/10 bg-background text-text-primary rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-accent" // <-- DARK MODE FIX
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className={`${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-accent/90"
        } bg-accent text-white px-4 py-2 rounded-lg transition-colors`} // <-- DARK MODE FIX
      >
        {loading ? "Saving..." : "Save Changes"}
      </motion.button>
    </form>
  );
};

export default EditProfileForm;