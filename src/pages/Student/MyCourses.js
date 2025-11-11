import React, { useEffect, useState, useRef } from "react";
import api from "../../api";
import progressApi from "../../api/progress";

// --- NEW IMPORTS ---
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // <-- Added Link and useNavigate
import { Award, PlayCircle, BookOpen } from "lucide-react";
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

// --- ALL YOUR HELPER FUNCTIONS (UNCHANGED) ---
function extractVideoListFromCoursePayload(payload) {
  if (!payload) return [];
  if (payload.chapters && Array.isArray(payload.chapters) && payload.chapters.length > 0) {
    return payload.chapters.flatMap((ch) => {
      if (Array.isArray(ch.videos)) return ch.videos;
      if (Array.isArray(ch.videosByChapter)) return ch.videosByChapter;
      return [];
    });
  }
  if (payload.videosByChapter && typeof payload.videosByChapter === "object") {
    return Object.values(payload.videosByChapter).flat();
  }
  const course = payload.course || payload;
  if (Array.isArray(course.videos) && course.videos.length > 0) return course.videos;
  if (Array.isArray(course.chapters) && course.chapters.length > 0) {
    return course.chapters.flatMap((ch) => {
      if (!ch) return [];
      if (Array.isArray(ch.videos)) return ch.videos;
      if (Array.isArray(ch.videosByChapter)) return ch.videosByChapter;
      return [];
    });
  }
  return [];
}

function normalizeVideoEntry(v) {
  if (!v) return null;
  if (typeof v === "string") return { id: v, title: v };
  const id = v.id ?? v._id ?? v.videoId ?? v.video_id ?? null;
  const title = v.title ?? v.name ?? v.label ?? "";
  return id ? { id, title, raw: v } : null;
}
// --- END OF HELPER FUNCTIONS ---


