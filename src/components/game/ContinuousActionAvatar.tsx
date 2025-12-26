/**
 * ContinuousActionAvatar - Renders avatars with theme-specific continuous animations
 * NEVER IDLE - Characters are always in motion representing the activity
 */

import { motion } from "framer-motion";
import { ThemeType } from "@/config/game";
import { IntensityLevel } from "@/hooks/useGameLoop";

interface ContinuousActionAvatarProps {
  theme: ThemeType;
  sprite: string;
  isUser: boolean;
  isWinning: boolean;
  isLosing: boolean;
  isActive: boolean;
  scoreDelta: number;
  intensity: IntensityLevel;
  pulse: number;
  beatCount: number;
}

// Theme-specific animation configurations - continuous motion
const THEME_ANIMATIONS: Record<ThemeType, {
  idle: { y: number[]; x: number[]; rotate: number[]; scale: number[] };
  active: { y: number[]; x: number[]; rotate: number[]; scale: number[] };
  winning: { y: number[]; x: number[]; rotate: number[]; scale: number[] };
  losing: { y: number[]; x: number[]; rotate: number[]; scale: number[] };
  baseDuration: number;
}> = {
  forest: {
    // Running - bouncy forward motion (Temple Run style)
    idle: { y: [0, -8, 0], x: [0, 2, 0], rotate: [0, 2, 0], scale: [1, 1.02, 1] },
    active: { y: [0, -18, -5, -20, 0], x: [0, 5, -2, 6, 0], rotate: [0, 5, -3, 6, 0], scale: [1, 1.05, 0.98, 1.06, 1] },
    winning: { y: [0, -25, -8, -28, 0], x: [8, 15, 10, 18, 8], rotate: [0, 8, -4, 10, 0], scale: [1, 1.1, 1, 1.12, 1] },
    losing: { y: [0, -10, -3, -12, 0], x: [-8, -5, -10, -3, -8], rotate: [-3, 0, -5, 2, -3], scale: [0.95, 0.98, 0.93, 0.97, 0.95] },
    baseDuration: 0.35,
  },
  coding: {
    // Typing/hacking - rapid keyboard motion
    idle: { y: [0, -3, 0], x: [0, 1, 0], rotate: [0, 1, 0], scale: [1, 1.01, 1] },
    active: { y: [0, -4, -2, -5, -3, 0], x: [0, 3, -2, 4, -1, 0], rotate: [0, 2, -1, 3, -2, 0], scale: [1, 1.02, 1, 1.03, 1.01, 1] },
    winning: { y: [0, -6, -3, -7, -4, 0], x: [4, 8, 5, 10, 6, 4], rotate: [0, 4, -2, 5, -3, 0], scale: [1, 1.05, 1.02, 1.06, 1.03, 1] },
    losing: { y: [0, -3, -1, -4, -2, 0], x: [-4, -2, -5, -1, -3, -4], rotate: [-2, 0, -3, 1, -2, -2], scale: [0.98, 1, 0.97, 0.99, 0.98, 0.98] },
    baseDuration: 0.18,
  },
  ninja: {
    // Fighting - attack/block/dodge sequence
    idle: { y: [0, -6, 0], x: [0, 4, 0], rotate: [0, 3, 0], scale: [1, 1.03, 1] },
    active: { y: [0, -15, 8, -20, 5, 0], x: [0, 20, -12, 25, -8, 0], rotate: [0, 8, -10, 12, -6, 0], scale: [1, 1.08, 0.95, 1.1, 0.97, 1] },
    winning: { y: [0, -20, 12, -25, 8, 0], x: [15, 35, 10, 40, 20, 15], rotate: [0, 12, -15, 18, -8, 0], scale: [1, 1.15, 0.95, 1.18, 1, 1] },
    losing: { y: [0, -8, 3, -10, 2, 0], x: [-15, -10, -20, -8, -18, -15], rotate: [-8, -4, -12, -2, -10, -8], scale: [0.9, 0.95, 0.88, 0.93, 0.9, 0.9] },
    baseDuration: 0.5,
  },
  agent: {
    // Tactical - precise, calculated movements
    idle: { y: [0, -4, 0], x: [0, 3, 0], rotate: [0, 2, 0], scale: [1, 1.02, 1] },
    active: { y: [0, -8, -12, -6, 0], x: [0, 8, -5, 10, 0], rotate: [0, 4, -5, 6, 0], scale: [1, 1.04, 1.02, 1.05, 1] },
    winning: { y: [0, -12, -18, -10, 0], x: [8, 18, 12, 22, 8], rotate: [0, 6, -8, 10, 0], scale: [1, 1.08, 1.05, 1.1, 1] },
    losing: { y: [0, -5, -8, -4, 0], x: [-8, -5, -12, -3, -8], rotate: [-4, -2, -6, 0, -4], scale: [0.95, 0.98, 0.93, 0.96, 0.95] },
    baseDuration: 0.45,
  },
};

