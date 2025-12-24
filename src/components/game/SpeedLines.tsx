/**
 * SpeedLines - Velocity effect lines behind running characters
 * Creates sense of speed and motion
 */

import { motion } from "framer-motion";

interface SpeedLinesProps {
  isActive: boolean;
  intensity?: "low" | "medium" | "high";
  position: "left" | "right";
}

export function SpeedLines({ isActive, intensity = "medium", position }: SpeedLinesProps) {
  if (!isActive) return null;

  const lineCount = intensity === "high" ? 8 : intensity === "medium" ? 5 : 3;
  const opacity = intensity === "high" ? 0.6 : intensity === "medium" ? 0.4 : 0.2;
  const speed = intensity === "high" ? 0.3 : intensity === "medium" ? 0.5 : 0.7;

  return (
    <div className={`absolute ${position === "left" ? "left-0" : "right-0"} top-0 bottom-0 w-24 pointer-events-none overflow-hidden`}>
      {[...Array(lineCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 bg-gradient-to-r from-transparent via-foreground to-transparent rounded-full"
          style={{
            width: `${40 + Math.random() * 30}px`,
            top: `${20 + i * 12}%`,
            left: position === "left" ? "auto" : 0,
            right: position === "left" ? 0 : "auto",
            opacity: opacity * (0.5 + Math.random() * 0.5),
          }}
          animate={{
            x: position === "left" ? [0, -80] : [0, 80],
            opacity: [0, opacity, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: speed + Math.random() * 0.3,
            delay: i * 0.1,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
