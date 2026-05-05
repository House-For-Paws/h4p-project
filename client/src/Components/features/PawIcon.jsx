import styles from "./pawIcon.module.css";
import { PawPrint } from "lucide-react";
import { useState } from "react";
function PawIcon({ size = 32 }) {
  return (
    <div
      className={styles.logoCircle}
      style={{ width: size * 2, height: size * 2 }}
    >
      <PawPrint size={size} color={"white"} />
    </div>
  );
}

export default PawIcon;
