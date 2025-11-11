import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import api from "../../api";
import progressApi from "../../api/progress";

// --- NEW IMPORTS ---
import { motion, AnimatePresence, useSpring } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";
// -------------------

/* ============================================================
  Utility helpers (UNCHANGED)
============================================================ */
const getYouTubeEmbedId = (urlOrId) => {
  if (!urlOrId) return null;
  if (/^[A-Za-z0-9_-]{6,}$/.test(String(urlOrId))) return String(urlOrId);
  try {
    const u = new URL(urlOrId, window.location.origin);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch {}
  return null;
};

const loadYouTubeApi = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve) => {
      if (typeof window === "undefined" || (window.YT && window.YT.Player))
        return resolve(window.YT || null);
      const existing = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      setTimeout(() => resolve(window.YT || null), 5000);
    });
    return promise;
  };
})();

// --- NEW: Time formatter ---
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) {
    return "00:00";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/* ============================================================
  Component
============================================================ */
export default function VideoPlayer({
  video,
  onCourseProgressRefresh,
  onError,
  onProgress,
  autoplay = false,
}) {
  const containerRef = useRef(null);
  const html5Ref = useRef(null);
  const canvasRef = useRef(null);
  const YTplayerRef = useRef(null);
  const YTpollRef = useRef(null);
  const ytPollIntervalRef = useRef(null);
  const progressTimerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const lastEmitRef = useRef(0);
  const controlsTimeoutRef = useRef(null);

  const [playerMode, setPlayerMode] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem("lms_session_id");
    } catch {
      return null;
    }
  });
  const [userEmail, setUserEmail] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [glowColor, setGlowColor] = useState("rgba(79,70,229,0.35)");

  // --- NEW STATE FOR CUSTOM CONTROLS ---
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [currentTime, setCurrentTime] = useState("00:00");
  const [totalDuration, setTotalDuration] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const progressSpring = useSpring(0, { stiffness: 400, damping: 50 });
  // ------------------------------------

  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  const onCourseRefreshRef = useRef(onCourseProgressRefresh);
  useEffect(() => {
    onCourseRefreshRef.current = onCourseProgressRefresh;
  }, [onCourseProgressRefresh]);

  /* ---------------- Determine player mode (UNCHANGED) ---------------- */
  useEffect(() => {
    const src =
      video?.source ||
      video?.embedSource ||
      video?.sourceUrl ||
      video?.videoUrl ||
      "";
    const ytId = video?.youtubeId || getYouTubeEmbedId(src);
    setPlayerMode(ytId ? "youtube" : "stream");
    return () => {
      try {
        if (YTplayerRef.current?.destroy) {
          YTplayerRef.current.destroy();
        }
      } catch {}
    };
  }, [video]);

  /* ---------------- Session start & end beacon (UNCHANGED) ---------------- */
  useEffect(() => {
    let mounted = true;
    const startSession = async () => {
      if (sessionId) return;
      try {
        const res = await api.post("/api/sessions", {
          meta: { courseId: video?.courseId, videoId: video?.id },
        });
        const sid = res?.data?.sessionId || res?.data?.id || null;
        if (mounted && sid) {
          setSessionId(sid);
          try {
            localStorage.setItem("lms_session_id", sid);
          } catch {}
        }
      } catch {}
    };
    const endSessionBeacon = () => {
      const sid = localStorage.getItem("lms_session_id");
      if (!sid) return;
      try {
        const url = `${api.defaults.baseURL}/api/sessions/${sid}/end`;
        const data = new Blob([JSON.stringify({ final: true })], {
          type: "application/json",
        });
        if (navigator && navigator.sendBeacon) navigator.sendBeacon(url, data);
      } catch {}
      try {
        localStorage.removeItem("lms_session_id");
      } catch {}
    };
    startSession();
    window.addEventListener("beforeunload", endSessionBeacon);
    const onVis = () => {
      if (document.visibilityState === "hidden") endSessionBeacon();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mounted = false;
      window.removeEventListener("beforeunload", endSessionBeacon);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [video?.id, video?.courseId, sessionId]);

  /* ---------------- Watermark user email (UNCHANGED) ---------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get("/api/users/me");
        if (mounted) setUserEmail(r.data?.email || null);
      } catch {
        try {
          const r2 = await api.get("/api/me");
          if (mounted) setUserEmail(r2.data?.email || null);
        } catch {
          if (mounted) setUserEmail(null);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- Load secure stream (UNCHANGED) ---------------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (playerMode !== "stream") return;
      setIsLoadingStream(true);
      setVideoSrc(null);
      try {
        let sourcePath = video?.source || (video?.id ? `/api/videos/${video.id}/stream` : null);
        if (sourcePath && /^https?:\/\//i.test(sourcePath) && video?.id) {
          sourcePath = `/api/videos/${video.id}/stream`;
        }
        let finalUrl = sourcePath;
        if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
          const base = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/+$/, "") : "";
          finalUrl = `${base}${finalUrl.startsWith("/") ? finalUrl : "/" + finalUrl}`;
        }
        if (cancelled) return;
        if (!finalUrl) throw new Error("No stream URL available");
        console.debug("[VideoPlayer] setting video src ->", finalUrl);
        setVideoSrc(finalUrl);
      } catch (err) {
        console.warn("[VideoPlayer] could not set stream src", err);
        if (onErrorRef.current) onErrorRef.current("Could not load video stream");
      } finally {
        if (!cancelled) setIsLoadingStream(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [video?.id, video?.contentType, playerMode, video?.source]);

  /* ============================================================
    Core progress saving logic (UNCHANGED)
  ============================================================ */
  const COMPLETION_THRESHOLD = 0.95; // 95%
  const saveProgressToServer = useCallback(async (videoId, payload) => {
    try {
      const saved = await progressApi.saveVideoProgress(videoId, payload);
      return saved || null;
    } catch (e) {
      if (process.env.NODE_ENV !== "production")
        console.warn("saveProgressToServer error", e);
      return null;
    }
  }, []);


  /* ---------------- Main useEffect managing playback (FIXED) ---------------- */
  useEffect(() => {
    let mounted = true;
    const EMIT_MS = 2000;
    const SERVER_SAVE_MS = 10000;

    const saveAndEmit = async ({ lastPosition = 0, duration = 0, completed = false }) => {
      const pos = Number(lastPosition || 0);
      const dur = Number(duration || 0);
      const localCompleted =
        completed === true || (dur > 0 && pos / dur >= COMPLETION_THRESHOLD);
      const payload = { lastPosition: pos, duration: dur, completed: localCompleted };
      let saved = null;
      try {
        saved = await saveProgressToServer(video.id, payload);
      } catch {}

      if (!saved && localCompleted) {
        (async () => {
          try {
            await progressApi.saveVideoProgress(video.id, {
              lastPosition: pos,
              duration: dur,
              completed: true,
            });
          } catch (e) {
            if (process.env.NODE_ENV !== "production")
              console.warn("Background persist completion failed", e);
          }
        })();
      }

      const emitObj = saved
        ? {
            videoId: String(saved.videoId ?? video.id),
            lastPosition: Number(saved.lastPosition ?? pos),
            duration: Number(saved.duration ?? dur),
            completed: !!saved.completed || localCompleted,
            updatedAt: saved.updatedAt ?? new Date().toISOString(),
          }
        : {
            videoId: String(video.id),
            lastPosition: pos,
            duration: dur,
            completed: !!localCompleted,
            updatedAt: new Date().toISOString(),
          };

      try {
        if (onProgress) onProgress(emitObj);
      } catch (e) {
        if (process.env.NODE_ENV !== "production")
          console.warn("onProgress handler error", e);
      }

      if (emitObj.completed && onCourseRefreshRef.current) {
        try {
          onCourseRefreshRef.current();
        } catch {}
      }
      return emitObj;
    };

    const touchSession = () => {
      if (sessionId) api.post(`/api/sessions/${sessionId}/touch`).catch(() => {});
    };

    /* ---------------- HTML5 stream player handlers ---------------- */
    if (playerMode === "stream") {
      const vid = html5Ref.current;
      if (!vid) return;

      const start = () => {
        clearInterval(progressTimerRef.current);
        clearInterval(heartbeatRef.current);
        progressTimerRef.current = setInterval(() => {
          const pos = Math.max(0, vid.currentTime || 0);
          const dur = Number(vid.duration) || 0;
          saveAndEmit({ lastPosition: pos, duration: dur, completed: false });
        }, SERVER_SAVE_MS);
        heartbeatRef.current = setInterval(touchSession, 30000);
      };
      const stop = () => {
        clearInterval(progressTimerRef.current);
        clearInterval(heartbeatRef.current);
      };

      // Assign handlers to ref for use in JSX
      heartbeatRef.current = { start, stop, saveAndEmit };
      
      let loadedMetaHandler = null;
      progressApi.getVideoProgress(video.id).then((p) => {
        if (!p) return;
        const setTime = () => {
          try {
            if (p?.lastPosition && !isNaN(Number(p.lastPosition))) {
              const target = Math.min(Number(p.lastPosition), (vid.duration || Number(p.lastPosition)));
              if (!isNaN(target) && target > 0) {
                try { vid.currentTime = target; } catch {}
              }
            }
            if (onProgress) {
              onProgress({
                videoId: video.id,
                lastPosition: Number(p.lastPosition || 0),
                duration: Number(p.duration || 0),
                completed: !!p.completed || (p.duration > 0 && p.lastPosition / p.duration >= COMPLETION_THRESHOLD),
                updatedAt: p.updatedAt ?? null,
              });
            }
          } catch {}
        };

        if (vid.readyState >= 1 || !isFinite(Number(vid.duration)) || vid.duration > 0) {
          setTime();
        } else {
          loadedMetaHandler = () => {
            setTime();
            vid.removeEventListener("loadedmetadata", loadedMetaHandler);
          };
          vid.addEventListener("loadedmetadata", loadedMetaHandler);
        }
      }).catch(() => {});

      if (vid && !vid.paused && !vid.ended) start();
      
      const ensureLoadAndAutoplay = () => {
        try {
          if (vid.src !== videoSrc) {
            vid.pause();
            vid.src = videoSrc || "";
            try { vid.load(); } catch {}
          }
          if (autoplay) {
            const p = vid.play();
            if (p && typeof p.then === "function") {
              p.then(() => setIsPlaying(true))
               .catch((err) => {
                console.warn("[VideoPlayer] autoplay/play() rejected:", err);
                setIsPlaying(false);
              });
            }
          }
        } catch (err) {
          console.warn("[VideoPlayer] ensureLoadAndAutoplay failed", err);
        }
      };
      
      ensureLoadAndAutoplay();

      return () => {
        stop();
        if (loadedMetaHandler) {
          try { vid.removeEventListener("loadedmetadata", loadedMetaHandler); } catch {}
        }
      };
    }

    /* ---------------- YouTube player (UNCHANGED) ---------------- */
    if (playerMode === "youtube") {
      const attach = async () => {
        const YT = await loadYouTubeApi();
        if (!YT || !mounted) return;
        const vidId = video.youtubeId || getYouTubeEmbedId(video.source || video.videoUrl || video.sourceUrl || "");
        if (!vidId) {
          if (onErrorRef.current) onErrorRef.current("Invalid YouTube URL or id");
          return;
        }
        if (YTplayerRef.current?.destroy) {
          try {
            YTplayerRef.current.destroy();
          } catch {}
        }
        const placeholderId = `yt-player-${video.id}`;
        let placeholder = document.getElementById(placeholderId);
        if (!placeholder && containerRef.current) {
          containerRef.current.innerHTML = "";
          placeholder = document.createElement("div");
          placeholder.id = placeholderId;
          containerRef.current.appendChild(placeholder);
        }
        try {
          YTplayerRef.current = new YT.Player(placeholderId, {
            videoId: vidId,
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              origin: window.location.origin,
              rel: 0,
              modestbranding: 1,
              controls: 1, 
              iv_load_policy: 3,
              fs: 0, 
            },
            events: {
              onReady: (ev) => {
                progressApi.getVideoProgress(video.id).then((p) => {
                  try {
                    if (p?.lastPosition && typeof ev.target.seekTo === "function") {
                      const dur = ev.target.getDuration ? ev.target.getDuration() : 0;
                      const target = Math.min(Number(p.lastPosition), dur || Number(p.lastPosition));
                      ev.target.seekTo(target, true);
                    }
                  } catch {}
                }).catch(() => {});
              },
              onStateChange: (ev) => {
                const YTState = window.YT?.PlayerState || {};
                const saveYT = async (completed = false) => {
                  const p = YTplayerRef.current;
                  if (!p?.getCurrentTime) return;
                  const pos = p.getCurrentTime();
                  const dur = p.getDuration ? p.getDuration() : 0;
                  await saveAndEmit({ lastPosition: pos, duration: dur, completed });
                };
                if (ev.data === YTState.PLAYING) {
                  clearInterval(YTpollRef.current);
                  clearInterval(ytPollIntervalRef.current);
                  clearInterval(heartbeatRef.current);
                  YTpollRef.current = setInterval(() => {
                    const p = YTplayerRef.current;
                    if (!p?.getCurrentTime) return;
                    const pos = p.getCurrentTime();
                    const dur = p.getDuration ? p.getDuration() : 0;
                    const now = Date.now();
                    if (!lastEmitRef.current || now - lastEmitRef.current >= EMIT_MS) {
                      lastEmitRef.current = now;
                      if (onProgress)
                        onProgress({
                          videoId: video.id,
                          lastPosition: pos,
                          duration: dur,
                          completed: false,
                        });
                    }
                  }, EMIT_MS);
                  ytPollIntervalRef.current = setInterval(() => {
                    const p = YTplayerRef.current;
                    if (!p?.getCurrentTime) return;
                    const pos = p.getCurrentTime();
                    const dur = p.getDuration ? p.getDuration() : 0;
                    saveAndEmit({ lastPosition: pos, duration: dur, completed: false });
                  }, SERVER_SAVE_MS);
                  heartbeatRef.current = setInterval(touchSession, 30000);
                } else if (ev.data === YTState.PAUSED) {
                  clearInterval(YTpollRef.current);
                  clearInterval(ytPollIntervalRef.current);
                  clearInterval(heartbeatRef.current);
                  saveYT(false);
                } else if (ev.data === YTState.ENDED) {
                  clearInterval(YTpollRef.current);
                  clearInterval(ytPollIntervalRef.current);
                  clearInterval(heartbeatRef.current);
                  saveYT(true).then(() => {
                    onCourseRefreshRef.current?.();
                  });
                }
              },
            },
          });
        } catch (err) {
          console.warn("[VideoPlayer] YT init failed", err);
          if (onErrorRef.current) onErrorRef.current("YouTube player init failed");
        }
      };
      attach();
      return () => {
        mounted = false;
        try { clearInterval(YTpollRef.current); } catch {}
        try { clearInterval(ytPollIntervalRef.current); } catch {}
        try { clearInterval(heartbeatRef.current); } catch {}
        if (YTplayerRef.current?.destroy) {
          try { YTplayerRef.current.destroy(); } catch {}
          YTplayerRef.current = null;
        }
      };
    }

    return () => {
      try { clearInterval(progressTimerRef.current); } catch {}
      try { clearInterval(heartbeatRef.current); } catch {}
      try { clearInterval(YTpollRef.current); } catch {}
      try { clearInterval(ytPollIntervalRef.current); } catch {}
      if (YTplayerRef.current?.destroy) {
        try { YTplayerRef.current.destroy(); } catch {}
        YTplayerRef.current = null;
      }
      mounted = false;
    };
  }, [playerMode, video, sessionId, autoplay, saveProgressToServer, onProgress, videoSrc]); // <-- BUG FIX: Removed handleProgressUpdate

  /* ---------------- Glow sampling (UNCHANGED) & fullscreen toggle ---------------- */
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d", { willReadFrequently: true }) : null;
    let raf = null;
    const vid = html5Ref.current;
    if (vid && ctx) {
      const sample = () => {
        if (!vid || vid.paused || vid.ended) {
          raf = requestAnimationFrame(sample);
          return;
        }
        try {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < frame.length; i += 80) {
            r += frame[i]; g += frame[i + 1]; b += frame[i + 2];
            count++;
          }
          if (count) {
            r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
            setGlowColor(`rgba(${r},${g},${b},0.35)`);
          }
        } catch {}
        raf = requestAnimationFrame(sample);
      };
      const onPlay = () => (raf = requestAnimationFrame(sample));
      const onStop = () => cancelAnimationFrame(raf);
      vid.addEventListener("play", onPlay);
      vid.addEventListener("pause", onStop);
      vid.addEventListener("ended", onStop);
      if (!vid.paused) onPlay();
      return () => {
        document.removeEventListener("fullscreenchange", onFs);
        cancelAnimationFrame(raf);
        vid.removeEventListener("play", onPlay);
        vid.removeEventListener("pause", onStop);
        vid.removeEventListener("ended", onStop);
      };
    }
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [playerMode, videoSrc]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  }, []);

  const handleContextMenu = useCallback((ev) => {
    ev.preventDefault();
    alert("Action blocked — protected by DTAO Official");
  }, []);

  // --- NEW: Custom Controls Handlers ---
  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (html5Ref.current && !html5Ref.current.paused) { // Don't hide if paused
        setShowControls(false);
      }
    }, 2500);
  };

  const showControlsBriefly = () => {
    setShowControls(true);
    hideControls();
  };

  const togglePlay = () => {
    const vid = html5Ref.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(e => console.warn("Play failed", e));
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
    showControlsBriefly();
  };

  const handleTimeUpdate = () => {
    const vid = html5Ref.current;
    if (!vid) return;
    const pos = vid.currentTime;
    const dur = vid.duration;
    const prog = dur > 0 ? pos / dur : 0;
    
    setProgress(prog);
    progressSpring.set(prog); // Update spring
    setCurrentTime(formatTime(pos));

    const now = Date.now();
    if (!lastEmitRef.current || now - lastEmitRef.current >= 2000) {
      lastEmitRef.current = now;
      if (onProgress) {
        onProgress({
          videoId: video.id, lastPosition: pos, duration: dur, completed: false, updatedAt: null,
        });
      }
    }
  };

  const handleLoadedData = () => {
    const vid = html5Ref.current;
    if (!vid) return;
    setTotalDuration(formatTime(vid.duration));
  };

  const handleSeek = (e) => {
    const vid = html5Ref.current;
    if (!vid) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = vid.duration * percentage;
    vid.currentTime = newTime;
    setProgress(percentage);
    progressSpring.set(percentage);
  };

  const toggleMute = () => {
    const vid = html5Ref.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
    if (!vid.muted && vid.volume === 0) {
      vid.volume = 0.5;
      setVolume(0.5);
    }
  };

  const handleVolumeChange = (e) => {
    const vid = html5Ref.current;
    const newVol = parseFloat(e.target.value);
    if (!vid) return;
    vid.volume = newVol;
    vid.muted = newVol === 0;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
    showControlsBriefly();
    heartbeatRef.current?.start?.();
  };
  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true); // Keep controls visible when paused
    heartbeatRef.current?.stop?.();
    const vid = html5Ref.current;
    if (vid) {
      heartbeatRef.current?.saveAndEmit?.({ lastPosition: vid.currentTime, duration: vid.duration, completed: false });
    }
  };
  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    heartbeatRef.current?.stop?.();
    const vid = html5Ref.current;
    if (vid) {
      heartbeatRef.current?.saveAndEmit?.({ lastPosition: vid.duration, duration: vid.duration, completed: true });
    }
  };

  /* ============================================================
    Render (REDESIGNED)
  ============================================================ */
  return (
    <motion.div
      ref={containerRef}
      className={`relative bg-black overflow-hidden rounded-lg ${
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-black"
          : "aspect-video"
      }`}
      animate={{ boxShadow: `0 0 45px 12px ${glowColor}` }} // <-- ANIMATED GLOW
      transition={{ duration: 1.5, ease: "easeInOut" }}
      onDoubleClick={toggleFullscreen}
      onContextMenu={handleContextMenu}
      onMouseMove={showControlsBriefly}
      onMouseLeave={() => hideControls()}
      onClick={togglePlay} // <-- Toggle play on main container click
    >
      {playerMode === "youtube" && (
        <div id={`yt-player-${video.id}`} className="w-full h-full" />
      )}

      {playerMode === "stream" && (
        <>
          {isLoadingStream && !videoSrc && (
            <div className="w-full h-full flex items-center justify-center text-white">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          )}
          
          <video
            ref={html5Ref}
            key={videoSrc}
            src={videoSrc || ""} 
            className="w-full h-full object-contain"
            playsInline
            autoPlay={autoplay}
            crossOrigin="anonymous"
            controlsList="nodownload noremoteplayback nofullscreen" // <-- REMOVED FULLSCREEN
            // --- REMOVED 'controls' ATTRIBUTE ---
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={(e) => {
              setIsMuted(e.target.muted);
              setVolume(e.target.volume);
            }}
            onError={() => {
              if (onErrorRef.current) onErrorRef.current("Playback failed");
            }}
          />
        </>
      )}

      {/* watermark (UNCHANGED) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`absolute text-white/10 font-semibold whitespace-nowrap ${
              isFullscreen ? "text-3xl" : "text-lg"
            }`}
            style={{
              transform: `rotate(-20deg) translateY(${(i - 2) * 120}px)`,
            }}
          >
            {userEmail || "Protected Content"}
          </div>
        ))}
      </div>

      {/* --- NEW: Custom Animated Controls for 'stream' mode --- */}
      {playerMode === "stream" && (
        <>
          {/* 1. Center Play Button */}
          <AnimatePresence>
            {!isPlaying && showControls && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} // Stop propagation
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-4 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                aria-label="Play"
              >
                <Play size={40} className="ml-1" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* 2. Control Bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/70 to-transparent"
                onClick={(e) => e.stopPropagation()} // Stop clicks from bubbling to video
              >
                {/* Animated Progress Bar */}
                <div 
                  className="relative w-full h-2.5 cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div className="absolute w-full h-1 bg-white/30 top-1/2 -translate-y-1/2 rounded-full" />
                  <motion.div 
                    className="absolute h-1 bg-accent top-1/2 -translate-y-1/2 rounded-full"
                    style={{ 
                      scaleX: progressSpring, 
                      transformOrigin: 'left',
                      boxShadow: `0 0 10px 2px rgb(var(--color-accent))` // <-- Animated Shadow
                    }}
                  />
                  <motion.div 
                    className="absolute -ml-1 w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                    style={{ left: `${progress * 100}%` }}
                  />
                </div>
                
                {/* Bottom Row of Controls */}
                <div className="flex items-center justify-between text-white mt-2">
                  <div className="flex items-center gap-2">
                    <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex items-center group">
                      <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover:w-20 transition-all duration-200"
                      />
                    </div>
                    <div className="text-xs font-medium ml-2">
                      {currentTime} / {totalDuration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Use your original custom fullscreen button */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-full"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {/* Hidden canvas for glow sampling (UNCHANGED) */}
      <canvas ref={canvasRef} width="160" height="90" className="hidden" />
    </motion.div>
  );
}

VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired,
  onCourseProgressRefresh: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  autoplay: PropTypes.bool,
};