import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import data from "../data/videos.json";

import { IoMdArrowRoundBack } from "react-icons/io";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";

/* ----------------------------- */

function Player() {
  const navigate = useNavigate();
  const location = useLocation();

  /* Restore video on refresh */
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

  /* Safety guard */
  if (!video || !video.mp4) {
    return <h2 style={{ color: "#fff" }}>No video selected</h2>;
  }

  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [countdown, setCountdown] = useState(null);

  /* ---------------- DRAG STATE (ADDED) ---------------- */

  const [dragStartY, setDragStartY] = useState(null);

  const startDrag = (y) => {
    setDragStartY(y);
  };

  const onDrag = (y) => {
    if (dragStartY === null) return;

    const diff = y - dragStartY;

    if (diff > 200) {
      triggerMiniPlayer();
      setDragStartY(null);
    }
  };

  const endDrag = () => {
    setDragStartY(null);
  };

  /* ---------------- MINI PLAYER TRIGGER (ADDED) ---------------- */

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

  /* ---------------- RELATED VIDEOS ---------------- */

  const relatedVideos =
    data.categories
      .find((cat) => cat.category.name === category)
      ?.contents.filter((v) => v.title !== video.title) || [];

  /* ---------------- AUTOPLAY + RESUME ---------------- */

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const savedTime = localStorage.getItem(video.mp4);

    if (savedTime) {
      vid.currentTime = savedTime;
    }

    vid.play();
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

    if (isPlaying) vid.pause();
    else vid.play();

    setIsPlaying(!isPlaying);
  };

  const forward = () => {
    videoRef.current.currentTime += 10;
  };

  const backward = () => {
    videoRef.current.currentTime -= 10;
  };

  const handleSeek = (e) => {
    const vid = videoRef.current;
    if (!vid.duration) return;

    vid.currentTime = (e.target.value / 100) * vid.duration;
  };

  /* ---------------- TIME FORMAT ---------------- */

  const formatTime = (time) => {
    if (!time) return "0:00";

    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  /* ---------------- SWITCH VIDEO ---------------- */

  const playNewVideo = (vid) => {
    localStorage.setItem(
      "currentVideo",
      JSON.stringify({
        video: vid,
        category,
      }),
    );

    navigate("/player", {
      state: {
        video: vid,
        category,
      },
    });

    window.location.reload();
  };

  /* ---------------- AUTOPLAY NEXT ---------------- */

  const handleEnded = () => {
    if (!relatedVideos.length) return;

    let count = 5;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(interval);
        playNewVideo(relatedVideos[0]);
      }
    }, 1000);
  };

  /* ---------------- BACK ---------------- */

  const goBack = () => {
    navigate("/");
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>
      {/* Back */}
      <button style={styles.backBtn} onClick={goBack}>
        <IoMdArrowRoundBack />
        Back
      </button>

      {/* Video */}
      <div
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
          onEnded={handleEnded}
        />
      </div>

      {/* Countdown */}
      {countdown && (
        <div style={styles.countdown}>
          Next video in {countdown}s
          <button onClick={() => setCountdown(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* Info */}
      <div style={styles.info}>
        <h2>{video.title}</h2>
        <p>{category}</p>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.buttons}>
          <button onClick={backward}>
            <IoIosSkipBackward /> 10s
          </button>

          <button onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button onClick={forward}>
            10s <IoIosSkipForward />
          </button>
        </div>

        <input
          type="range"
          value={progress || 0}
          onChange={handleSeek}
        />

        <p>
          {formatTime(currentTime)} /{" "}
          {formatTime(duration)}
        </p>
      </div>

      {/* Related */}
      <div style={styles.relatedSection}>
        <h3 style={styles.relatedHeading}>
          More from {category}
        </h3>

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
    </div>
  );
}

export default Player;

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    background: "#000",
    minHeight: "100vh",
    color: "#fff",
  },

  videoWrapper: {
    width: "100%",
  },

  video: {
    width: "100%",
    maxHeight: "65vh",
    marginTop: "20px",
  },

  info: {
    padding: "16px",
  },

  controls: {
    padding: "16px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
  },

  relatedSection: {
    padding: "20px",
  },

  relatedHeading: {
    marginBottom: "16px",
  },

  relatedGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },

  relatedVideoCard: {
    cursor: "pointer",
  },

  thumbnail: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  title: {
    marginTop: "8px",
    fontSize: "14px",
  },

  countdown: {
    position: "absolute",
    bottom: "120px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111",
    padding: "10px 20px",
  },

  backBtn: {
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: 9999,
    cursor: "pointer",
    padding: "8px 12px",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};
