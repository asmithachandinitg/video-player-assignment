import {
  useRef,
  useState,
  useEffect,
} from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import data from "../data/videos.json";

import { IoMdArrowRoundBack } from "react-icons/io";
import {
  IoIosSkipBackward,
  IoIosSkipForward,
} from "react-icons/io";
import {
  FaPlay,
  FaPause,
} from "react-icons/fa";

/* ----------------------------- */

function Player() {
  const navigate = useNavigate();
  const location = useLocation();

  /* 🔄 Restore video on refresh */
  let video = location.state?.video;
  let category =
    location.state?.category;

  if (!video) {
    const saved =
      localStorage.getItem(
        "currentVideo"
      );

    if (saved) {
      const parsed =
        JSON.parse(saved);
      video = parsed.video;
      category = parsed.category;
    }
  }

  /* 🛑 Safety guard */
  if (!video || !video.mp4) {
    return (
      <h2 style={{ color: "#fff" }}>
        No video selected
      </h2>
    );
  }

  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] =
    useState(true);
  const [progress, setProgress] =
    useState(0);
  const [currentTime, setCurrentTime] =
    useState(0);
  const [duration, setDuration] =
    useState(0);

  const [mini, setMini] =
    useState(false);

  const [countdown, setCountdown] =
    useState(null);

  /* 🎥 Related videos */
  const relatedVideos =
    data.categories
      .find(
        (cat) =>
          cat.category.name ===
          category
      )
      ?.contents.filter(
        (v) =>
          v.title !== video.title
      ) || [];

  /* ▶️ Autoplay + Resume */
  useEffect(() => {
    const vid = videoRef.current;

    if (!vid) return;

    const savedTime =
      localStorage.getItem(
        video.mp4
      );

    if (savedTime) {
      vid.currentTime =
        savedTime;
    }

    vid.play();

    document.body.classList.remove(
      "fade-out"
    );
  }, [video]);

  /* 📊 Progress update */
  const updateProgress = () => {
    const vid = videoRef.current;

    if (!vid.duration) return; // 🛑 prevents NaN

    const current =
      vid.currentTime;
    const total = vid.duration;

    setCurrentTime(current);
    setDuration(total);
    setProgress(
      (current / total) * 100
    );

    localStorage.setItem(
      video.mp4,
      current
    );
  };

  /* ▶️ Controls */
  const togglePlay = () => {
    const vid = videoRef.current;

    if (isPlaying) {
      vid.pause();
    } else {
      vid.play();
    }

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

    vid.currentTime =
      (e.target.value / 100) *
      vid.duration;
  };

  /* ⏱ Time format */
  const formatTime = (time) => {
    if (!time) return "0:00";

    const mins =
      Math.floor(time / 60);
    const secs = Math.floor(
      time % 60
    )
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  /* 🔁 Switch video */
  const playNewVideo = (vid) => {
    localStorage.setItem(
      "currentVideo",
      JSON.stringify({
        video: vid,
        category,
      })
    );

    navigate("/player", {
      state: {
        video: vid,
        category,
      },
    });

    window.location.reload();
  };

  /* ⏭ Auto-play next */
  const handleEnded = () => {
    if (!relatedVideos.length)
      return;

    let count = 5;
    setCountdown(count);

    const interval =
      setInterval(() => {
        count--;
        setCountdown(count);

        if (count === 0) {
          clearInterval(
            interval
          );
          playNewVideo(
            relatedVideos[0]
          );
        }
      }, 1000);
  };

  /* 🧲 Drag → Mini player */
  const handleDrag = (e) => {
    if (e.clientY > 250) {
      setMini(true);
    }
  };

  const restorePlayer = () => {
    setMini(false);
  };

  /* 🔙 Back */
  const goBack = () => {
    document.body.classList.add(
      "fade-out"
    );

    setTimeout(() => {
      navigate("/");
    }, 250);
  };

  /* ----------------------------- */

  return (
    <div style={styles.container}>
      
      {/* 🔙 Back */}
      {!mini && (
        <button
          style={styles.backBtn}
          onClick={goBack}
        >
          <IoMdArrowRoundBack />
          Back
        </button>
      )}

      {/* 🎬 Video */}
      <div
        style={{
          ...styles.videoWrapper,
          ...(mini &&
            styles.miniWrapper),
        }}
        onMouseDown={handleDrag}
        onClick={
          mini
            ? restorePlayer
            : null
        }
      >
        <video
          ref={videoRef}
          src={video.mp4}
          style={{
            ...styles.video,
            ...(mini &&
              styles.miniVideo),
          }}
          onTimeUpdate={
            updateProgress
          }
          onEnded={handleEnded}
        />
      </div>

      {/* ⏭ Countdown */}
      {countdown && (
        <div style={styles.countdown}>
          Next video in{" "}
          {countdown}s
          <button
            onClick={() =>
              setCountdown(null)
            }
          >
            Cancel
          </button>
        </div>
      )}

      {!mini && (
        <>
          {/* Info */}
          <div style={styles.info}>
            <h2>
              {video.title}
            </h2>
            <p>{category}</p>
          </div>

          {/* Controls */}
          <div
            style={styles.controls}
          >
            <div
              style={
                styles.buttons
              }
            >
              <button
                onClick={
                  backward
                }
              >
                <IoIosSkipBackward />{" "}
                10s
              </button>

              <button
                onClick={
                  togglePlay
                }
              >
                {isPlaying ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
              </button>

              <button
                onClick={
                  forward
                }
              >
                10s{" "}
                <IoIosSkipForward />
              </button>
            </div>

            <input
              type="range"
              value={progress || 0}
              onChange={
                handleSeek
              }
            />

            <p>
              {formatTime(
                currentTime
              )}{" "}
              /{" "}
              {formatTime(
                duration
              )}
            </p>
          </div>

          {/* Related */}
          {/* 🎞 More From Category */}
<div style={styles.relatedSection}>
  
  <h3 style={styles.relatedHeading}>
    More from {category}
  </h3>

  <div style={styles.relatedGrid}>
    
    {relatedVideos.map((vid, i) => (
      <div
        key={i}
        style={styles.relatedVideoCard}
        onClick={() =>
          playNewVideo(vid)
        }
      >
        <div style={styles.thumbWrapper}>
          
          <img
            src={vid.thumbnailUrl}
            alt={vid.title}
            style={styles.thumbnail}
          />

          <span style={styles.duration}>
            {vid.duration}
          </span>

          <span style={styles.badge}>
            {category}
          </span>

        </div>

        <p style={styles.title}>
          {vid.title}
        </p>
      </div>
    ))}

  </div>
</div>

        </>
      )}
    </div>
  );
}

export default Player;

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

  miniWrapper: {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    width: "300px",
    zIndex: 999,
  },

  miniVideo: {
    width: "300px",
    height: "170px",
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
    padding: "16px",
  },

  relatedCard: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    cursor: "pointer",
  },

  relatedThumb: {
    width: "120px",
    height: "70px",
    objectFit: "cover",
  },

  countdown: {
    position: "absolute",
    bottom: "120px",
    left: "50%",
    transform:
      "translateX(-50%)",
    background: "#111",
    padding: "10px 20px",
  },

  backBtn: {
    position: "absolute",
    top: "10px",
    left: "10px",
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

/* Reuse Home styles */
thumbWrapper: {
  position: "relative",
},

thumbnail: {
  width: "100%",
  height: "140px",
  objectFit: "cover",
  borderRadius: "10px",
},

duration: {
  position: "absolute",
  bottom: "8px",
  right: "8px",
  background: "rgba(0,0,0,0.8)",
  padding: "2px 6px",
  fontSize: "12px",
  borderRadius: "4px",
},

badge: {
  position: "absolute",
  top: "8px",
  left: "8px",
  background: "red",
  padding: "2px 8px",
  fontSize: "11px",
  borderRadius: "6px",
},

title: {
  marginTop: "8px",
  fontSize: "14px",
},

};
