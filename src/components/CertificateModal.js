// src/components/CertificateModal.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * CertificateModal
 * - course: { courseId, title, percent, total, completed }
 * - onClose: () => {}
 * - onGenerate: () => Promise<void> | void
 */
export default function CertificateModal({ course, onClose, onGenerate }) {
  const [busy, setBusy] = useState(false);

  const handleGenerate = async () => {
    try {
      setBusy(true);
      await onGenerate();
    } catch (e) {
      console.error("Generate failed", e);
      alert("Failed to generate certificate");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  if (!course) return null;
  const { title, percent, total, completed } = course;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Certificate Preview</h3>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">Close</button>
        </div>

        <div className="p-6">
          <div className="border rounded-lg p-6 text-center bg-gradient-to-r from-indigo-50 to-white">
            <div className="text-sm text-gray-600 mb-2">Certificate of Completion</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{title}</div>
            <div className="text-sm text-gray-700 mb-4">Awarded to</div>
            <div className="text-lg font-medium mb-3">[Your Name]</div>

            <div className="text-sm text-gray-600">
              <div>Progress: <strong>{Math.round(percent)}%</strong></div>
              <div>{completed}/{total} videos completed</div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
            <button
              onClick={handleGenerate}
              disabled={busy}
              className={`px-4 py-2 rounded-md text-sm font-medium ${busy ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {busy ? "Generating..." : "Generate & Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CertificateModal.propTypes = {
  course: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};
