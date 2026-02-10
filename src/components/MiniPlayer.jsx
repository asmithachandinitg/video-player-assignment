import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlay, FaPause } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";

function MiniPlayer() {
  const navigate = useNavigate();
  const location = useLocation();

  const videoRef = useRef(null);
  const [data, setData] = useState(null);
  const [playing, setPlaying] = useState(true);

  /* LOAD MINI PLAYER DATA */
  useEffect(() => {
    const saved = localStorage.getItem("miniPlayer");

    if (saved) {
      const parsed = JSON.parse(saved);

      setData(parsed);

      // Sync play state
      setPlaying(parsed.isPlaying ?? true);
    }
  }, [location.pathname]);

  /* Show only on Home */
  if (!data || location.pathname !== "/") return null;

  /* PLAY / PAUSE */
  const togglePlay = () => {
    const vid = videoRef.current;

    if (!vid) return;

    if (playing) vid.pause();
    else vid.play();

    setPlaying(!playing);

    // Update storage play state
    localStorage.setItem(
      "miniPlayer",
      JSON.stringify({
        ...data,
        isPlaying: !playing,
      }),
    );
  };

  /* CLOSE MINI PLAYER */
  const closeMini = () => {
    localStorage.removeItem("miniPlayer");
    setData(null);
  };

  /* RESTORE FULLSCREEN */
  const restore = () => {
    navigate("/player", {
      state: {
        video: data.video,
        category: data.category,
      },
    });

    localStorage.removeItem("miniPlayer");
  };

  /* SAFE TITLE LOGIC */
  const videoTitle = data?.video?.title || data?.video?.name || "Playing video";

  return (
    <motion.div style={styles.wrapper}>
      <video
        ref={videoRef}
        src={data.video.mp4}
        style={styles.video}
        autoPlay={data.isPlaying}
        onLoadedMetadata={() => {
          videoRef.current.currentTime = data.currentTime || 0;
        }}
        onClick={restore}
      />

      {/* TITLE DISPLAY */}
      <div style={styles.info} onClick={restore}>
        {videoTitle}
      </div>

      <button onClick={togglePlay} style={styles.btn}>
        {playing ? <FaPause /> : <FaPlay />}
      </button>

      <button onClick={closeMini} style={styles.btn}>
        <IoClose />
      </button>
    </motion.div>
  );
}

export default MiniPlayer;

/* ---------------- STYLES ---------------- */

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 10,
    right: 10,
    width: 320,
    background: "#111",
    display: "flex",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    zIndex: 9999,
  },

  video: {
    width: 120,
    height: 70,
    objectFit: "cover",
    borderRadius: 6,
  },

  info: {
    flex: 1,
    padding: "0 10px",
    fontSize: 14,
    cursor: "pointer",

    /* TITLE CLAMP */
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#fff",
  },

  btn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    marginLeft: 6,
  },
};
