import React, { useEffect, useState } from "react";
import { settings as settingsApi } from "../../api";
import SettingSwitch from "../../components/Admin/SystemSettings/SettingSwitch";
import SettingSelect from "../../components/Admin/SystemSettings/SettingSelect";
import ResetSettingsModal from "../../components/Admin/SystemSettings/ResetSettingsModal";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
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

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getSettings();
      setSettings(res.data);
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await settingsApi.updateSettings(settings);
      setSettings(res.data);
      alert("✅ Settings updated successfully!");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await settingsApi.resetSettings();
      setShowReset(false);
      await loadSettings();
      alert("🔄 Settings reset to default!");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to reset settings.");
    }
  };
  // --- END OF LOGIC ---

  if (loading) {
    return <div className="p-6 text-text-secondary">Loading system settings...</div>; // <-- DARK MODE FIX
  }

  if (!settings) {
    return <div className="p-6 text-red-500">No settings found.</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="p-6 max-w-3xl mx-auto min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <motion.h2 
        variants={itemVariants} 
        className="text-2xl font-semibold text-text-primary mb-4" // <-- DARK MODE FIX
      >
        ⚙️ System Settings
      </motion.h2>

      <motion.div variants={itemVariants}>
        <ScrollAnimation>
          <div className="bg-secondary shadow rounded-lg p-4 divide-y divide-white/10 border border-white/10"> {/* <-- DARK MODE FIX */}
            
            {/* These components below (SettingSwitch, SettingSelect) will still be white */}
            {/* We must fix them in their own files */}
            
            <SettingSwitch
              label="Auto Approve Courses"
              checked={settings.autoApproveCourses}
              onChange={(v) =>
                setSettings((s) => ({ ...s, autoApproveCourses: v }))
              }
              description="Automatically approve student course requests"
            />

            <SettingSwitch
              label="Maintenance Mode"
              checked={settings.maintenanceMode}
              onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
              description="Put platform into read-only maintenance mode"
            />

            <SettingSwitch
              label="Allow Student Registration"
              checked={settings.allowRegistration}
              onChange={(v) => setSettings((s) => ({ ...s, allowRegistration: v }))}
              description="Enable or disable new student registration"
            />

            <SettingSelect
              label="Default User Role"
              value={settings.defaultUserRole}
              options={[
                { value: "STUDENT", label: "Student" },
                { value: "TEACHER", label: "Teacher" },
              ]}
              onChange={(v) => setSettings((s) => ({ ...s, defaultUserRole: v }))}
            />

            <SettingSelect
              label="Theme Mode"
              value={settings.themeMode}
              options={[
                { value: "light", label: "Light Mode" },
                { value: "dark", label: "Dark Mode" },
              ]}
              onChange={(v) => setSettings((s) => ({ ...s, themeMode: v }))}
            />
          </div>
        </ScrollAnimation>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between mt-6">
        <button
          onClick={() => setShowReset(true)}
          className="px-4 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors" // <-- DARK MODE FIX
        >
          Reset Defaults
        </button>

        <button
          disabled={saving}
          onClick={handleSave}
          className={`px-6 py-2 text-white rounded-md transition-colors ${
            saving ? "bg-gray-500 cursor-not-allowed" : "bg-accent hover:bg-accent/90" // <-- DARK MODE FIX
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>

      <AnimatePresence>
        {/* This component (ResetSettingsModal) still needs its dark mode fix inside it */}
        {showReset && (
          <ResetSettingsModal
            show={showReset}
            onClose={() => setShowReset(false)}
            onConfirm={handleReset}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}