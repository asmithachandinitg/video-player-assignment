import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import data from "../data/videos.json";

import { IoMdArrowRoundBack } from "react-icons/io";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdOutlineReplay } from "react-icons/md";

/* ----------------------------- */

function Player() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lastTap, setLastTap] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [ripple, setRipple] = useState(null);

  const countdownRef = useRef(null);
  const videoRef = useRef(null);

  /* Restore video */
  let video = location.state?.video;
  let category = location.state?.category;

  if (!video) {
    const saved = localStorage.getItem("currentVideo");
    if (saved) {
      const parsed = JSON.parse(saved);
      video = parsed.video;
      category = parsed.category;
    }
  }

  if (!video || !video.mp4) {
    return <h2 style={{ color: "#fff" }}>No video selected</h2>;
  }

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* ---------------- DRAG → MINI ---------------- */

  const [dragStartY, setDragStartY] = useState(null);

  const startDrag = (y) => setDragStartY(y);

  const onDrag = (y) => {
    if (dragStartY === null) return;
    if (y - dragStartY > 200) {
      triggerMiniPlayer();
      setDragStartY(null);
    }
  };

  const endDrag = () => setDragStartY(null);

  const triggerMiniPlayer = () => {
    const vid = videoRef.current;
    if (!vid) return;

    localStorage.setItem(
      "miniPlayer",
      JSON.stringify({
        video,
        category,
        currentTime: vid.currentTime,
        isPlaying,
      }),
    );

    navigate("/");
  };

  /* ---------------- RELATED ---------------- */

  const relatedVideos =
    data.categories
      .find((cat) => cat.category.name === category)
      ?.contents.filter((v) => v.title !== video.title) || [];

  /* ---------------- AUTOPLAY + RESUME ---------------- */

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleLoaded = () => {
      const savedTime = localStorage.getItem(video.mp4);

      if (savedTime) {
        const time = Number(savedTime);

        /* Completion guard */
        if (time >= vid.duration - 1) {
          vid.currentTime = 0;
          localStorage.removeItem(video.mp4);
        } else {
          vid.currentTime = time;
        }
      }

      vid.play();
    };

    vid.addEventListener("loadedmetadata", handleLoaded);

    return () => vid.removeEventListener("loadedmetadata", handleLoaded);
  }, [video]);

  /* ---------------- PROGRESS ---------------- */

  const updateProgress = () => {
    const vid = videoRef.current;
    if (!vid.duration) return;

    const current = vid.currentTime;
    const total = vid.duration;

    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);

    localStorage.setItem(video.mp4, current);
  };

  /* ---------------- CONTROLS ---------------- */

  const togglePlay = () => {
    const vid = videoRef.current;
    isPlaying ? vid.pause() : vid.play();
    setIsPlaying(!isPlaying);
  };

  const rippleEffect = (type) => {
    setRipple(type);
    setTimeout(() => setRipple(null), 400);
  };

  const forward = () => {
    videoRef.current.currentTime += 10;
    rippleEffect("forward");
  };

  const backward = () => {
    videoRef.current.currentTime -= 10;
    rippleEffect("backward");
  };

  const handleSeek = (e) => {
    const vid = videoRef.current;
    if (!vid.duration) return;
    vid.currentTime = (e.target.value / 100) * vid.duration;
  };

  /* ---------------- DOUBLE TAP ---------------- */

  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      e.clientX < window.innerWidth / 2 ? backward() : forward();
    }
    setLastTap(now);
  };

  /* ---------------- REPLAY ---------------- */

  const replayVideo = () => {
    const vid = videoRef.current;
    vid.currentTime = 0;
    vid.play();
    setIsEnded(false);
  };

  /* ---------------- AUTOPLAY NEXT ---------------- */

  const startCountdown = () => {
    if (!relatedVideos.length) return;

    let count = 5;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownRef.current);
        playNewVideo(relatedVideos[0]);
      }
    }, 1000);
  };

  const cancelAutoplay = () => {
    clearInterval(countdownRef.current);
    setCountdown(null);
  };

  const playNewVideo = (vid) => {
    localStorage.setItem(
      "currentVideo",
      JSON.stringify({ video: vid, category }),
    );

    navigate("/player", {
      state: { video: vid, category },
    });

    window.location.reload();
  };

  const handleEnded = () => {
    setIsEnded(true);
    startCountdown();
  };

  const goBack = () => navigate("/");

  /* ---------------- UI ---------------- */

  return (
    <motion.div style={styles.container}>
      <button style={styles.backBtn} onClick={goBack}>
        <IoMdArrowRoundBack />
      </button>

      <motion.div
        style={styles.videoWrapper}
        onMouseDown={(e) => startDrag(e.clientY)}
        onMouseMove={(e) => onDrag(e.clientY)}
        onMouseUp={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientY)}
        onTouchMove={(e) => onDrag(e.touches[0].clientY)}
        onTouchEnd={endDrag}
      >
        <video
          ref={videoRef}
          src={video.mp4}
          style={styles.video}
          onTimeUpdate={updateProgress}
          onClick={handleDoubleTap}
          onEnded={handleEnded}
          onPlay={() => setIsEnded(false)}
        />

        {ripple && (
          <motion.div
            style={{
              ...styles.ripple,
              left: ripple === "forward" ? "70%" : "20%",
            }}
            initial={{ scale: 0.5, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>

      {countdown !== null && (
        <div style={styles.countdown}>
          Next video in {countdown}s
          <button onClick={cancelAutoplay}>Cancel</button>
        </div>
      )}

      <div style={styles.info}>
        <h2>{video.title}</h2>
        <p>{category}</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.buttons}>
          {isEnded ? (
            <button onClick={replayVideo}>
              <MdOutlineReplay /> Replay
            </button>
          ) : (
            <>
              <button onClick={backward}>
                <IoIosSkipBackward /> 10s
              </button>

              <button onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <button onClick={forward}>
                10s <IoIosSkipForward />
              </button>
            </>
          )}
        </div>

        <input
          type="range"
          value={progress || 0}
          onChange={handleSeek}
          style={styles.range}
        />

        <p>
          {Math.floor(currentTime / 60)}:
          {String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </p>
      </div>

      {/* RELATED */}
      <div style={styles.relatedSection}>
        <h3 style={styles.relatedHeading}>More from {category}</h3>

        <div style={styles.relatedGrid}>
          {relatedVideos.map((vid, i) => (
            <div
              key={i}
              style={styles.relatedVideoCard}
              onClick={() => playNewVideo(vid)}
            >
              <img
                src={vid.thumbnailUrl}
                alt={vid.title}
                style={styles.thumbnail}
              />
              <p style={styles.title}>{vid.title}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Player;

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    background: "#000",
    minHeight: "70vh",
    color: "#fff",
  },

  videoWrapper: { position: "relative" },

  video: {
    width: "100%",
    maxHeight: "65vh",
    marginTop: "20px",
  },

  ripple: {
    position: "absolute",
    top: "40%",
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
  },

  countdown: {
    position: "absolute",
    bottom: 120,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111",
    padding: "10px 20px",
  },

  info: { padding: 16 },

  controls: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  buttons: { display: "flex", gap: 20 },

  relatedSection: { padding: 20 },

  relatedHeading: { marginBottom: 16 },

  relatedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },

  relatedVideoCard: { cursor: "pointer" },

  thumbnail: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    borderRadius: 10,
  },

  title: { marginTop: 8, fontSize: 14 },

  range: {
    width: "100%",
    maxWidth: 900,
  },

  backBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 9999,
  },
};
