/**
 * ObstacleLayer - Temple Run-style obstacles coming toward player
 * Theme-specific obstacles that create urgency and game feel
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ThemeType } from "@/config/game";

interface ObstacleLayerProps {
  theme: ThemeType;
  isActive: boolean;
  speed: number;
  aiWinning?: boolean;
}

// Theme-specific obstacles
const THEME_OBSTACLES: Record<ThemeType, { emoji: string; size: string }[]> = {
  forest: [
    { emoji: "🪨", size: "text-3xl" },
    { emoji: "🌲", size: "text-4xl" },
    { emoji: "🦊", size: "text-2xl" },
    { emoji: "🍄", size: "text-2xl" },
  ],
  coding: [
    { emoji: "🐛", size: "text-3xl" },
    { emoji: "❌", size: "text-2xl" },
    { emoji: "💥", size: "text-3xl" },
    { emoji: "⚠️", size: "text-2xl" },
  ],
  ninja: [
    { emoji: "⚔️", size: "text-3xl" },
    { emoji: "🗡️", size: "text-2xl" },
    { emoji: "🥷", size: "text-3xl" },
    { emoji: "🌀", size: "text-2xl" },
  ],
  agent: [
    { emoji: "💣", size: "text-3xl" },
    { emoji: "🔫", size: "text-2xl" },
    { emoji: "🚨", size: "text-3xl" },
    { emoji: "🎯", size: "text-2xl" },
  ],
};

interface Obstacle {
  id: number;
  emoji: string;
  size: string;
  lane: number; // 0 = top, 1 = middle, 2 = bottom
  speed: number;
}

export function ObstacleLayer({ theme, isActive, speed, aiWinning }: ObstacleLayerProps) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstacleTypes = THEME_OBSTACLES[theme];
  
  // Spawn obstacles
  useEffect(() => {
    if (!isActive) {
      setObstacles([]);
      return;
    }

    // Spawn rate increases when AI is winning
    const spawnRate = aiWinning ? 1500 : 2500;
    
    const spawnInterval = setInterval(() => {
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const newObstacle: Obstacle = {
        id: Date.now() + Math.random(),
        emoji: obstacleType.emoji,
        size: obstacleType.size,
        lane: Math.floor(Math.random() * 3),
        speed: (3 + Math.random() * 2) / speed,
      };
      
      setObstacles(prev => [...prev.slice(-5), newObstacle]); // Keep max 6 obstacles
    }, spawnRate);

    return () => clearInterval(spawnInterval);
  }, [isActive, theme, obstacleTypes, speed, aiWinning]);

  // Remove obstacles that have passed
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setObstacles(prev => prev.filter(o => Date.now() - o.id < 5000));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const getLanePosition = (lane: number) => {
    switch (lane) {
      case 0: return "25%";
      case 1: return "45%";
      case 2: return "65%";
      default: return "50%";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {obstacles.map((obstacle) => (
          <motion.div
            key={obstacle.id}
            className={`absolute ${obstacle.size} drop-shadow-lg`}
            style={{ top: getLanePosition(obstacle.lane) }}
            initial={{ x: "100vw", opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ 
              x: "-50px", 
              opacity: [0, 1, 1, 0.5],
              scale: [0.5, 1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: obstacle.speed,
              ease: "linear",
            }}
          >
            <div className="relative">
              {/* Glow effect for obstacles */}
              <div className="absolute inset-0 blur-md bg-destructive/30 rounded-full -z-10" />
              {obstacle.emoji}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Warning flash when AI is winning */}
      {aiWinning && isActive && (
        <motion.div
          className="absolute inset-0 bg-destructive/10 pointer-events-none"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </div>
  );
}
