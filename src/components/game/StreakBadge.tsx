/**
 * StreakBadge - Animated streak display with fire effects
 * Shows current streak with milestone-based visual upgrades
 */

import { motion } from "framer-motion";
import { Flame, Award, Trophy, Crown } from "lucide-react";

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean;
}

type StreakTier = "none" | "bronze" | "silver" | "gold" | "legendary";

const getStreakTier = (streak: number): StreakTier => {
  if (streak >= 30) return "legendary";
  if (streak >= 14) return "gold";
  if (streak >= 7) return "silver";
  if (streak >= 3) return "bronze";
  return "none";
};

const TIER_STYLES: Record<StreakTier, {
  bgGradient: string;
  textColor: string;
  icon: typeof Flame;
  glowColor: string;
  label: string;
}> = {
  none: {
    bgGradient: "from-muted to-muted",
    textColor: "text-muted-foreground",
    icon: Flame,
    glowColor: "",
    label: "Start a streak!",
  },
  bronze: {
    bgGradient: "from-orange-600 to-amber-700",
    textColor: "text-orange-100",
    icon: Flame,
    glowColor: "shadow-orange-500/50",
    label: "Bronze Flame",
  },
  silver: {
    bgGradient: "from-slate-400 to-zinc-500",
    textColor: "text-slate-100",
    icon: Award,
    glowColor: "shadow-slate-400/50",
    label: "Silver Flame",
  },
  gold: {
    bgGradient: "from-yellow-400 to-amber-500",
    textColor: "text-yellow-900",
    icon: Trophy,
    glowColor: "shadow-yellow-400/50",
    label: "Gold Flame",
  },
  legendary: {
    bgGradient: "from-purple-500 via-pink-500 to-red-500",
    textColor: "text-white",
    icon: Crown,
    glowColor: "shadow-purple-500/50",
    label: "Legendary",
  },
};

export function StreakBadge({ currentStreak, longestStreak, compact = false }: StreakBadgeProps) {
  const tier = getStreakTier(currentStreak);
  const styles = TIER_STYLES[tier];
  const Icon = styles.icon;

  if (compact) {
    return (
      <motion.div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${styles.bgGradient} ${styles.glowColor} shadow-lg`}
        whileHover={{ scale: 1.05 }}
        animate={tier !== "none" ? { 
          boxShadow: [
            `0 0 10px hsl(var(--primary) / 0.3)`,
            `0 0 20px hsl(var(--primary) / 0.5)`,
            `0 0 10px hsl(var(--primary) / 0.3)`,
          ]
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <motion.div
          animate={tier !== "none" ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Icon className={`w-4 h-4 ${styles.textColor}`} />
        </motion.div>
        <span className={`text-sm font-bold ${styles.textColor}`}>
          {currentStreak}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${styles.bgGradient} ${styles.glowColor} shadow-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated fire particles for active streaks */}
      {tier !== "none" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-300/60"
              style={{
                left: `${20 + i * 15}%`,
                bottom: 0,
              }}
              animate={{
                y: [0, -40, -60],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1 + i * 0.2,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={tier !== "none" ? { 
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Icon className={`w-8 h-8 ${styles.textColor}`} />
            {tier === "legendary" && (
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md -z-10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </motion.div>
          <div>
            <p className={`text-xs font-medium ${styles.textColor} opacity-80`}>
              {styles.label}
            </p>
            <p className={`text-2xl font-bold ${styles.textColor}`}>
              {currentStreak} Day{currentStreak !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className={`text-right ${styles.textColor}`}>
          <p className="text-xs opacity-70">Best</p>
          <p className="text-lg font-semibold">{longestStreak}</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {tier !== "legendary" && currentStreak > 0 && (
        <div className="mt-3 relative">
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${getProgressToNextTier(currentStreak)}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className={`text-xs mt-1 ${styles.textColor} opacity-70`}>
            {getNextTierText(currentStreak)}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function getProgressToNextTier(streak: number): number {
  if (streak >= 30) return 100;
  if (streak >= 14) return ((streak - 14) / 16) * 100;
  if (streak >= 7) return ((streak - 7) / 7) * 100;
  if (streak >= 3) return ((streak - 3) / 4) * 100;
  return (streak / 3) * 100;
}

function getNextTierText(streak: number): string {
  if (streak >= 30) return "Maximum tier reached!";
  if (streak >= 14) return `${30 - streak} days to Legendary`;
  if (streak >= 7) return `${14 - streak} days to Gold`;
  if (streak >= 3) return `${7 - streak} days to Silver`;
  return `${3 - streak} days to Bronze`;
}
