import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendOtp,
  setAuthToken,
} from "../../api";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
// -------------------

// simple date formatter (no external lib required)
function fmtDate(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

// --- DARK MODE FIXES for sub-components ---
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-text-secondary">No users yet</div> {/* <-- FIX */}
    </div>
  );
}

function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <svg
        className="animate-spin h-6 w-6 text-text-secondary" // <-- FIX
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span className="ml-3 text-text-secondary">Loading users...</span> {/* <-- FIX */}
    </div>
  );
}

function UserRow({ u, onEdit, onDelete }) {
  return (
    <motion.tr 
      className="border-b border-white/10 hover:bg-accent/10 transition-colors" // <-- FIX
      whileHover={{ scale: 1.01 }}
    >
      <td className="px-4 py-3 cursor-pointer text-text-primary" onClick={() => onEdit(u)}>{u.name}</td> {/* <-- FIX */}
      <td className="px-4 py-3 cursor-pointer text-text-primary" onClick={() => onEdit(u)}>{u.email}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-text-secondary">{u.role}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-text-secondary">{u.department || "—"}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-text-secondary">{u.phone || "—"}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-text-secondary">{u.active ? "Active" : "Disabled"}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-sm text-text-secondary">{fmtDate(u.createdAt)}</td> {/* <-- FIX */}
      <td className="px-4 py-3 text-sm text-text-secondary">{fmtDate(u.updatedAt)}</td> {/* <-- FIX */}
      <td className="px-4 py-3">
        <button onClick={() => onDelete(u)} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">
          Delete
        </button>
      </td>
    </motion.tr>
  );
}

function UserCard({ u, onEdit, onDelete }) {
  return (
    <motion.div 
      className="bg-secondary shadow-lg rounded-lg p-4 border border-white/10" // <-- FIX
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start">
        <div className="cursor-pointer" onClick={() => onEdit(u)}>
          <div className="font-semibold text-text-primary">{u.name}</div> {/* <-- FIX */}
          <div className="text-sm text-text-secondary">{u.email}</div> {/* <-- FIX */}
        </div>
        <div className="text-sm text-text-secondary">{u.role}</div> {/* <-- FIX */}
      </div>

      <div className="mt-3 text-sm text-text-secondary"> {/* <-- FIX */}
        <div>{u.department || "No department"}</div>
        <div>{u.phone || "No phone"}</div>
        <div className="mt-2 text-xs text-text-secondary/70">{u.active ? "Active" : "Disabled"}</div> {/* <-- FIX */}
        <div className="mt-2 text-xs text-text-secondary/70">Created: {fmtDate(u.createdAt)}</div> {/* <-- FIX */}
        <div className="text-xs text-text-secondary/70">Updated: {fmtDate(u.updatedAt)}</div> {/* <-- FIX */}
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => onEdit(u)} className="bg-accent hover:bg-accent/90 text-white px-3 py-1 rounded text-sm transition-colors">Edit</button> {/* <-- FIX */}
        <button onClick={() => onDelete(u)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">Delete</button> {/* <-- FIX */}
      </div>
    </motion.div>
  );
}
// --- END of sub-components ---


// --- Stagger Animation Variants ---
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
// --------------------------------


