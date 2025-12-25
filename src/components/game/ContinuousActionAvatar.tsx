/**
 * ContinuousActionAvatar - Renders avatars with theme-specific continuous animations
 * Represents actual activity: running race, coding battle, ninja fight, agent mission
 */

import { motion } from "framer-motion";
import { ThemeType } from "@/config/game";

interface ContinuousActionAvatarProps {
  theme: ThemeType;
  sprite: string;
  isUser: boolean;
  isWinning: boolean;
  isLosing: boolean;
  isActive: boolean;
  scoreDelta: number; // Positive if ahead, negative if behind
}

// Theme-specific animation configurations
const THEME_ANIMATIONS: Record<ThemeType, {
  active: {
    y: number[];
    x: number[];
    rotate: number[];
    scale: number[];
  };
  winning: {
    y: number[];
    x: number[];
  };
  losing: {
    y: number[];
    x: number[];
  };
  duration: number;
}> = {
  forest: {
    // Running - bouncy forward motion
    active: {
      y: [0, -15, -5, -18, 0],
      x: [0, 3, -2, 4, 0],
      rotate: [0, 3, -2, 4, 0],
      scale: [1, 1.02, 0.98, 1.03, 1],
    },
    winning: {
      y: [0, -20, -8, -22, 0],
      x: [5, 10, 8, 12, 5],
    },
    losing: {
      y: [0, -8, -3, -10, 0],
      x: [-5, -3, -8, -2, -5],
    },
    duration: 0.4,
  },
  coding: {
    // Typing - rapid keyboard action
    active: {
      y: [0, -3, 0, -4, -2, 0],
      x: [0, 2, -1, 3, -2, 0],
      rotate: [0, 1, -1, 2, -1, 0],
      scale: [1, 1.01, 1, 1.02, 1.01, 1],
    },
    winning: {
      y: [0, -5, -2, -6, 0],
      x: [3, 6, 4, 8, 3],
    },
    losing: {
      y: [0, -2, 0, -3, 0],
      x: [-3, -1, -4, 0, -3],
    },
    duration: 0.2,
  },
  ninja: {
    // Fighting - attack/block sequence
    active: {
      y: [0, -10, 5, -15, 0],
      x: [0, 15, -10, 20, 0],
      rotate: [0, 5, -8, 10, 0],
      scale: [1, 1.05, 0.95, 1.08, 1],
    },
    winning: {
      y: [0, -15, 8, -20, 0],
      x: [10, 25, 5, 30, 10],
    },
    losing: {
      y: [0, -5, 2, -8, 0],
      x: [-10, -5, -15, -3, -10],
    },
    duration: 0.6,
  },
  agent: {
    // Tactical - precise movements
    active: {
      y: [0, -5, -8, -3, 0],
      x: [0, 5, -3, 8, 0],
      rotate: [0, 2, -3, 4, 0],
      scale: [1, 1.02, 1, 1.03, 1],
    },
    winning: {
      y: [0, -8, -12, -5, 0],
      x: [5, 12, 8, 15, 5],
    },
    losing: {
      y: [0, -3, -5, -2, 0],
      x: [-5, -2, -8, 0, -5],
    },
    duration: 0.5,
  },
};

export function ContinuousActionAvatar({
  theme,
  sprite,
  isUser,
  isWinning,
  isLosing,
  isActive,
  scoreDelta,
}: ContinuousActionAvatarProps) {
  const config = THEME_ANIMATIONS[theme];
  
  // Determine which animation state to use
  const getAnimationState = () => {
    if (!isActive) {
      return {
        y: [0, -3, 0],
        x: [0],
        rotate: [0],
        scale: [1, 1.02, 1],
      };
    }
    
    if (isWinning) {
      return {
        ...config.active,
        y: config.winning.y,
        x: config.winning.x,
      };
    }
    
    if (isLosing) {
      return {
        ...config.active,
        y: config.losing.y,
        x: config.losing.x,
      };
    }
    
    return config.active;
  };

  const animState = getAnimationState();
  const duration = isActive ? config.duration : 2;

  // Position offset based on score delta (winner advances)
  const positionOffset = Math.min(Math.max(scoreDelta * 2, -30), 30);

  return (
    <motion.div
      className="relative"
      animate={{
        x: isUser ? positionOffset : -positionOffset,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Ground shadow */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 rounded-full blur-sm"
          animate={{
            scaleX: [1, 0.85, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: config.duration,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Winning glow effect - subtle aura */}
      {isWinning && (
        <motion.div
          className={`absolute inset-0 rounded-2xl blur-xl ${
            isUser ? "bg-primary/20" : "bg-destructive/20"
          }`}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Character sprite with continuous animation */}
      <motion.img
        src={sprite}
        alt={isUser ? "You" : "AI"}
        className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl ${
          isWinning ? "brightness-110" : isLosing ? "brightness-90" : ""
        }`}
        animate={animState}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeInOut",
        }}
      />

      {/* Label */}
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full font-bold shadow-lg ${
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-destructive text-destructive-foreground"
      }`}>
        {isUser ? "YOU" : "AI"}
      </div>

      {/* Action indicator for winner */}
      {isActive && isWinning && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
          }}
        >
          {theme === "forest" && "🏃‍♂️"}
          {theme === "coding" && "⚡"}
          {theme === "ninja" && "⚔️"}
          {theme === "agent" && "🎯"}
        </motion.div>
      )}
    </motion.div>
  );
}
