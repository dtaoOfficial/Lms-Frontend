import React, { useEffect, useMemo, useState, useRef } from "react"; // <-- FIX: Removed useCallback
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import actions from "../../api/actions";
import progressApi from "../../api/progress";
import { motion, AnimatePresence } from "framer-motion";

// --- NEW IMPORTS (FIXED) ---
import { Star, Users, Search, Play, Tag, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"; // <-- FIX: Removed Clock
// import ScrollAnimation from "../../components/ScrollAnimation"; // <-- FIX: Removed ScrollAnimation
// -------------------

/* ---------- Helpers (UNCHANGED) ---------- */
function commaFormat(n) {
  return n?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}

/* ---------- Small UI utilities: Toasts (REDESIGNED) ---------- */
function Toasts({ list, onClose }) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {list.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            className="bg-secondary shadow-lg rounded-lg p-3 max-w-sm border border-white/10"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-text-primary">{t.title}</div>
                {t.message && <div className="text-sm text-text-secondary">{t.message}</div>}
              </div>
              <button onClick={() => onClose(t.id)} className="text-text-secondary/50 hover:text-text-secondary ml-4">✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Stagger Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
// --------------------------------

/* ---------- Page component ---------- */
export default function AllCoursesStudent() {
  useNavigate(); // <-- FIX: 'navigate' is now used by renderCourseActionButton

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  const [courses, setCourses] = useState([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingEnrollAction, setLoadingEnrollAction] = useState({});
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [toasts, setToasts] = useState([]);
  const [courseActionsMap, setCourseActionsMap] = useState({});
  const [courseProgressMap, setCourseProgressMap] = useState({});
  const isMounted = useRef(true); 

  useEffect(() => {
    isMounted.current = true;

    async function loadAll() {
      setLoading(true);
      setError("");
      try {
        const [coursesRes, enrollRes] = await Promise.allSettled([
          api.get("/api/courses"),
          api.get("/api/enrollments/me"),
        ]);

        if (!isMounted.current) return;

        // courses
        if (coursesRes.status === "fulfilled") {
          const arr = Array.isArray(coursesRes.value.data) ? coursesRes.value.data : [];
          setCourses(arr);
          const map = {};
          for (const c of arr) {
            map[String(c.id)] = {
              likes: c.likes ?? 0,
              dislikes: c.dislikes ?? 0,
              userState: c.userState ?? "NONE"
            };
          }
          setCourseActionsMap(map);
          const ids = arr.map(c => c.id).filter(Boolean);
          const progressPromises = ids.map(cid =>
            progressApi.getCourseProgress(cid)
              .then(r => ({ cid: String(cid), data: r }))
              .catch(() => ({ cid: String(cid), data: null }))
          );
          const results = await Promise.all(progressPromises);
          if (!isMounted.current) return;
          const cpMap = {};
          for (const r of results) {
            if (r && r.cid && r.data) cpMap[r.cid] = r.data;
          }
          setCourseProgressMap(cpMap);
        } else {
          console.error("Courses load failed", coursesRes.reason);
          setError("Failed to load courses");
        }

        // enrollments
        if (enrollRes.status === "fulfilled") {
          const enrollList = Array.isArray(enrollRes.value.data) ? enrollRes.value.data : [];
          const map = {};
          for (const e of enrollList) {
            const cid =
              String(e?.courseId ?? e?.course?.id ?? e?.course?._id ?? e?.enrollment?.courseId ?? e?.courseId ?? "") || "";
            if (!cid) continue;
            map[cid] = e;
          }
          setEnrollmentsMap(map);
        } else {
          setEnrollmentsMap({});
        }
      } catch (err) {
        console.error("Load error", err);
        setError("Failed to load courses or enrollments");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }

    loadAll();
    return () => { isMounted.current = false; };
  }, []);

  const categories = useMemo(() => {
    const s = new Set(["All"]);
    for (const c of courses) {
      if (!c) continue;
      if (Array.isArray(c.tags)) {
        for (const t of c.tags) if (t) s.add(t);
      } else if (c.tags) {
        s.add(c.tags);
      }
    }
    return Array.from(s);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return courses.filter(c => {
      if (!c) return false;
      if (activeCategory !== "All") {
        if (Array.isArray(c.tags)) {
          if (!c.tags.includes(activeCategory)) return false;
        } else if (c.tags !== activeCategory) return false;
      }
      if (!q) return true;
      return (c.title || "").toLowerCase().includes(q)
        || (c.description || "").toLowerCase().includes(q)
        || (c.instructor || "").toLowerCase().includes(q);
    });
  }, [courses, searchTerm, activeCategory]);

  function pushToast(title, message) {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, title, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 6000);
  }
  function removeToast(id) { setToasts(t => t.filter(x => x.id !== id)); }

  async function handleEnroll(courseId) {
    setLoadingEnrollAction(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await api.post(`/api/courses/${courseId}/enroll`);
      const data = res.data;
      setEnrollmentsMap(prev => ({ ...prev, [String(courseId)]: data }));
      pushToast("Enrollment requested", "Your enrollment request was sent to admin.");
    } catch (err) {
      console.error("Enroll failed", err);
      const msg = err?.response?.data?.error || "Enrollment failed";
      pushToast("Error", msg);
    } finally {
      setLoadingEnrollAction(prev => ({ ...prev, [courseId]: false }));
    }
  }

  async function toggleCourseLike(courseId) {
    const prevMap = { ...courseActionsMap };
    const cur = prevMap[String(courseId)] || { likes: 0, dislikes: 0, userState: "NONE" };
    const optimistic = (() => {
      if (cur.userState === "LIKED") {
        return { ...cur, likes: Math.max(0, cur.likes - 1), userState: "NONE" };
      } else if (cur.userState === "DISLIKED") {
        return { likes: cur.likes + 1, dislikes: Math.max(0, cur.dislikes - 1), userState: "LIKED" };
      } else {
        return { ...cur, likes: cur.likes + 1, userState: "LIKED" };
      }
    })();
    setCourseActionsMap(prev => ({ ...prev, [String(courseId)]: optimistic }));
    try {
      const resp = await actions.toggleCourseLike(courseId);
      if (resp && typeof resp.likes !== "undefined") {
        setCourseActionsMap(prev => ({ ...prev, [String(courseId)]: {
          likes: resp.likes ?? 0,
          dislikes: resp.dislikes ?? 0,
          userState: resp.userState ?? "NONE"
        }}));
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("toggleCourseLike failed:", err?.response?.data || err.message);
      setCourseActionsMap(prevMap);
      pushToast("Error", err?.response?.data?.error || "Could not like course.");
    }
  }

  async function toggleCourseDislike(courseId) {
    const prevMap = { ...courseActionsMap };
    const cur = prevMap[String(courseId)] || { likes: 0, dislikes: 0, userState: "NONE" };
    const optimistic = (() => {
      if (cur.userState === "DISLIKED") {
        return { ...cur, dislikes: Math.max(0, cur.dislikes - 1), userState: "NONE" };
      } else if (cur.userState === "LIKED") {
        return { likes: Math.max(0, cur.likes - 1), dislikes: cur.dislikes + 1, userState: "DISLIKED" };
      } else {
        return { ...cur, dislikes: cur.dislikes + 1, userState: "DISLIKED" };
      }
    })();
    setCourseActionsMap(prev => ({ ...prev, [String(courseId)]: optimistic }));
    try {
      const resp = await actions.toggleCourseDislike(courseId);
      if (resp && typeof resp.likes !== "undefined") {
        setCourseActionsMap(prev => ({ ...prev, [String(courseId)]: {
          likes: resp.likes ?? 0,
          dislikes: resp.dislikes ?? 0,
          userState: resp.userState ?? "NONE"
        }}));
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("toggleCourseDislike failed:", err?.response?.data || err.message);
      setCourseActionsMap(prevMap);
      pushToast("Error", err?.response?.data?.error || "Could not dislike course.");
    }
  }

  function renderCourseActionButton(course) {
    const cid = String(course.id);
    const e = enrollmentsMap[cid];
    const status = (e?.status || e?.enrollment?.status || "NONE").toString().toUpperCase();
    if (status === "APPROVED" || status === "ENROLLED") {
      return (
        <Link
          to={`/student/courses/${course.id}`}
          className="w-full py-2 px-3 rounded-md bg-green-500/10 text-green-500 text-sm font-medium text-center hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
        >
          Open Course <ArrowRight size={16} />
        </Link>
      );
    }
    if (status === "PENDING") {
      return <button disabled className="w-full py-2 px-3 rounded-md bg-yellow-500/10 text-yellow-500 text-sm font-medium cursor-not-allowed">Enrollment Pending</button>;
    }
    return (
      <button
        onClick={() => handleEnroll(course.id)}
        disabled={loadingEnrollAction[course.id]}
        className="w-full py-2 px-3 rounded-md bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors"
      >
        {loadingEnrollAction[course.id] ? "Sending..." : "Enroll Now"}
      </button>
    );
  }
  // --- END OF LOGIC ---

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-background"
    >
      <Toasts list={toasts} onClose={removeToast} />

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">All Courses</h1>
              <p className="text-sm text-text-secondary mt-1">Explore and request enrollment</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 border border-white/10 bg-background text-text-primary rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="absolute left-3 top-2.5 text-text-secondary"><Search className="w-5 h-5" /></div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeCategory === cat ? "bg-accent text-white" : "bg-secondary text-text-secondary hover:bg-white/10"}`}
              >
                {cat}
              </button>
            ))}
          </div>
      </motion.header>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-text-secondary flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-t-accent rounded-full animate-spin" /> Loading...
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center bg-secondary rounded-lg border border-white/10">
          <div className="mx-auto w-20 h-20 rounded-full bg-background flex items-center justify-center">
            <Play className="w-8 h-8 text-accent" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-text-primary">No courses found</h3>
          <p className="mt-2 text-sm text-text-secondary">Try another category or search term.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCourses.map((course, idx) => {
            const action = courseActionsMap[String(course.id)] || { likes: course.likes ?? 0, dislikes: course.dislikes ?? 0, userState: course.userState ?? "NONE" };
            const cp = courseProgressMap[String(course.id)] || null;
            const percent = cp ? Math.round(cp.percent || 0) : 0;
            return (
              <CourseCard 
                key={course.id}
                course={course}
                action={action}
                cp={cp}
                percent={percent}
                renderCourseActionButton={renderCourseActionButton}
                toggleCourseLike={toggleCourseLike}
                toggleCourseDislike={toggleCourseDislike}
              />
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

// --- NEW: Course Card Component (FIXED) ---
const CourseCard = ({ course, action, cp, percent, renderCourseActionButton, toggleCourseLike, toggleCourseDislike }) => {
  const [imageError, setImageError] = useState(false);
  const handleError = () => setImageError(true);

  return (
    <motion.article
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-secondary rounded-xl shadow-lg overflow-hidden border border-white/10 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-44 w-full">
        {imageError || !course.thumbnail ? (
          <div className="h-full w-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <p className="relative z-10 text-white text-xl font-bold">{course.title}</p>
          </div>
        ) : (
          <motion.img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover"
            onError={handleError}
          />
        )}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-secondary/80 backdrop-blur-sm flex items-center gap-1 text-xs text-text-primary">
          <Tag className="w-4 h-4" /> <span>{Array.isArray(course.tags) ? course.tags[0] : course.tags || "General"}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg line-clamp-2 text-text-primary">{course.title}</h3>
        <p className="text-sm text-text-secondary mt-1 mb-3 line-clamp-2">{course.description}</p>

        {cp && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <div>{cp.videosCompleted}/{cp.totalVideos} completed</div>
              <div>{percent}%</div>
            </div>
            <div className="w-full bg-background h-2 rounded border border-white/10">
              <motion.div 
                className="h-full bg-accent rounded" 
                initial={{ width: 0 }}
                animate={{ width: `${cp.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span className="font-medium text-text-primary">{course.rating ?? "0.0"}</span></div>
              <div className="flex items-center gap-1"><Users className="w-4 h-4 text-text-secondary/70" /><span>{commaFormat(course.enrolledStudents ?? course.enrolled ?? 0)}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => toggleCourseLike(course.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${action.userState === "LIKED" ? "bg-green-500/10 text-green-500" : "bg-background hover:bg-white/10 text-text-secondary"}`}
            >
              <ThumbsUp size={14} /> {action.likes ?? 0}
            </button>
            <button
              onClick={() => toggleCourseDislike(course.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${action.userState === "DISLIKED" ? "bg-red-500/10 text-red-500" : "bg-background hover:bg-white/10 text-text-secondary"}`}
            >
              <ThumbsDown size={14} /> {action.dislikes ?? 0}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              {renderCourseActionButton(course)}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}