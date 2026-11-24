/**
 * =============================================================================
 * FILE: client/src/Components/features/PawIcon.jsx
 * ROLE: Brand paw icon (Navbar / Footer / auth cards)
 * =============================================================================
 */
import styles from "../../styles/pawIcon.module.css";
import { PawPrint } from "lucide-react";

function PawIcon({
  size = 32,
  hideCircle = false,

  /** `size` controls icon size; wrapper uses size*2 to keep circular padding. */
  // 🔥 צבע האייקון
  color = "#ffffff",

  // 🔥 צבע המעגל
  circleColor = "#ff9800",
}) {
  return (
    <div
      className={`${styles.logoCircle} ${hideCircle ? styles.noCircle : ""}`}
      style={{
        width: size * 2,
        height: size * 2,

        // 🔥 צבע דינמי למעגל
        backgroundColor: hideCircle ? "transparent" : circleColor,
      }}
    >
      <PawPrint size={size} color={color} />
    </div>
  );
}

export default PawIcon;
