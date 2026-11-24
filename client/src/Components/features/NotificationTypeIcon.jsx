/**
 * =============================================================================
 * FILE: client/src/Components/features/NotificationTypeIcon.jsx
 * ROLE: Icon + label per notification type (comment, like, adopt, warn, …)
 * =============================================================================
 */
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Flag,
  Heart,
  MessageCircle,
  PawPrint,
} from "lucide-react";
import styles from "../../styles/notificationTypeIcon.module.css";

export function getNotificationVisual(type) {
  const value = String(type || "").toLowerCase();
  if (value === "pet_comment") {
    return {
      Icon: MessageCircle,
      tone: "comment",
      label: "Comment",
    };
  }
  if (value === "pet_like") {
    return {
      Icon: Heart,
      tone: "like",
      label: "Like",
    };
  }
  if (value === "adoption_request") {
    return {
      Icon: PawPrint,
      tone: "adopt",
      label: "Adoption request",
    };
  }
  if (value === "application_update") {
    return {
      Icon: CheckCircle2,
      tone: "update",
      label: "Request update",
    };
  }
  if (value === "admin_warning") {
    return {
      Icon: AlertTriangle,
      tone: "warning",
      label: "Warning",
    };
  }
  if (value === "content_report") {
    return {
      Icon: Flag,
      tone: "report",
      label: "Report",
    };
  }
  return {
    Icon: Bell,
    tone: "default",
    label: "Update",
  };
}

function NotificationTypeIcon({ type, size = "md", showLabel = false }) {
  const { Icon, tone, label } = getNotificationVisual(type);
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div className={`${styles.wrap} ${styles[`tone_${tone}`] || ""}`}>
      <span className={`${styles.chip} ${styles[`chip_${tone}`] || ""}`} aria-hidden>
        <Icon size={iconSize} strokeWidth={2.2} />
      </span>
      {showLabel ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}

export default NotificationTypeIcon;