// Intensity speed multipliers
const INTENSITY_SPEEDS: Record<IntensityLevel, number> = {
  low: 1,
  medium: 1.3,
  high: 1.6,
  critical: 2.2,
};

export function ContinuousActionAvatar({
  theme,
  sprite,
  isUser,
  isWinning,
  isLosing,
  isActive,
  scoreDelta,
  intensity,
  pulse,
  beatCount,
}: ContinuousActionAvatarProps) {
  const config = THEME_ANIMATIONS[theme];
  const speedMultiplier = INTENSITY_SPEEDS[intensity];
  
  // Select animation state - NEVER truly idle
  const getAnimationState = () => {
    if (isWinning) return config.winning;
    if (isLosing) return config.losing;
    if (isActive) return config.active;
    return config.idle; // Still has motion even when "idle"
  };

  const animState = getAnimationState();
  const duration = config.baseDuration / speedMultiplier;

  // Position offset based on score delta (winner advances on track)
  const positionOffset = Math.min(Math.max(scoreDelta * 3, -50), 50);

  // Dynamic glow based on state
  const getGlowStyle = () => {
    if (isWinning) {
      return isUser
        ? "0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3)"
        : "0 0 30px hsl(var(--muted-foreground) / 0.5)";
    }
    if (isLosing && intensity === "critical") {
      return "0 0 20px hsl(var(--destructive) / 0.4)";
    }
    return "none";
  };

  // Action indicator based on theme and beat
  const getActionIndicator = () => {
    if (!isActive) return null;
    
    const indicators: Record<ThemeType, string[]> = {
      forest: ["💨", "🏃", "💪", "⚡"],
      coding: ["⌨️", "💻", "⚡", "🔥"],
      ninja: ["⚔️", "🥷", "💥", "🔥"],
      agent: ["🎯", "🔫", "💣", "⚡"],
    };
    
    return indicators[theme][beatCount % indicators[theme].length];
  };

  return (
    <motion.div
      className="relative"
      animate={{
        x: isUser ? positionOffset : -positionOffset,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Ground shadow - always present, size varies with motion */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/40 rounded-full blur-md"
        animate={{
          scaleX: [1, 0.8 + pulse * 0.2, 1],
          scaleY: [1, 0.7 + pulse * 0.3, 1],
          opacity: [0.4, 0.25, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeInOut",
        }}
      />

      {/* Winner aura effect */}
      {isWinning && (
        <motion.div
          className={`absolute inset-0 rounded-2xl blur-2xl ${
            isUser ? "bg-primary/30" : "bg-muted-foreground/30"
          }`}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2 / speedMultiplier,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Losing stumble effect */}
      {isLosing && intensity !== "low" && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: [0, 0.6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 / speedMultiplier,
          }}
        >
          <span className="text-2xl">😰</span>
        </motion.div>
      )}

      {/* Speed trail for winners */}
      {isWinning && isActive && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-16 h-1 rounded-full"
              style={{
                left: isUser ? -30 - i * 12 : undefined,
                right: !isUser ? -30 - i * 12 : undefined,
                background: isUser
                  ? `linear-gradient(${isUser ? "to right" : "to left"}, transparent, hsl(var(--primary) / ${0.4 - i * 0.1}))`
                  : `linear-gradient(${isUser ? "to right" : "to left"}, transparent, hsl(var(--muted-foreground) / ${0.3 - i * 0.08}))`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scaleX: [0.5, 1.5, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.3 / speedMultiplier,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}

      {/* Character sprite with continuous animation */}
      <motion.img
        src={sprite}
        alt={isUser ? "You" : "AI"}
        className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl transition-all ${
          isWinning ? "brightness-110 saturate-110" : isLosing ? "brightness-90 saturate-90" : ""
        }`}
        style={{
          boxShadow: getGlowStyle(),
          filter: isWinning ? "drop-shadow(0 0 10px hsl(var(--primary) / 0.5))" : undefined,
        }}
        animate={animState}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeInOut",
        }}
      />

      {/* Player label */}
      <motion.div
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-bold shadow-lg ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
        animate={{
          scale: isWinning ? [1, 1.1, 1] : 1,
        }}
        transition={{
          repeat: isWinning ? Infinity : 0,
          duration: 0.5,
        }}
      >
        {isUser ? "YOU" : "AI"}
      </motion.div>

      {/* Action indicator - shows current action */}
      {isActive && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl"
          key={beatCount}
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: [-5, -15, -25], scale: [0.8, 1.2, 0.6] }}
          transition={{ duration: 0.6 }}
        >
          {getActionIndicator()}
        </motion.div>
      )}

      {/* Winning crown/indicator */}
      {isWinning && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg"
          animate={{
            y: [0, -5, 0],
            rotate: [-5, 5, -5],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
          }}
        >
          👑
        </motion.div>
      )}
    </motion.div>
  );
}
