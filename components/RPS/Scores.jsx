import StarIcon from "@mui/icons-material/Star";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import styles from "../../styles/competitions.module.css";

const Scores = ({ percent }) => {
  return (
    <div className={styles.star_rating}>
      <div className={styles.back_stars}>
        <StarOutlineOutlinedIcon sx={{ color: "gold", fontSize: "2rem" }} />
        <StarOutlineOutlinedIcon sx={{ color: "gold", fontSize: "2rem" }} />
        <StarOutlineOutlinedIcon sx={{ color: "gold", fontSize: "2rem" }} />

        <div
          className={styles.front_stars}
          style={{
            width: percent,
          }}
        >
          <StarIcon sx={{ color: "gold", fontSize: "2rem" }} />
          <StarIcon sx={{ color: "gold", fontSize: "2rem" }} />
          <StarIcon sx={{ color: "gold", fontSize: "2rem" }} />
        </div>
      </div>
    </div>
  );
};

export default Scores;
