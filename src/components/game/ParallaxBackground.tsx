/**
 * ParallaxBackground - Temple Run-style scrolling parallax layers
 * Creates depth with multiple layers moving at different speeds
 */

import { motion } from "framer-motion";
import { ThemeType } from "@/config/game";

interface ParallaxBackgroundProps {
  theme: ThemeType;
  speed: number;
  isActive: boolean;
  userWinning?: boolean;
  aiWinning?: boolean;
}

// Theme-specific colors and gradients
const THEME_LAYERS: Record<ThemeType, {
  far: string;
  mid: string;
  near: string;
  ground: string;
}> = {
  forest: {
    far: "from-emerald-900/30 via-transparent to-emerald-900/30",
    mid: "from-green-800/40 via-transparent to-green-800/40",
    near: "from-green-700/50 via-transparent to-green-700/50",
    ground: "from-amber-900/60 to-amber-800/40",
  },
  coding: {
    far: "from-blue-900/30 via-transparent to-blue-900/30",
    mid: "from-cyan-800/40 via-transparent to-cyan-800/40",
    near: "from-purple-700/50 via-transparent to-purple-700/50",
    ground: "from-slate-900/60 to-slate-800/40",
  },
  ninja: {
    far: "from-red-900/30 via-transparent to-red-900/30",
    mid: "from-orange-800/40 via-transparent to-orange-800/40",
    near: "from-pink-700/50 via-transparent to-pink-700/50",
    ground: "from-stone-900/60 to-stone-800/40",
  },
  agent: {
    far: "from-gray-900/30 via-transparent to-gray-900/30",
    mid: "from-zinc-800/40 via-transparent to-zinc-800/40",
    near: "from-neutral-700/50 via-transparent to-neutral-700/50",
    ground: "from-slate-900/60 to-slate-800/40",
  },
};

// Theme-specific decorations
const THEME_DECORATIONS: Record<ThemeType, string[]> = {
  forest: ["🌲", "🌳", "🌿", "🍃"],
  coding: ["</>", "{ }", "[ ]", "01"],
  ninja: ["⛩️", "🎋", "🌸", "☯️"],
  agent: ["🎯", "💣", "🔒", "📡"],
};

export function ParallaxBackground({
  theme,
  speed,
  isActive,
  userWinning,
  aiWinning,
}: ParallaxBackgroundProps) {
  const layers = THEME_LAYERS[theme];
  const decorations = THEME_DECORATIONS[theme];
  
  // Adjust speed based on game state
  const baseSpeed = isActive ? speed : speed * 0.3;
  const adjustedSpeed = userWinning ? baseSpeed * 1.5 : aiWinning ? baseSpeed * 0.7 : baseSpeed;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Far layer - slowest */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${layers.far}`}
        animate={isActive ? { x: [0, -100, 0] } : {}}
        transition={{
          repeat: Infinity,
          duration: 20 / adjustedSpeed,
          ease: "linear",
        }}
      />

      {/* Mid layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${layers.mid}`}
        animate={isActive ? { x: [0, -150, 0] } : {}}
        transition={{
          repeat: Infinity,
          duration: 12 / adjustedSpeed,
          ease: "linear",
        }}
      />

      {/* Decorative elements moving across */}
      {isActive && decorations.map((decoration, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-30"
          style={{
            top: `${20 + index * 20}%`,
          }}
          initial={{ x: "100vw" }}
          animate={{ x: "-100px" }}
          transition={{
            repeat: Infinity,
            duration: (8 + index * 2) / adjustedSpeed,
            ease: "linear",
            delay: index * 1.5,
          }}
        >
          {decoration}
        </motion.div>
      ))}

      {/* Near layer - fastest */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${layers.near}`}
        animate={isActive ? { x: [0, -200, 0] } : {}}
        transition={{
          repeat: Infinity,
          duration: 8 / adjustedSpeed,
          ease: "linear",
        }}
      />

      {/* Ground layer with scrolling effect */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t ${layers.ground}`}
        style={{
          backgroundSize: "40px 100%",
        }}
      >
        {/* Speed lines on ground */}
        {isActive && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 bg-foreground/20 rounded-full"
                style={{
                  width: `${30 + Math.random() * 50}px`,
                  bottom: `${4 + Math.random() * 8}px`,
                }}
                initial={{ x: "100vw" }}
                animate={{ x: "-100px" }}
                transition={{
                  repeat: Infinity,
                  duration: (1.5 + Math.random()) / adjustedSpeed,
                  ease: "linear",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Dust particles */}
      {isActive && (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-foreground/20"
              style={{
                top: `${30 + Math.random() * 50}%`,
              }}
              initial={{ x: "100vw", opacity: 0.5 }}
              animate={{ 
                x: "-20px", 
                opacity: [0.5, 0.8, 0.3],
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: (2 + Math.random() * 2) / adjustedSpeed,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
