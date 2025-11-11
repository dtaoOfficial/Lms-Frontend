import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../../api"; // your axios instance (withCredentials + interceptors)
// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "../../components/ScrollAnimation";
// -------------------

// -------------------- ICONS (inline SVG components) --------------------
// (Your icons are unchanged, so I am hiding them for brevity)
const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a1 1 0 01-.454.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.454l9.9-9.9a2 2 0 012.828 0z" />
  </svg>
);
const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M7 4a1 1 0 011-1h4a1 1 0 011 1h3a1 1 0 110 2h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h3zm2 3a1 1 0 10-2 0v7a1 1 0 102 0V7zm4 0a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd" />
  </svg>
);
const ChevronLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.879a1 1 0 111.516-1.302l5 5.879a1 1 0 010 1.302l-5 5.879a1 1 0 01-1.516 0z" clipRule="evenodd" />
  </svg>
);
const VideoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9l4 3V7l-4 3V7a2 2 0 00-2-2H4z" />
  </svg>
);
const BookOpenIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 6v11a1 1 0 01-1 1H8a2 2 0 00-2 2V6a1 1 0 011-1h12a1 1 0 011 1zM3 5h2v14a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
);
const GripVerticalIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M7 4a1 1 0 112 0 1 1 0 01-2 0zM7 10a1 1 0 112 0 1 1 0 01-2 0zM7 16a1 1 0 112 0 1 1 0 01-2 0zM11 4a1 1 0 112 0 1 1 0 01-2 0zM11 10a1 1 0 112 0 1 1 0 01-2 0zM11 16a1 1 0 112 0 1 1 0 01-2 0z" />
  </svg>
);
const XMark = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
// -------------------- UTIL (UNCHANGED) --------------------
function getEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } else if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return url;
  } catch (err) {
    return url;
  }
}