export default function ManageUsers() {
  const navigate = useNavigate();

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const emptyForm = { name: "", email: "", password: "", role: "TEACHER", department: "", phone: "", active: true };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() => setResendCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCountdown]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const saved = localStorage.getItem("jwt_token");
      if (saved) setAuthToken(saved);
    } catch (e) { }

    try {
      const res = await getAllUsers();
      let data = res.data;
      let list = [];
      if (!data) { list = []; }
      else if (Array.isArray(data)) { list = data; }
      else if (Array.isArray(data.users)) { list = data.users; }
      else if (Array.isArray(data.data)) { list = data.data; }
      else if (Array.isArray(data.result)) { list = data.result; }
      else { const maybeArray = Object.values(data).find(v => Array.isArray(v)); if (maybeArray) list = maybeArray; }
      setUsers(list);
    } catch (err) {
      console.error("ManageUsers.loadUsers() error:", err);
      if (err.response && err.response.status === 401) {
        try { setAuthToken(null); } catch (e) { localStorage.removeItem("jwt_token"); }
        setError("Unauthorized. Please login again.");
        setTimeout(() => navigate("/login"), 700);
        return;
      }
      if (err.response && err.response.data && err.response.data.error) { setError(err.response.data.error); }
      else if (err.message) { setError(err.message); }
      else { setError("Failed to load users"); }
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]); // eslint-disable-line

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function openCreate() {
    setEditingUser(null); setForm(emptyForm); setFormError(""); setSuccessMsg("");
    setOtpStep(false); setOtpValue(""); setOtpError(""); setOtpSuccess(""); setModalOpen(true);
  }

  function openEdit(u) {
    setEditingUser(u);
    setForm({
      name: u.name || "", email: u.email || "", password: "", role: u.role || "TEACHER",
      department: u.department || "", phone: u.phone || "", active: !!u.active,
    });
    setFormError(""); setSuccessMsg(""); setOtpStep(false); setOtpValue("");
    setOtpError(""); setOtpSuccess(""); setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false); setEditingUser(null); setForm(emptyForm); setOtpStep(false);
    setOtpValue(""); setOtpError(""); setOtpSuccess(""); setFormError("");
    setSuccessMsg(""); setShowPassword(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function validateForm(isEdit) {
    if (!form.name || !form.name.trim()) return "Name is required";
    if (!isEdit) {
      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return "A valid email is required";
      if (!form.password || form.password.length < 8) return "Password must be at least 8 characters";
    }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) return "Phone must be 10 digits (start 6/7/8/9)";
    if (!["ADMIN", "TEACHER"].includes((form.role || "").toUpperCase())) return "Role must be ADMIN or TEACHER";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(""); setSuccessMsg(""); setOtpError(""); setOtpSuccess("");
    const isEdit = !!editingUser;
    const v = validateForm(isEdit);
    if (v) { setFormError(v); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const payload = {
          name: form.name, phone: form.phone || null, department: form.department || null, role: form.role,
        };
        if (form.password && form.password.trim().length > 0) {
          payload.passwordHash = form.password;
        }
        const id = editingUser.id || editingUser._id;
        await updateUser(id, payload);
        setSuccessMsg("User updated");
        await loadUsers();
        setTimeout(() => closeModal(), 700);
      } else {
        const payload = {
          name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password,
          role: form.role, department: form.department ? form.department.trim() : undefined,
          phone: form.phone ? form.phone.trim() : undefined
        };
        await createUser(payload);
        setSuccessMsg("User created — waiting for verification via OTP");
        setOtpStep(true); setOtpValue(""); setOtpError(""); setOtpSuccess("");
        setResendCountdown(60);
        await loadUsers();
      }
    } catch (err) {
      console.error("Save user failed", err);
      if (err.response && err.response.status === 401) {
        try { setAuthToken(null); } catch (e) { localStorage.removeItem("jwt_token"); }
        navigate("/login"); return;
      }
      setFormError(err?.response?.data?.error || (err.message || "Failed to save user"));
    } finally {
      setSaving(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setOtpError(""); setOtpSuccess("");
    if (!otpValue || otpValue.trim().length === 0) { setOtpError("Enter OTP"); return; }
    try {
      await verifyEmail({ email: form.email.trim().toLowerCase(), otp: otpValue.trim() });
      setOtpSuccess("Email verified — user is now active");
      setOtpError("");
      await loadUsers();
      setTimeout(() => closeModal(), 800);
    } catch (err) {
      console.error("OTP verify failed", err);
      const msg = err?.response?.data?.error || err.message || "OTP verification failed";
      setOtpError(msg);
    }
  }

  async function handleResendOtp() {
    if (resendCountdown > 0) return;
    setOtpError(""); setOtpSuccess("");
    try {
      await resendOtp({ email: form.email.trim().toLowerCase() });
      setOtpSuccess("OTP resent — check email");
      setResendCountdown(60);
    } catch (err) {
      console.error("resend otp failed", err);
      const msg = err?.response?.data?.error || err.message || "Resend failed";
      setOtpError(msg);
      setResendCountdown(30);
    }
  }

  function askDelete(u) {
    setToDelete(u);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUser(toDelete.id || toDelete._id);
      setConfirmOpen(false);
      setToDelete(null);
      await loadUsers();
    } catch (err) {
      console.error("Delete failed", err);
      if (err.response && err.response.status === 401) {
        try { setAuthToken(null); } catch (e) { localStorage.removeItem("jwt_token"); }
        navigate("/login"); return;
      }
      setError(err?.response?.data?.error || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }
  // --- END OF LOGIC ---

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      exit={{ opacity: 0 }} 
      className="p-6 min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">Manage Users</h1> {/* <-- FIX */}

          <div className="flex gap-3 items-center w-full md:w-auto">
            <input
              placeholder="Search name, email, role, dept..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 w-full md:w-96 focus:ring-2 focus:ring-accent" // <-- FIX
            />
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-white/10 rounded-md px-2 py-2 bg-background text-text-primary focus:ring-2 focus:ring-accent" // <-- FIX
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded shadow transition-colors">+ Create user</button> {/* <-- FIX */}
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-4 p-3 rounded bg-red-500/10 text-red-500 border border-red-500/20"> {/* <-- FIX */}
            <div className="flex items-center justify-between">
              <div>{error}</div>
              <div className="flex gap-2">
                <button onClick={() => loadUsers()} className="text-sm px-2 py-1 border border-red-500/20 rounded hover:bg-red-500/20">Retry</button> {/* <-- FIX */}
                <button onClick={() => { setError(""); }} className="text-sm px-2 py-1 border border-red-500/20 rounded hover:bg-red-500/20">Dismiss</button> {/* <-- FIX */}
              </div>
            </div>
          </motion.div>
        )}

        {/* Desktop table */}
        <motion.div variants={itemVariants} className="hidden md:block bg-secondary shadow-lg rounded-lg overflow-hidden border border-white/10"> {/* <-- FIX */}
          {loading ? (
            <Spinner />
          ) : !users || users.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-background text-left text-sm text-text-secondary border-b border-white/10"> {/* <-- FIX */}
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <UserRow key={u.id || u._id || u.email} u={u} onEdit={openEdit} onDelete={askDelete} />
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Mobile cards */}
        <motion.div variants={itemVariants} className="md:hidden grid gap-4">
          {loading ? (
            <Spinner />
          ) : !users || users.length === 0 ? (
            <EmptyState />
          ) : (
            paged.map(u => (
              <UserCard key={u.id || u._id || u.email} u={u} onEdit={openEdit} onDelete={askDelete} />
            ))
          )}
        </motion.div>

        {/* pagination controls */}
        <motion.div variants={itemVariants} className="mt-4 flex items-center justify-between">
          <div className="text-sm text-text-secondary"> {/* <-- FIX */}
            Showing {filtered.length === 0 ? 0 : ( (page-1)*pageSize + 1 ) } - { Math.min(page*pageSize, filtered.length) } of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page===1} className="px-2 py-1 border border-white/10 bg-secondary text-text-primary rounded disabled:opacity-50 hover:bg-accent/10">First</button> {/* <-- FIX */}
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-2 py-1 border border-white/10 bg-secondary text-text-primary rounded disabled:opacity-50 hover:bg-accent/10">Prev</button> {/* <-- FIX */}
            <div className="px-3 py-1 border border-white/10 bg-secondary text-text-primary rounded">Page {page} / {totalPages}</div> {/* <-- FIX */}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-2 py-1 border border-white/10 bg-secondary text-text-primary rounded disabled:opacity-50 hover:bg-accent/10">Next</button> {/* <-- FIX */}
            <button onClick={() => setPage(totalPages)} disabled={page===totalPages} className="px-2 py-1 border border-white/10 bg-secondary text-text-primary rounded disabled:opacity-50 hover:bg-accent/10">Last</button> {/* <-- FIX */}
          </div>
        </motion.div>
      </div>

      {/* Floating add button (mobile) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openCreate} 
        className="fixed right-6 bottom-6 md:hidden bg-accent text-white w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center" // <-- FIX
        aria-label="Add user"
      >
        +
      </motion.button>

      {/* Create/Edit Modal */}
      <AnimatePresence>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" // <-- FIX
            onClick={closeModal} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative max-w-xl w-full bg-secondary rounded-lg shadow-lg overflow-auto max-h-[90vh] border border-white/10" // <-- FIX
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center"> {/* <-- FIX */}
              <h2 className="text-lg font-semibold text-text-primary">{editingUser ? "Edit user" : "Create user"}</h2> {/* <-- FIX */}
              <button onClick={closeModal} className="text-text-secondary hover:text-text-primary">✕</button> {/* <-- FIX */}
            </div>

            <div className="p-4">
              {successMsg && <div className="mb-3 text-green-500">{successMsg}</div>} {/* <-- FIX */}

              {otpStep ? (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="text-sm text-text-secondary">Enter the 6-digit OTP sent to <strong>{form.email}</strong></div> {/* <-- FIX */}

                  <div>
                    <input
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder="Enter OTP"
                      className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" // <-- FIX
                    />
                  </div>

                  {otpError && <div className="text-red-500">{otpError}</div>} {/* <-- FIX */}
                  {otpSuccess && <div className="text-green-500">{otpSuccess}</div>} {/* <-- FIX */}

                  <div className="flex items-center gap-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Verify OTP</button>
                    <button type="button" onClick={handleResendOtp} disabled={resendCountdown > 0} className="px-3 py-2 border border-white/10 bg-secondary text-text-primary rounded hover:bg-white/10"> {/* <-- FIX */}
                      {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : "Resend OTP"}
                    </button>
                    <button type="button" onClick={() => { setOtpStep(false); setOtpValue(""); setOtpError(""); setOtpSuccess(""); }} className="px-3 py-2 border border-white/10 bg-secondary text-text-primary rounded hover:bg-white/10">Cancel</button> {/* <-- FIX */}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && <div className="text-red-500">{formError}</div>} {/* <-- FIX */}
                  {successMsg && !otpStep && <div className="text-green-500">{successMsg}</div>} {/* <-- FIX */}

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Full name</label> {/* <-- FIX */}
                    <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" /> {/* <-- FIX */}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label> {/* <-- FIX */}
                    <input name="email" value={form.email} onChange={handleChange} className="mt-1 w-full border border-white/10 bg-background-light text-text-secondary rounded-md px-3 py-2" placeholder="user@example.com" disabled={!!editingUser} /> {/* <-- FIX */}
                    {editingUser && <div className="text-xs text-text-secondary mt-1">Email is read-only</div>} {/* <-- FIX */}
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Password</label> {/* <-- FIX */}
                      <div className="relative">
                        <input
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          type={showPassword ? "text" : "password"}
                          className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 pr-20 focus:ring-2 focus:ring-accent" // <-- FIX
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="absolute right-2 top-2 text-sm text-accent" // <-- FIX
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Role</label> {/* <-- FIX */}
                    <select name="role" value={form.role} onChange={handleChange} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent"> {/* <-- FIX */}
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Department</label> {/* <-- FIX */}
                    <input name="department" value={form.department} onChange={handleChange} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" /> {/* <-- FIX */}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Phone (optional)</label> {/* <-- FIX */}
                    <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" /> {/* <-- FIX */}
                  </div>

                  {editingUser && (
                    <div className="flex items-center gap-3">
                      <input id="active" name="active" type="checkbox" checked={form.active} onChange={handleChange} className="h-4 w-4 rounded text-accent focus:ring-accent"/> {/* <-- FIX */}
                      <label htmlFor="active" className="text-sm text-text-secondary">Active</label> {/* <-- FIX */}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"> {/* <-- FIX */}
                      {saving ? "Saving..." : (editingUser ? "Save changes" : "Create user")}
                    </button>
                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded border border-white/10 bg-secondary text-text-primary hover:bg-white/10">Cancel</button> {/* <-- FIX */}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" // <-- FIX
            onClick={() => setConfirmOpen(false)} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative max-w-md w-full bg-secondary rounded-lg shadow-lg p-4 border border-white/10" // <-- FIX
          >
            <h3 className="text-lg font-semibold mb-2 text-text-primary">Confirm delete</h3> {/* <-- FIX */}
            <p className="text-sm text-text-secondary mb-4">Are you sure you want to delete <strong>{toDelete?.name}</strong> ({toDelete?.email})? This action cannot be undone.</p> {/* <-- FIX */}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 rounded border border-white/10 bg-secondary text-text-primary hover:bg-white/10">Cancel</button> {/* <-- FIX */}
              <button onClick={confirmDelete} disabled={deleting} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button> {/* <-- FIX */}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}