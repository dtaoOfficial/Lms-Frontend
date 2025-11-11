import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// --- FIX: Added VideoIcon here ---
import { MessageSquare, ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, VideoIcon } from "lucide-react"; 
import api from "../../api";
import actions from "../../api/actions";
import progressApi from "../../api/progress";
import { motion, AnimatePresence } from "framer-motion"; 
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";

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
function looksLikeId(str) {
  if (!str || typeof str !== "string") return false;
  return /^[0-9a-fA-F]{6,}$/.test(str) || /^[0-9a-fA-F-]{8,}$/.test(str);
}

const COMPLETION_THRESHOLD = 0.95;

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ALL YOUR STATE AND LOGIC (UNCHANGED) ---
  const [course, setCourse] = useState(null);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [playerVideo, setPlayerVideo] = useState(null);
  const [videoActions, setVideoActions] = useState({ likes: 0, dislikes: 0, userState: "NONE" });
  const [videoComments, setVideoComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("OTHER");
  const [reportText, setReportText] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [courseProgress, setCourseProgress] = useState(null);
  const [videoProgressMap, setVideoProgressMap] = useState({});
  const refreshTimeoutRef = useRef(null);
  const refreshPendingRef = useRef(false);

  const getChapterTitle = useCallback((chapterCandidate, idx) => {
    if (!chapterCandidate) return `Chapter ${idx + 1}`;
    if (typeof chapterCandidate === "string") {
      if (looksLikeId(chapterCandidate)) return `Chapter ${idx + 1}`;
      return chapterCandidate;
    }
    const title = chapterCandidate.title || chapterCandidate.name || chapterCandidate.id;
    if (!title) return `Chapter ${idx + 1}`;
    if (looksLikeId(String(title))) return `Chapter ${idx + 1}`;
    return title;
  }, []);

  // --- THESE FUNCTIONS NEED TO BE MEMOIZED OR MOVED ---
  // We'll wrap them in useCallback
  const extractYouTubeIdFromUrl = useCallback((u) => {
    if (!u) return null;
    try {
      const url = new URL(u, window.location.origin);
      if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
      if (url.hostname === "youtu.be") return url.pathname.slice(1);
    } catch (e) { }
    return null;
  }, []);

  const normalizeVideo = useCallback((raw) => {
    if (!raw) return null;
    const id = raw.id ?? raw._id ?? raw.videoId ?? raw.idStr ?? null;
    const title = raw.title ?? raw.name ?? "Untitled";
    const description = raw.description ?? raw.desc ?? "";
    const contentType = raw.contentType ?? raw.mimeType ?? null;
    const candidateUrl = raw.source ?? raw.videoUrl ?? raw.sourceUrl ?? null;
    const youtubeId = raw.youtubeId ?? raw.youtube ?? extractYouTubeIdFromUrl(candidateUrl);
    const source = raw.source ?? raw.videoUrl ?? raw.sourceUrl ?? (id ? `/api/videos/${id}/stream` : null);
    return {
      ...raw, id, title, description, contentType,
      youtubeId: youtubeId || null,
      source: youtubeId ? null : (source || null),
    };
  }, [extractYouTubeIdFromUrl]); // Add dependency

  const normalizeChapterVideos = useCallback((videosRaw = []) => {
    if (!Array.isArray(videosRaw)) return [];
    return videosRaw.map(v => normalizeVideo(v)).filter(Boolean);
  }, [normalizeVideo]); // Add dependency
  // ----------------------------------------------------

  const refreshCourseProgress = useCallback(async (opts = { force: false }) => {
    if (!id) return;
    if (!opts.force) {
      if (refreshPendingRef.current) return;
      refreshPendingRef.current = true;
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshPendingRef.current = false;
      }, 1000);
    }
    try {
      const cp = await progressApi.getCourseProgress(id);
      if (cp) setCourseProgress(cp);
    } catch (e) {
      console.warn("Failed to refresh course progress", e);
    }
    try {
      const list = await progressApi.getMyProgress();
      if (!Array.isArray(list)) { return; }
      const map = {};
      for (const p of list) {
        if (!p || !p.videoId) continue;
        const vid = String(p.videoId);
        map[vid] = {
          lastPosition: typeof p.lastPosition === "number" ? p.lastPosition : (p.lastPosition ? Number(p.lastPosition) : 0),
          duration: typeof p.duration === "number" ? p.duration : (p.duration ? Number(p.duration) : 0),
          completed: !!p.completed,
          updatedAt: p.updatedAt ?? null
        };
      }
      setVideoProgressMap(prev => {
        const out = { ...prev };
        for (const [k, v] of Object.entries(map)) {
          const existing = out[k] || {};
          const existingTs = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          const serverTs = v.updatedAt ? new Date(v.updatedAt).getTime() : 0;
          if (!existing.updatedAt || serverTs >= existingTs) {
            out[k] = { ...existing, ...v };
          } else {
            out[k] = { ...existing, completed: existing.completed || v.completed };
          }
        }
        return out;
      });
    } catch (e) {
      console.warn("Failed to load my video progress", e);
    }
  }, [id]);

  const handleProgressUpdate = useCallback(async (progress) => {
    if (!progress || !progress.videoId) return;
    const vid = String(progress.videoId);
    setVideoProgressMap(prev => {
      const existing = prev[vid] || {};
      const incomingLast = typeof progress.lastPosition === "number" ? progress.lastPosition : (existing.lastPosition || 0);
      const incomingDur = typeof progress.duration === "number" ? progress.duration : (existing.duration || 0);
      const incomingCompleted = typeof progress.completed === "boolean" ? progress.completed : false;
      const incomingUpdatedAt = progress.updatedAt ?? (new Date().toISOString());
      const localCompleted = incomingCompleted || (incomingDur > 0 && (incomingLast / incomingDur) >= COMPLETION_THRESHOLD);
      const merged = {
        ...existing,
        lastPosition: Math.max(Number(existing.lastPosition || 0), Number(incomingLast || 0)),
        duration: incomingDur > 0 ? incomingDur : (existing.duration || 0),
        completed: !!(existing.completed || localCompleted),
        updatedAt: incomingUpdatedAt
      };
      return { ...prev, [vid]: merged };
    });
    const isCompleted = progress.completed ||
      (typeof progress.lastPosition === "number" && typeof progress.duration === "number" && progress.duration > 0 && (progress.lastPosition / progress.duration) >= COMPLETION_THRESHOLD);
    if (isCompleted) {
      try { await refreshCourseProgress(); } catch (e) { /* best-effort */ }
    }
  }, [refreshCourseProgress]);

  const openPlayer = useCallback((videoRaw) => {
    if (!videoRaw) return;
    setErr("");
    const v = normalizeVideo(videoRaw); // <-- BUG 1: This function is used here
    if (!v || !v.id) {
      setErr("Invalid video selected");
      return;
    }
    setPlayerVideo({ ...v, courseId: id });
  }, [id, normalizeVideo]); // <-- FIX: Added normalizeVideo to dependency array

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(`/api/courses/${id}/full`);
        if (!mounted) return;
        const data = res.data || {};
        const courseData = data.course || null;
        setCourse(courseData);
        let normalized = [];
        if (Array.isArray(data.chapters) && data.chapters.length > 0) {
          normalized = data.chapters.map((item, idx) => {
            const rawChapter = item.chapter ?? {};
            let chapterObj;
            if (typeof rawChapter === "string") {
              chapterObj = { id: `ch-${idx}`, title: rawChapter, description: "" };
            } else {
              chapterObj = {
                id: rawChapter.id ?? rawChapter._id ?? rawChapter.slug ?? `ch-${idx}`,
                title: rawChapter.title ?? rawChapter.name ?? rawChapter.id ?? `Chapter ${idx + 1}`,
                description: rawChapter.description ?? ""
              };
            }
            const videos = normalizeChapterVideos(item.videos || []); // <-- BUG 2: This function is used here
            return { chapter: chapterObj, videos };
          });
        } else if (data.videosByChapter && typeof data.videosByChapter === "object") {
          const vbc = data.videosByChapter;
          const keys = Object.keys(vbc || {});
          const arr = keys.map((k, idx) => {
            const videos = normalizeChapterVideos(vbc[k] || []); // <-- BUG 2: This function is used here
            let chapterObj;
            if (k === "") chapterObj = { id: "", title: "General", description: "" };
            else chapterObj = { id: k, title: looksLikeId(k) ? `Chapter ${idx + 1}` : k, description: "" };
            return { chapter: chapterObj, videos };
          });
          normalized = arr;
        }
        setChaptersList(normalized);
        if (mounted && normalized.length > 0 && normalized[0].videos.length > 0) {
          openPlayer(normalized[0].videos[0]);
        }
      } catch (e) {
        console.error("Failed loading course", e);
        if (mounted) setErr("Could not load course");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    refreshCourseProgress();
    return () => { mounted = false; };
  }, [id, openPlayer, refreshCourseProgress, normalizeChapterVideos]); // <-- FIX: Added normalizeChapterVideos to dependency array

  useEffect(() => {
    if (!playerVideo) {
      setVideoActions({ likes: 0, dislikes: 0, userState: "NONE" });
      setVideoComments([]);
      setCommentsTotal(0);
      setCommentsPage(0);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const statResp = await api.get(`/api/videos/${playerVideo.id}/stats`);
        if (mounted) {
          const statData = statResp?.data ?? statResp;
          if (typeof statData?.likes !== "undefined") {
            setVideoActions({ likes: statData.likes ?? 0, dislikes: statData.dislikes ?? 0, userState: statData.userState ?? "NONE" });
          }
        }
      } catch (e) { /* ignore */ }
      try {
        const commentsResp = await actions.getVideoComments(playerVideo.id, 0, 20);
        if (mounted) {
          setVideoComments(commentsResp.comments || []);
          setCommentsTotal(commentsResp.total ?? (commentsResp.comments ? commentsResp.comments.length : 0));
          setCommentsPage(0);
        }
      } catch (e) {
        if (mounted) {
          setVideoComments([]);
          setCommentsTotal(0);
        }
      }
    })();
    (async () => {
      try {
        const p = await progressApi.getVideoProgress(playerVideo.id);
        if (p && p.videoId) {
          setVideoProgressMap(prev => {
            const vid = String(p.videoId);
            const existing = prev[vid] || {};
            const merged = {
              ...existing,
              lastPosition: typeof p.lastPosition === "number" ? p.lastPosition : (existing.lastPosition || 0),
              duration: typeof p.duration === "number" ? p.duration : (existing.duration || 0),
              completed: !!(existing.completed || p.completed || ((p.duration > 0) && (p.lastPosition / p.duration >= COMPLETION_THRESHOLD))),
              updatedAt: p.updatedAt ?? existing.updatedAt ?? new Date().toISOString()
            };
            return { ...prev, [vid]: merged };
          });
        }
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [playerVideo]);

  async function handleVideoLike() {
    if (!playerVideo) return;
    const prev = { ...videoActions };
    const optimistic = (() => {
      if (prev.userState === "LIKED") return { ...prev, likes: Math.max(0, prev.likes - 1), userState: "NONE" };
      if (prev.userState === "DISLIKED") return { likes: prev.likes + 1, dislikes: Math.max(0, prev.dislikes - 1), userState: "LIKED" };
      return { ...prev, likes: prev.likes + 1, userState: "LIKED" };
    })();
    setVideoActions(optimistic);
    try {
      const resp = await actions.toggleVideoLike(playerVideo.id);
      const data = resp?.data ?? resp;
      if (data && typeof data.likes !== "undefined") {
        setVideoActions({ likes: data.likes ?? 0, dislikes: data.dislikes ?? 0, userState: data.userState ?? "NONE" });
      } else throw new Error("Invalid response");
    } catch (e) {
      console.error("like failed", e);
      setVideoActions(prev);
      setErr(e?.response?.data?.error || "Action failed.");
    }
  }

  async function handleVideoDislike() {
    if (!playerVideo) return;
    const prev = { ...videoActions };
    const optimistic = (() => {
      if (prev.userState === "DISLIKED") return { ...prev, dislikes: Math.max(0, prev.dislikes - 1), userState: "NONE" };
      if (prev.userState === "LIKED") return { likes: Math.max(0, prev.likes - 1), dislikes: prev.dislikes + 1, userState: "DISLIKED" };
      return { ...prev, dislikes: prev.dislikes + 1, userState: "DISLIKED" };
    })();
    setVideoActions(optimistic);
    try {
      const resp = await actions.toggleVideoDislike(playerVideo.id);
      const data = resp?.data ?? resp;
      if (data && typeof data.likes !== "undefined") {
        setVideoActions({ likes: data.likes ?? 0, dislikes: data.dislikes ?? 0, userState: data.userState ?? "NONE" });
      } else throw new Error("Invalid response");
    } catch (e) {
      console.error("dislike failed", e);
      setVideoActions(prev);
      setErr(e?.response?.data?.error || "Action failed.");
    }
  }

  async function loadMoreComments(nextPage = 0) {
    if (!playerVideo) return;
    try {
      const resp = await actions.getVideoComments(playerVideo.id, nextPage, 20);
      setVideoComments(prev => [...prev, ...(resp.comments || [])]);
      setCommentsTotal(resp.total ?? (resp.comments ? resp.comments.length : 0));
      setCommentsPage(nextPage);
    } catch (e) {
      console.error("Could not load comments", e);
    }
  }

  async function sendComment() {
    if (!playerVideo) return;
    const txt = (commentText || "").trim();
    if (!txt) return setErr("Comment cannot be empty");
    if (txt.length > 1000) return setErr("Comment too long");
    setCommentSending(true);
    try {
      setCommentText("");
      await actions.postVideoComment(playerVideo.id, txt);
      const commentsResp = await actions.getVideoComments(playerVideo.id, 0, 20);
      setVideoComments(commentsResp.comments || []);
      setCommentsTotal(commentsResp.total ?? (commentsResp.comments ? commentsResp.comments.length : 0));
      setCommentsPage(0);
    } catch (e) {
      console.error("Comment failed", e);
      setErr(e?.response?.data?.error || "Could not post comment");
    } finally {
      setCommentSending(false);
    }
  }

  async function sendReport() {
    if (!playerVideo) return;
    setReportSending(true);
    try {
      await actions.postVideoReport(playerVideo.id, reportReason, reportText);
      setReportOpen(false);
      setReportText("");
      setReportReason("OTHER");
      setErr("");
      alert("Report submitted. Admin will review it.");
    } catch (e) {
      console.error("Report failed", e);
      setErr(e?.response?.data?.error || "Could not send report");
    } finally {
      setReportSending(false);
    }
  }

  function perVideoPercent(vId) {
    const vid = String(vId);
    const p = videoProgressMap[vid];
    if (!p) return 0;
    const dur = Number(p.duration || 0);
    const pos = Number(p.lastPosition || 0);
    if (!dur || dur <= 0) return 0;
    const percent = Math.round((pos / dur) * 100);
    return Math.min(100, percent);
  }
  // --- END OF LOGIC ---


  /* ---------- Render (FIXED) ---------- */
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-background" // <-- DARK MODE FIX
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(-1)} 
          className="text-sm font-medium text-accent hover:underline flex items-center gap-1 mb-4" // <-- DARK MODE FIX
        >
          <ArrowLeft size={16} /> Back to Courses
        </motion.button>

        {loading ? <div className="text-center py-10 text-text-secondary">Loading...</div> : // <-- DARK MODE FIX
          err ? <div className="text-center py-10 text-red-500 bg-red-500/10 p-4 rounded-lg">{err}</div> : // <-- DARK MODE FIX
            !course ? <div className="text-center py-10 text-text-secondary">Course not found</div> : ( // <-- DARK MODE FIX
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary"> {/* <-- DARK MODE FIX */}
                        {course.title}
                      </h1>
                      <p className="mt-2 text-lg text-text-secondary">{course.description}</p> {/* <-- DARK MODE FIX */}
                    </div>

                    <Link
                      to={`/forum/${id}`}
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-md transition-all shadow-sm" // <-- DARK MODE FIX
                    >
                      <MessageSquare size={18} />
                      Discussion Forum
                    </Link>
                  </div>
                </motion.div>

                {courseProgress && (
                  <motion.div variants={itemVariants} className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-text-secondary mb-1"> {/* <-- DARK MODE FIX */}
                      <span>Course Progress</span>
                      <span>{Math.round(courseProgress.percent)}% Complete</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5 border border-white/10"> {/* <-- DARK MODE FIX */}
                      <motion.div 
                        className="h-2 bg-accent rounded-full" // <-- DARK MODE FIX
                        initial={{ width: 0 }}
                        animate={{ width: `${courseProgress.percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col lg:flex-row lg:gap-8">
                  <div className="w-full lg:w-8/12">
                    <aside className="space-y-6">
                      <motion.div variants={itemVariants} className="bg-secondary rounded-xl shadow-lg border border-white/10"> {/* <-- DARK MODE FIX */}
                        <div className="p-4 border-b border-white/10"> {/* <-- DARK MODE FIX */}
                          <h2 className="text-xl font-semibold text-text-primary">Player</h2> {/* <-- DARK MODE FIX */}
                        </div>
                        <div className="p-4">
                          {playerVideo ? (
                            <>
                              <h3 className="text-lg font-bold text-text-primary mb-2">{playerVideo.title}</h3> {/* <-- DARK MODE FIX */}
                              <VideoPlayer
                                key={playerVideo.id}
                                video={playerVideo}
                                onCourseProgressRefresh={() => refreshCourseProgress({ force: true })}
                                onError={(e) => setErr(String(e || "Playback error"))}
                                onProgress={handleProgressUpdate}
                                autoplay
                              />
                              {playerVideo.description && <p className="mt-4 text-sm text-text-secondary">{playerVideo.description}</p>} {/* <-- DARK MODE FIX */}

                              <div className="mt-4 pt-4 border-t border-white/10"> {/* <-- DARK MODE FIX */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <button onClick={handleVideoLike} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${videoActions.userState === "LIKED" ? "bg-accent text-white" : "bg-background hover:bg-white/10 text-text-primary"}`}> {/* <-- DARK MODE FIX */}
                                      <ThumbsUp size={16} /> <span className="hidden sm:inline">{videoActions.likes ?? 0}</span>
                                    </button>
                                    <button onClick={handleVideoDislike} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${videoActions.userState === "DISLIKED" ? "bg-red-500 text-white" : "bg-background hover:bg-white/10 text-text-primary"}`}> {/* <-- DARK MODE FIX */}
                                      <ThumbsDown size={16} /> <span className="hidden sm:inline">{videoActions.dislikes ?? 0}</span>
                                    </button>
                                  </div>
                                  <button onClick={() => setReportOpen(true)} className="text-sm text-text-secondary hover:text-red-500">Report</button> {/* <-- DARK MODE FIX */}
                                </div>
                              </div>
                            </>
                          ) : <div className="text-center text-text-secondary py-20">Select a video to begin.</div>} {/* <-- DARK MODE FIX */}
                        </div>
                      </motion.div>

                      {playerVideo && (
                        <motion.div variants={itemVariants} className="bg-secondary rounded-xl shadow-lg p-4 border border-white/10"> {/* <-- DARK MODE FIX */}
                          <h3 className="text-lg font-semibold mb-3 text-text-primary">Comments ({commentsTotal})</h3> {/* <-- DARK MODE FIX */}
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a public comment..." className="flex-1 px-3 py-2 border border-white/10 bg-background text-text-primary rounded-md text-sm focus:ring-2 focus:ring-accent" /> {/* <-- DARK MODE FIX */}
                              <button onClick={sendComment} disabled={commentSending} className="px-4 py-2 bg-accent text-white rounded-md text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors">{commentSending ? "..." : "Comment"}</button> {/* <-- DARK MODE FIX */}
                            </div>
                            {videoComments.map((c) => (
                              <div key={c.id} className="text-sm">
                                <p className="font-semibold text-text-primary">{c.email || 'Anonymous'}</p> {/* <-- DARK MODE FIX */}
                                <p className="text-text-secondary">{c.text}</p> {/* <-- DARK MODE FIX */}
                              </div>
                            ))}
                            {commentsTotal > videoComments.length && <button onClick={() => loadMoreComments(commentsPage + 1)} className="text-sm font-medium text-accent hover:underline">Load More</button>} {/* <-- DARK MODE FIX */}
                          </div>
                        </motion.div>
                      )}
                    </aside>
                  </div>

                  <div className="w-full lg:w-4/12 mt-8 lg:mt-0">
                    <motion.div variants={itemVariants} className="bg-secondary rounded-xl shadow-lg border border-white/10"> {/* <-- DARK MODE FIX */}
                      <div className="p-4 border-b border-white/10"> {/* <-- DARK MODE FIX */}
                        <h2 className="text-xl font-semibold text-text-primary">Course Content</h2> {/* <-- DARK MODE FIX */}
                      </div>
                      <div className="divide-y divide-white/10"> {/* <-- DARK MODE FIX */}
                        {chaptersList.map((entry, idx) => {
                          const chapter = entry.chapter;
                          const videos = entry.videos || [];
                          return (
                            <div key={chapter.id || idx} className="p-4">
                              <h3 className="font-semibold text-text-primary">{getChapterTitle(chapter, idx)}</h3> {/* <-- DARK MODE FIX */}
                              <ul className="mt-2 space-y-1">
                                {videos.map(v => {
                                  const vidId = v?.id;
                                  const isActive = playerVideo && playerVideo.id === vidId;
                                  const prog = videoProgressMap[String(vidId)];
                                  const isCompleted = !!(prog && prog.completed);
                                  const percent = perVideoPercent(vidId);
                                  return (
                                    <li key={vidId}>
                                      <button onClick={() => openPlayer(v)} className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${isActive ? "bg-accent/10 text-accent font-semibold" : "text-text-secondary hover:bg-white/10 hover:text-text-primary"}`}> {/* <-- DARK MODE FIX */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              {isCompleted && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />}
                                              {!isCompleted && <VideoIcon size={16} className="text-text-secondary/70 flex-shrink-0" />}
                                              <span className="truncate">{v.title}</span>
                                            </div>
                                            {/* small per-video progress */}
                                            {!isCompleted && percent > 0 && (
                                              <div className="w-full mt-1">
                                                <div className="w-full bg-background h-1 rounded border border-white/5"> {/* <-- DARK MODE FIX */}
                                                  <div className="h-full bg-accent rounded" style={{ width: `${percent}%` }} /> {/* <-- DARK MODE FIX */}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="ml-3 text-xs text-text-secondary/70 w-12 text-right">
                                          {percent > 0 && `${percent}%`}
                                        </div>
                                      </button>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
      </div>

      {/* --- ANIMATED REPORT MODAL --- */}
      <AnimatePresence>
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative w-full max-w-md bg-secondary rounded-lg shadow-lg p-6 border border-white/10" // <-- DARK MODE FIX
          >
            <h4 className="text-lg font-semibold text-text-primary">Report Video</h4> {/* <-- DARK MODE FIX */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">Reason</label> {/* <-- DARK MODE FIX */}
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent"> {/* <-- DARK MODE FIX */}
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
                  <option value="SPAM">Spam</option>
                  <option value="INCORRECT">Incorrect / Misleading</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1">Details (optional)</label> {/* <-- DARK MODE FIX */}
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full border border-white/10 bg-background text-text-primary rounded-md p-2 focus:ring-2 focus:ring-accent" rows={3} /> {/* <-- DARK MODE FIX */}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setReportOpen(false)} className="px-4 py-2 rounded-md border border-white/10 bg-secondary text-text-primary hover:bg-white/10 text-sm font-medium transition-colors">Cancel</button> {/* <-- DARK MODE FIX */}
                <button onClick={sendReport} disabled={reportSending} className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">{reportSending ? "Sending..." : "Submit"}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}