// -------------------- REUSABLE COMPONENTS (FIXED) --------------------
const Modal = ({ isOpen, onClose, children, className = "max-w-2xl" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" // <-- DARK MODE FIX
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className={`relative z-10 w-full ${className} bg-secondary border border-white/10 rounded-lg shadow-lg overflow-auto max-h-[90vh]`} // <-- DARK MODE FIX
          >
            <div className="p-6">{children}</div> {/* <-- Increased padding */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const EmptyState = ({ title = "No items", subtitle = "", onAdd, addLabel = "Create" }) => (
  <div className="text-center py-20">
    <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary"> {/* <-- DARK MODE FIX */}
      <BookOpenIcon className="w-8 h-8 text-text-secondary" /> {/* <-- DARK MODE FIX */}
    </div>
    <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3> {/* <-- DARK MODE FIX */}
    {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>} {/* <-- DARK MODE FIX */}
    <div className="mt-4">
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"> {/* <-- DARK MODE FIX */}
        <PlusIcon /> {addLabel}
      </button>
    </div>
  </div>
);

const VideoPlayerModal = ({ video, onClose }) => {
  if (!video) return null;
  const src = getEmbedUrl(video.videoUrl);
  return (
    <Modal isOpen={!!video} onClose={onClose} className="max-w-3xl">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-text-primary">{video.title}</h2> {/* <-- DARK MODE FIX */}
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><XMark/></button> {/* <-- DARK MODE FIX */}
      </div>
      <div className="mt-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden"> {/* <-- ADDED ROUNDED */}
          <iframe src={src} title={video.title} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
        </div>
        {video.description && <p className="mt-3 text-sm text-text-secondary">{video.description}</p>} {/* <-- DARK MODE FIX */}
      </div>
    </Modal>
  );
};

// Removed duplicate XMarkIconSVG

const ConfirmationModal = ({ isOpen, title = "Confirm", message, onCancel, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onCancel}>
    <div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3> {/* <-- DARK MODE FIX */}
      <p className="mt-2 text-sm text-text-secondary">{message}</p> {/* <-- DARK MODE FIX */}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button> {/* <-- DARK MODE FIX */}
        <button onClick={onConfirm} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors">Confirm Delete</button>
      </div>
    </div>
  </Modal>
);

// -------------------- FORMS (FIXED) --------------------
function CourseForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    thumbnailUrl: initial.thumbnailUrl || initial.thumbnail || ""
  });

  useEffect(() => {
    setForm({
      title: initial.title || "",
      description: initial.description || "",
      thumbnailUrl: initial.thumbnailUrl || initial.thumbnail || ""
    });
  }, [initial]);

  const save = () => {
    if (!form.title.trim()) return alert("Title required");
    onSave({ ...initial, ...form, thumbnailUrl: form.thumbnailUrl });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-text-primary">{initial.id ? "Edit Course" : "Create Course"}</h3>
      <label className="block">
        <span className="text-sm text-text-secondary">Title</span>
        <input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" />
      </label>
      <label className="block mt-3">
        <span className="text-sm text-text-secondary">Description</span>
        <textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" rows={3} />
      </label>
      <label className="block mt-3">
        <span className="text-sm text-text-secondary">Thumbnail URL (optional)</span>
        <input value={form.thumbnailUrl} onChange={e => setForm(s => ({ ...s, thumbnailUrl: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" />
      </label>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={save} className="px-3 py-2 rounded bg-accent text-white hover:bg-accent/90 transition-colors">{initial.id ? "Save" : "Create"}</button>
      </div>
    </div>
  );
}

function ChapterForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({ title: initial.title || "", description: initial.description || "" });
  useEffect(() => setForm({ title: initial.title || "", description: initial.description || "" }), [initial]);
  const save = () => {
    if (!form.title.trim()) return alert("Title required");
    onSave({ ...initial, ...form });
  };
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-text-primary">{initial.id ? "Edit Chapter" : "Create Chapter"}</h3>
      <label className="block">
        <span className="text-sm text-text-secondary">Title</span>
        <input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" />
      </label>
      <label className="block mt-3">
        <span className="text-sm text-text-secondary">Description</span>
        <textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" rows={3} />
      </label>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={save} className="px-3 py-2 rounded bg-accent text-white hover:bg-accent/90 transition-colors">{initial.id ? "Save" : "Create"}</button>
      </div>
    </div>
  );
}

function VideoForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    videoUrl: initial.videoUrl || ""
  });
  useEffect(() => setForm({
    title: initial.title || "",
    description: initial.description || "",
    videoUrl: initial.videoUrl || ""
  }), [initial]);

  const save = () => {
    if (!form.title.trim()) return alert("Title required");
    if (!form.videoUrl.trim()) return alert("Video URL required");
    onSave({ ...initial, ...form });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-text-primary">{initial.id ? "Edit Video" : "Create Video"}</h3>
      <label className="block">
        <span className="text-sm text-text-secondary">Title</span>
        <input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" />
      </label>
      <label className="block mt-3">
        <span className="text-sm text-text-secondary">Video URL (YouTube link or embed)</span>
        <input value={form.videoUrl} onChange={e => setForm(s => ({ ...s, videoUrl: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" />
      </label>
      <label className="block mt-3">
        <span className="text-sm text-text-secondary">Description</span>
        <textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} className="mt-1 w-full border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" rows={3} />
      </label>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
        <button onClick={save} className="px-3 py-2 rounded bg-accent text-white hover:bg-accent/90 transition-colors">{initial.id ? "Save" : "Create"}</button>
      </div>
    </div>
  );
}

// -------------------- MAIN APP (UNCHANGED LOGIC) --------------------
export default function ManageCourses() {
  // data stores
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]); // loaded for selected course
  const [videos, setVideos] = useState([]); // loaded for selected chapter

  // UI state
  const [currentView, setCurrentView] = useState("courses"); // courses | chapters | videos
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ type: null, data: null });
  const [videoToPreview, setVideoToPreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, onConfirm: null, title: "", message: "" });

  // drag state for chapters reorder
  const [draggedChapterId, setDraggedChapterId] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadCourses();
    return () => { isMountedRef.current = false; };
  }, []);

  // ---------- Normalizer (UNCHANGED) ----------
  function normalizeCourse(raw) {
    return {
      id: raw.id ?? raw._id ?? raw.courseId ?? null,
      title: raw.title ?? raw.name ?? "",
      description: raw.description ?? raw.desc ?? "",
      thumbnailUrl: raw.thumbnailUrl ?? raw.thumbnail ?? raw.thumbnail_url ?? "",
      instructor: raw.instructor ?? raw.author ?? "",
      duration: raw.duration ?? raw.length ?? "",
      tags: raw.tags ?? raw.category ?? ""
    };
  }

  // ---------- Loaders (UNCHANGED) ----------
  async function loadCourses() {
    try {
      const res = await api.get("/api/courses");
      if (!isMountedRef.current) return;
      const list = Array.isArray(res.data) ? res.data : [];
      const normalized = list.map(normalizeCourse);
      setCourses(normalized);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  }

  async function loadChapters(courseId) {
    try {
      const res = await api.get(`/api/courses/${courseId}/chapters`);
      if (!isMountedRef.current) return;
      setChapters(res.data || []);
    } catch (err) {
      console.error("Failed to load chapters", err);
    }
  }

  async function loadVideos(chapterId) {
    try {
      const res = await api.get(`/api/courses/chapters/${chapterId}/videos`);
      if (!isMountedRef.current) return;
      setVideos(res.data || []);
    } catch (err) {
      console.error("Failed to load videos", err);
    }
  }

  // ---------- CRUD: Courses (UNCHANGED) ----------
  const handleCreateCourse = () => setModal({ type: "course", data: null });
  const handleEditCourse = (c) => setModal({ type: "course", data: c });

  async function saveCourse(payload) {
    try {
      if (payload.id) {
        const body = { ...payload };
        delete body.id;
        const res = await api.put(`/api/courses/${payload.id}`, body);
        const normalized = normalizeCourse(res.data || res.data?.course || payload);
        setCourses(s => s.map(c => (c.id === payload.id ? normalized : c)));
        if (selectedCourseId === payload.id) {
          setSelectedCourse(normalized);
        }
      } else {
        const res = await api.post("/api/courses", payload);
        const normalized = normalizeCourse(res.data || payload);
        setCourses(s => [normalized, ...s]);
      }
      setModal({ type: null, data: null });
    } catch (err) {
      console.error("Course save error", err);
      alert(err?.response?.data?.error || "Failed to save course");
    }
  }

  function confirmDeleteCourse(course) {
    setDeleteConfirm({
      open: true,
      title: "Delete course?",
      message: `Delete "${course.title}" and all its chapters & videos? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/courses/${course.id}`);
          setCourses(s => s.filter(x => x.id !== course.id));
          if (selectedCourseId === course.id) {
            setSelectedCourseId(null);
            setSelectedCourse(null);
            setCurrentView("courses");
            setChapters([]);
            setVideos([]);
          }
        } catch (err) {
          console.error("Delete course failed", err);
          alert("Delete failed");
        } finally {
          setDeleteConfirm({ open: false, onConfirm: null, title: "", message: "" });
        }
      }
    });
  }

  // ---------- Chapters (UNCHANGED) ----------
  function openChapters(course) {
    setSelectedCourseId(course.id);
    setSelectedCourse(course);
    setCurrentView("chapters");
    loadChapters(course.id);
    setVideos([]);
    setSelectedChapterId(null);
    setSelectedChapter(null);
  }

  function backToCourses() {
    setCurrentView("courses");
    setSelectedCourseId(null);
    setSelectedCourse(null);
    setChapters([]);
    setVideos([]);
  }

  const handleCreateChapter = () => setModal({ type: "chapter", data: { courseId: selectedCourseId } });
  const handleEditChapter = (ch) => setModal({ type: "chapter", data: ch });

  async function saveChapter(payload) {
    try {
      if (payload.id) {
        const res = await api.put(`/api/courses/chapters/${payload.id}`, payload);
        setChapters(s => s.map(c => (c.id === payload.id ? res.data : c)));
      } else {
        payload.courseId = selectedCourseId;
        const res = await api.post(`/api/courses/${selectedCourseId}/chapters`, payload);
        setChapters(s => [...s, res.data].sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      setModal({ type: null, data: null });
    } catch (err) {
      console.error("Chapter save error", err);
      alert(err?.response?.data?.error || "Failed to save chapter");
    }
  }

  function confirmDeleteChapter(ch) {
    setDeleteConfirm({
      open: true,
      title: "Delete chapter?",
      message: `Delete "${ch.title}" and its videos?`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/courses/chapters/${ch.id}`);
          setChapters(s => s.filter(x => x.id !== ch.id));
          if (selectedChapterId === ch.id) {
            setSelectedChapterId(null);
            setSelectedChapter(null);
            setVideos([]);
            setCurrentView("chapters");
          }
        } catch (err) {
          console.error("Delete chapter failed", err);
          alert("Delete failed");
        } finally {
          setDeleteConfirm({ open: false, onConfirm: null, title: "", message: "" });
        }
      }
    });
  }

  // ---------- Chapters drag & drop (UNCHANGED) ----------
  function onChapterDragStart(e, ch) {
    setDraggedChapterId(ch.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onChapterDragOver(e, targetCh) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function onChapterDrop(e, targetCh) {
    e.preventDefault();
    const fromId = draggedChapterId;
    const toId = targetCh.id;
    if (!fromId || fromId === toId) {
      setDraggedChapterId(null);
      return;
    }

    const currentList = [...chapters];
    const fromIndex = currentList.findIndex(c => c.id === fromId);
    const toIndex = currentList.findIndex(c => c.id === toId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedChapterId(null);
      return;
    }
    
    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);
    
    const updated = currentList.map((c, idx) => ({ ...c, order: idx + 1 }));
    setChapters(updated);

    try {
      await Promise.all(
        updated.map(c =>
          api.put(`/api/courses/chapters/${c.id}`, { ...c })
        )
      );
    } catch (err) {
      console.error("Failed to persist chapter order", err);
      alert("Could not save new order. Reloading.");
      loadChapters(selectedCourseId);
    } finally {
      setDraggedChapterId(null);
    }
  }

  // ---------- Videos (UNCHANGED) ----------
  function openVideos(chapter) {
    setSelectedChapterId(chapter.id);
    setSelectedChapter(chapter);
    setCurrentView("videos");
    loadVideos(chapter.id);
  }

  function backToChapters() {
    setCurrentView("chapters");
    setSelectedChapterId(null);
    setSelectedChapter(null);
    setVideos([]);
  }

  const handleCreateVideo = () => setModal({ type: "video", data: { chapterId: selectedChapterId } });
  const handleEditVideo = (v) => setModal({ type: "video", data: v });

  async function saveVideo(payload) {
    try {
      if (payload.id) {
        const res = await api.put(`/api/courses/videos/${payload.id}`, payload);
        setVideos(s => s.map(x => (x.id === payload.id ? res.data : x)));
      } else {
        payload.chapterId = selectedChapterId;
        const res = await api.post(`/api/courses/chapters/${selectedChapterId}/videos`, payload);
        setVideos(s => [...s, res.data].sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      setModal({ type: null, data: null });
    } catch (err) {
      console.error("Video save error", err);
      alert(err?.response?.data?.error || "Failed to save video");
    }
  }

  function confirmDeleteVideo(v) {
    setDeleteConfirm({
      open: true,
      title: "Delete video?",
      message: `Delete "${v.title}"?`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/courses/videos/${v.id}`);
          setVideos(s => s.filter(x => x.id !== v.id));
        } catch (err) {
          console.error("Delete video failed", err);
          alert("Delete failed");
        } finally {
          setDeleteConfirm({ open: false, onConfirm: null, title: "", message: "" });
        }
      }
    });
  }

  // ---------- Helpers (UNCHANGED) ----------
  const filteredCourses = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c => (c.title || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
  }, [courses, searchTerm]);

  // ---------- JSX UI (FIXED) ----------
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="p-6 max-w-7xl mx-auto bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <div className="flex items-center justify-between mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === "courses" && <h1 className="text-2xl font-bold text-text-primary">Manage Courses</h1>} {/* <-- DARK MODE FIX */}
            {currentView === "chapters" && (
              <div className="flex items-center gap-3">
                <button onClick={backToCourses} className="text-text-secondary hover:text-text-primary"> {/* <-- DARK MODE FIX */}
                  <ChevronLeftIcon />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">{selectedCourse?.title || "Course"}</h1> {/* <-- DARK MODE FIX */}
                  <div className="text-sm text-text-secondary">{selectedCourse?.description}</div> {/* <-- DARK MODE FIX */}
                </div>
              </div>
            )}
            {currentView === "videos" && (
              <div className="flex items-center gap-3">
                <button onClick={backToChapters} className="text-text-secondary hover:text-text-primary"> {/* <-- DARK MODE FIX */}
                  <ChevronLeftIcon />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-text-primary">{selectedChapter?.title || "Chapter"}</h1> {/* <-- DARK MODE FIX */}
                  <div className="text-sm text-text-secondary">{selectedChapter?.description}</div> {/* <-- DARK MODE FIX */}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {currentView === "courses" && (
            <>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search courses..." className="border border-white/10 bg-background text-text-primary rounded-md px-3 py-2 focus:ring-2 focus:ring-accent" /> {/* <-- DARK MODE FIX */}
              <button onClick={handleCreateCourse} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"> {/* <-- DARK MODE FIX */}
                <PlusIcon /> Create Course
              </button>
            </>
          )}
          {currentView === "chapters" && (
            <button onClick={handleCreateChapter} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"> {/* <-- DARK MODE FIX */}
              <PlusIcon /> Add Chapter
            </button>
          )}
          {currentView === "videos" && (
            <button onClick={handleCreateVideo} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"> {/* <-- DARK MODE FIX */}
              <PlusIcon /> Add Video
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Courses view */}
        {currentView === "courses" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredCourses.length === 0 ? (
              <EmptyState title="No courses found" subtitle="Create your first course to get started" onAdd={handleCreateCourse} addLabel="Create Course" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map(course => (
                  <motion.div 
                    key={course.id} 
                    whileHover={{ scale: 1.02 }} 
                    className="bg-secondary border border-white/10 rounded-lg shadow-lg p-4 flex flex-col" // <-- DARK MODE FIX
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-14 bg-background rounded overflow-hidden flex items-center justify-center"> {/* <-- DARK MODE FIX */}
                        {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" /> : <BookOpenIcon className="w-8 h-8 text-text-secondary" />} {/* <-- DARK MODE FIX */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary truncate">{course.title}</h3> {/* <-- DARK MODE FIX */}
                        <p className="text-sm text-text-secondary truncate">{course.description}</p> {/* <-- DARK MODE FIX */}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openChapters(course)} className="text-sm px-2 py-1 bg-background border border-white/10 rounded hover:bg-white/10 text-text-secondary">Manage Chapters</button> {/* <-- DARK MODE FIX */}
                        <button onClick={() => { /* optionally implement publish */ }} className="text-sm px-2 py-1 bg-background border border-white/10 rounded hover:bg-white/10 text-text-secondary">Preview</button> {/* <-- DARK MODE FIX */}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCourse(course)} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs flex items-center gap-1"><EditIcon/> Edit</button> {/* <-- DARK MODE FIX */}
                        <button onClick={() => confirmDeleteCourse(course)} className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs flex items-center gap-1"><TrashIcon/> Delete</button> {/* <-- DARK MODE FIX */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Chapters view */}
        {currentView === "chapters" && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {chapters.length === 0 ? (
              <EmptyState title="No chapters" subtitle="Add chapters to structure the course" onAdd={handleCreateChapter} addLabel="Add Chapter" />
            ) : (
              <ul className="space-y-2">
                {chapters.map(ch => (
                  <motion.li 
                    key={ch.id} 
                    whileHover={{ scale: 1.01 }}
                    draggable 
                    onDragStart={(e) => onChapterDragStart(e, ch)} 
                    onDragOver={(e) => onChapterDragOver(e, ch)} 
                    onDrop={(e) => onChapterDrop(e, ch)} 
                    className={`bg-secondary border border-white/10 rounded-lg shadow-lg p-3 flex items-center justify-between ${draggedChapterId === ch.id ? "opacity-60" : ""}`} // <-- DARK MODE FIX
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded cursor-move"><GripVerticalIcon/></div> {/* <-- DARK MODE FIX */}
                      <div>
                        <div className="font-semibold text-text-primary">{ch.title}</div> {/* <-- DARK MODE FIX */}
                        <div className="text-sm text-text-secondary">{ch.description}</div> {/* <-- DARK MODE FIX */}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openVideos(ch)} className="text-sm px-2 py-1 bg-background border border-white/10 rounded hover:bg-white/10 text-text-secondary">Manage Videos</button> {/* <-- DARK MODE FIX */}
                      <button onClick={() => handleEditChapter(ch)} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs flex items-center gap-1"><EditIcon/> Edit</button> {/* <-- DARK MODE FIX */}
                      <button onClick={() => confirmDeleteChapter(ch)} className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs flex items-center gap-1"><TrashIcon/> Delete</button> {/* <-- DARK MODE FIX */}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Videos view */}
        {currentView === "videos" && (
          <motion.div
            key="videos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {videos.length === 0 ? (
              <EmptyState title="No videos" subtitle="Add videos to this chapter" onAdd={handleCreateVideo} addLabel="Add Video" />
            ) : (
              <ul className="space-y-2">
                {videos.map(v => (
                  <motion.li 
                    key={v.id} 
                    whileHover={{ scale: 1.01 }}
                    className="bg-secondary border border-white/10 rounded-lg shadow-lg p-3 flex items-center justify-between" // <-- DARK MODE FIX
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded"><VideoIcon/></div> {/* <-- DARK MODE FIX */}
                      <div>
                        <div className="font-semibold text-text-primary">{v.title}</div> {/* <-- DARK MODE FIX */}
                        <div className="text-sm text-text-secondary">{v.description}</div> {/* <-- DARK MODE FIX */}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setVideoToPreview(v)} className="px-2 py-1 bg-background border border-white/10 rounded hover:bg-white/10 text-text-secondary text-sm">Preview</button> {/* <-- DARK MODE FIX */}
                      <button onClick={() => handleEditVideo(v)} className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs flex items-center gap-1"><EditIcon/> Edit</button> {/* <-- DARK MODE FIX */}
                      <button onClick={() => confirmDeleteVideo(v)} className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs flex items-center gap-1"><TrashIcon/> Delete</button> {/* <-- DARK MODE FIX */}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <Modal isOpen={modal.type === "course"} onClose={() => setModal({ type: null, data: null })}>
        <CourseForm initial={modal.data || {}} onSave={saveCourse} onCancel={() => setModal({ type: null, data: null })} />
      </Modal>

      <Modal isOpen={modal.type === "chapter"} onClose={() => setModal({ type: null, data: null })}>
        <ChapterForm initial={modal.data || {}} onSave={saveChapter} onCancel={() => setModal({ type: null, data: null })} />
      </Modal>

      <Modal isOpen={modal.type === "video"} onClose={() => setModal({ type: null, data: null })}>
        <VideoForm initial={modal.data || {}} onSave={saveVideo} onCancel={() => setModal({ type: null, data: null })} />
      </Modal>

      <VideoPlayerModal video={videoToPreview} onClose={() => setVideoToPreview(null)} />

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        onCancel={() => setDeleteConfirm({ open: false, onConfirm: null, title: "", message: "" })}
        onConfirm={() => deleteConfirm.onConfirm && deleteConfirm.onConfirm()}
      />
    </motion.div>
  );
}