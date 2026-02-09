import { useParams, useNavigate } from "react-router-dom";

function Player() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* Back Button */}
      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      {/* Video */}
      <div style={styles.videoWrapper}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title="Video Player"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>

      {/* Video Info */}
      <div style={styles.info}>
        <h2>Video Title</h2>
        <p>Category Name</p>
      </div>

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
    height: "60vh",
  },
  info: {
    padding: "16px",
  },
  backBtn: {
    margin: "10px",
    padding: "8px 14px",
    cursor: "pointer",
  },
};