export default function MyCourses() {
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  const [err, setErr] = useState(null);
  const [generating, setGenerating] = useState(false);
  const isMounted = useRef(true); // <-- BUG FIX: ADDED THIS LINE BACK

  // --- ALL YOUR LOGIC (UNCHANGED) ---
  useEffect(() => {
    isMounted.current = true;
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        let listResp;
        try {
          // ✅ Correct API for approved student courses
          listResp = await api.get("/api/student/courses");
        } catch (e1) {
          try {
            // fallback: enrollments endpoint
            listResp = await api.get("/api/enrollments/me");
          } catch {
            // clearer error message for debugging
            throw new Error("Could not fetch your approved courses");
          }
        }
        const listData = (listResp?.data ?? []) || [];

        // ---------- UPDATED NORMALIZATION + FILTER ----------
        const normalizedList = (Array.isArray(listData) ? listData : []).map((it) => {
          if (it?.course) {
            const c = it.course;
            const courseId = c.id ?? c._id ?? c.slug ?? it.courseId ?? it.course_id ?? null;
            return { enrollment: it, course: c, courseId };
          }
          if (it?.id || it?._id || it?.slug || it?.title) {
            const courseId = it.id ?? it._id ?? it.slug ?? null;
            return { enrollment: null, course: it, courseId };
          }
          if (it?.courseId || it?.course_id || it?.courseId === 0) {
            return { enrollment: it, course: it.course ?? null, courseId: it.courseId ?? it.course_id ?? null };
          }
          return { enrollment: null, course: it, courseId: it?.id ?? it?._id ?? null };
        })
        // ✅ NEW FILTER: Only show approved enrollments
        .filter((entry) => {
          if (!entry.enrollment) return true; // fallback if no enrollment object
          const status = entry.enrollment?.status?.toUpperCase?.() || "UNKNOWN";
          return status === "APPROVED" || status === "ACTIVE"; // show only approved/active
        });
        // ----------------------------------------------------

        let progressList = [];
        try {
          const p = await progressApi.getMyProgress();
          progressList = Array.isArray(p) ? p : [];
        } catch {
          progressList = [];
        }
        const progressByVideo = {};
        progressList.forEach((pv) => {
          if (pv?.videoId) progressByVideo[pv.videoId] = pv;
        });

        const enriched = await Promise.all(
          normalizedList.map(async (entry) => {
            const courseId = entry.courseId;
            let videos = extractVideoListFromCoursePayload(entry.course || {});
            if ((!videos || videos.length === 0) && courseId) {
              try {
                const fullResp = await api.get(`/api/courses/${courseId}/full`);
                videos = extractVideoListFromCoursePayload(fullResp.data);
                if (!entry.course && fullResp.data?.course) entry.course = fullResp.data.course;
              } catch {
                videos = [];
              }
            }
            const videoObjs = (videos || []).map(normalizeVideoEntry).filter(Boolean);
            const totalVideos = videoObjs.length;
            let completedCount = 0;
            let lastWatchedVideoId = null;
            let lastWatchedAt = null;
            videoObjs.forEach((vv) => {
              const pr = progressByVideo[vv.id];
              if (pr?.completed) completedCount += 1;
              if (pr?.updatedAt) {
                const t = new Date(pr.updatedAt).getTime();
                if (!isNaN(t) && (!lastWatchedAt || t > lastWatchedAt)) {
                  lastWatchedAt = t;
                  lastWatchedVideoId = vv.id;
                }
              } else if (pr && typeof pr.lastPosition === "number" && pr.lastPosition > 0) {
                if (!lastWatchedAt) {
                  lastWatchedAt = Date.now();
                  lastWatchedVideoId = vv.id;
                }
              }
            });
            const percent = totalVideos === 0 ? 0 : Math.round((completedCount * 10000) / totalVideos) / 100;
            return {
              enrollment: entry.enrollment || null,
              course: entry.course || {},
              courseId,
              courseTitle: entry.course?.title || entry.course?.name || "Untitled Course",
              courseSummary: entry.course?.description || entry.course?.summary || "",
              courseThumbnail: entry.course?.thumbnail || entry.course?.image || null,
              totalVideos,
              videosCompleted: completedCount,
              percent,
              lastWatchedVideoId,
              lastWatchedAt: lastWatchedAt ? new Date(lastWatchedAt).toISOString() : null,
            };
          })
        );
        if (isMounted.current) setSummaries(enriched); // <-- BUG FIX (isMounted.current)
      } catch (e) {
        console.error("MyCourses load error:", e);
        if (isMounted.current) setErr("Could not load your courses"); // <-- BUG FIX (isMounted.current)
      } finally {
        if (isMounted.current) setLoading(false); // <-- BUG FIX (isMounted.current)
      }
    };
    load();
    return () => {
      isMounted.current = false; // <-- BUG FIX (isMounted.current)
    };
  }, []);

  const handleDownloadCertificate = async (courseId, courseTitle) => {
    try {
      setGenerating(true);
      const res = await api.post("/api/certificates/generate", { courseId, courseTitle });
      const url = res?.data?.downloadUrl || `/api/certificates/${res?.data?.id}/download`;
      window.open(url, "_blank", "noopener");
    } catch (e) {
      console.error("Certificate download failed:", e);
      alert("Could not generate certificate. Try again later.");
    } finally {
      setGenerating(false);
    }
  };
  // --- END OF LOGIC ---

  if (loading) return <div className="p-6 py-12 text-center text-text-secondary">Loading your courses...</div>; // <-- DARK MODE FIX
  if (err) return <div className="p-6 py-12 text-center text-red-500">{err}</div>;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 bg-background min-h-screen" // <-- DARK MODE FIX
    >
      <motion.h1 variants={itemVariants} className="text-2xl font-bold mb-6 text-text-primary">My Courses</motion.h1> {/* <-- DARK MODE FIX */}
      
      {summaries.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState />
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {summaries.map((item, idx) => {
              const key = item.courseId || idx;
              return (
                <motion.div
                  key={String(key)}
                  layout
                  variants={itemVariants}
                  transition={{ delay: idx * 0.05 }}
                >
                  <EnrolledCourseCard 
                    item={item} 
                    generating={generating} 
                    onDownload={() => handleDownloadCertificate(item.courseId, item.courseTitle)} 
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// --- NEW: Redesigned EnrolledCourseCard ---
function EnrolledCourseCard({ item, generating, onDownload }) {
  const isCompleted = Math.round(item.percent) === 100;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-secondary rounded-xl shadow-lg p-4 flex flex-col md:flex-row justify-between gap-4 border border-white/10"
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1 text-text-primary">{item.courseTitle}</h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">{item.courseSummary}</p>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-background rounded-full h-2.5 mb-2 border border-white/10">
          <motion.div
            className="h-2.5 bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, item.percent)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary">
          <span>
            {item.videosCompleted}/{item.totalVideos} videos
          </span>
          <span>{Math.round(item.percent)}%</span>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
        <Link
          to={`/student/courses/${item.courseId}`}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 text-sm font-medium w-full text-center transition-colors flex items-center justify-center gap-2"
        >
          <PlayCircle size={16} />
          {isCompleted ? "Review Course" : "Continue"}
        </Link>

        {isCompleted && (
          <button
            disabled={generating}
            onClick={onDownload}
            className={`px-4 py-2 rounded-md text-sm font-medium w-full transition-colors flex items-center justify-center gap-2 ${
              generating
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Award size={16} />
            {generating ? "Generating..." : "Get Certificate"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// --- NEW: Empty State Card ---
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20 bg-secondary rounded-lg border border-white/10 shadow-lg">
      <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-background">
        <BookOpen className="w-8 h-8 text-text-secondary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text-primary">No Courses Found</h3>
      <p className="mt-2 text-sm text-text-secondary">You aren't enrolled in any courses yet.</p>
      <div className="mt-4">
        <button 
          onClick={() => navigate('/student/courses')} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
        >
          Find Courses to Enroll
        </button>
      </div>
    </div>
  );
}
