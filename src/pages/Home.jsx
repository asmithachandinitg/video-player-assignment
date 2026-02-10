import data from "../data/videos.json";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Home() {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState({});

  const toggleLoadMore = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const openPlayer = (video, category) => {
    localStorage.setItem("currentVideo", JSON.stringify({ video, category }));

    setTimeout(() => {
      navigate("/player", {
        state: { video, category },
      });
    }, 50);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Discover Videos</h1>

      {data.categories.map((cat, index) => {
        const isExpanded = expanded[index];

        const visibleVideos = isExpanded
          ? cat.contents
          : cat.contents.slice(0, 6);

        return (
          <div key={index} style={styles.section}>
            <h2 style={styles.category}>{cat.category.name}</h2>

            <div style={styles.grid}>
              {visibleVideos.map((video, i) => (
                <div
                  key={i}
                  style={styles.card}
                  onClick={() => openPlayer(video, cat.category.name)}
                >
                  <div style={styles.thumbWrapper}>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={styles.thumbnail}
                    />

                    <span style={styles.duration}>{video.duration}</span>

                    <span style={styles.badge}>{cat.category.name}</span>
                  </div>

                  <p style={styles.title}>{video.title}</p>
                </div>
              ))}
            </div>

            {cat.contents.length > 6 && (
              <div style={styles.loadMoreWrapper}>
                <button
                  style={styles.loadBtn}
                  onClick={() => toggleLoadMore(index)}
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Home;

const styles = {
  container: {
    background: "#0f0f0f",
    minHeight: "100vh",
    padding: "20px",
    color: "#fff",
  },

  heading: {
    marginBottom: "30px",
    fontSize: "26px",
  },

  section: {
    marginBottom: "50px",
  },

  category: {
    marginBottom: "16px",
    fontSize: "20px",
  },

  /* Responsive Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "18px",
  },

  card: {
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },

  thumbWrapper: {
    position: "relative",
  },

  /* 16:9 Aspect Ratio */
  thumbnail: {
    width: "100%",
    aspectRatio: "16 / 9",
    objectFit: "cover",
    borderRadius: "12px",
  },

  duration: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "rgba(0,0,0,0.85)",
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

  /* Title Clamp */
  title: {
    marginTop: "8px",
    fontSize: "14px",
    lineHeight: "1.3",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  /* Show More Bottom Center */
  loadMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },

  loadBtn: {
    padding: "8px 20px",
    borderRadius: "25px",
    border: "none",
    cursor: "pointer",
    background: "#fff",
    color: "#000",
    fontWeight: "bold",
  },
};
