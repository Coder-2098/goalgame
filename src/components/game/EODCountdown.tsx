/**
 * EODCountdown - End of Day countdown display
 * Visually represents the time threat with escalating intensity
 */

import { motion } from "framer-motion";
import { Clock, AlertTriangle, Flame } from "lucide-react";
import { IntensityLevel } from "@/hooks/useGameLoop";

interface EODCountdownProps {
  formattedTime: string;
  intensity: IntensityLevel;
  intensityValue: number;
  pulse: number;
}

export function EODCountdown({
  formattedTime,
  intensity,
  intensityValue,
  pulse,
}: EODCountdownProps) {
  // Dynamic styling based on intensity
  const getIntensityStyles = () => {
    switch (intensity) {
      case "critical":
        return {
          container: "bg-destructive/20 border-destructive/50",
          text: "text-destructive",
          icon: Flame,
          glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.5)]",
        };
      case "high":
        return {
          container: "bg-orange-500/20 border-orange-500/50",
          text: "text-orange-400",
          icon: AlertTriangle,
          glow: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        };
      case "medium":
        return {
          container: "bg-yellow-500/20 border-yellow-500/50",
          text: "text-yellow-400",
          icon: Clock,
          glow: "shadow-[0_0_10px_rgba(234,179,8,0.3)]",
        };
      default:
        return {
          container: "bg-background/80 border-border/50",
          text: "text-muted-foreground",
          icon: Clock,
          glow: "",
        };
    }
  };

  const styles = getIntensityStyles();
  const IconComponent = styles.icon;

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${styles.container} ${styles.glow}`}
      animate={{
        scale: intensity === "critical" ? [1, 1 + pulse * 0.05, 1] : 1,
        opacity: intensity === "critical" ? [1, 0.8 + pulse * 0.2, 1] : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={{
          rotate: intensity === "critical" ? [0, -10, 10, 0] : 0,
        }}
        transition={{
          repeat: intensity === "critical" ? Infinity : 0,
          duration: 0.5,
        }}
      >
        <IconComponent className={`w-4 h-4 ${styles.text}`} />
      </motion.div>
      
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${styles.text}`}>
          {intensity === "critical" ? "⚠️ EOD" : "EOD"}
        </span>
        <motion.span
          className={`text-sm font-bold font-mono ${styles.text}`}
          animate={{
            scale: intensity !== "low" ? [1, 1 + pulse * 0.03] : 1,
          }}
        >
          {formattedTime}
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="w-12 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            intensity === "critical"
              ? "bg-destructive"
              : intensity === "high"
              ? "bg-orange-500"
              : intensity === "medium"
              ? "bg-yellow-500"
              : "bg-primary"
          }`}
          style={{ width: `${intensityValue * 100}%` }}
          animate={{
            opacity: intensity === "critical" ? [1, 0.5, 1] : 1,
          }}
          transition={{
            repeat: intensity === "critical" ? Infinity : 0,
            duration: 0.3,
          }}
        />
      </div>
    </motion.div>
  );
}
