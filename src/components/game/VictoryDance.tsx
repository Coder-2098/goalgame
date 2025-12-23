/**
 * Victory Dance Component - Animated celebration for the winner
 */

import { motion } from "framer-motion";
import { ThemeType, GameState } from "@/config/game/types";
import { THEME_CONFIGS } from "@/config/game/themes.config";

interface VictoryDanceProps {
  winner: "user" | "ai";
  theme: ThemeType;
  userSprite: string;
  aiSprite: string;
}

export function VictoryDance({ winner, theme, userSprite, aiSprite }: VictoryDanceProps) {
  const config = THEME_CONFIGS[theme];
  const isUserWinner = winner === "user";
  const winnerSprite = isUserWinner ? userSprite : aiSprite;
  const loserSprite = isUserWinner ? aiSprite : userSprite;
  const effects = isUserWinner ? config.effects.victoryEffects : config.effects.defeatEffects;
  const message = isUserWinner ? config.messages.victoryText : config.messages.defeatText;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      {/* Celebration overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 ${
          isUserWinner 
            ? "bg-gradient-to-t from-primary/40 via-transparent to-primary/20" 
            : "bg-gradient-to-t from-destructive/40 via-transparent to-destructive/20"
        }`}
      />

      {/* Confetti/Effects */}
      {effects.map((effect, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none"
          initial={{ 
            opacity: 0, 
            y: -100,
            x: Math.random() * 300 - 150,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [0, 200, 300],
            x: Math.random() * 100 - 50,
            rotate: [0, 360, 720],
          }}
          transition={{ 
            duration: 2,
            delay: i * 0.15,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          {effect}
        </motion.div>
      ))}

      {/* Winner with victory dance */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -30, 0, -25, 0, -15, 0],
          rotate: [0, -5, 5, -5, 5, 0],
          scale: [1, 1.1, 1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Winner glow */}
        <motion.div
          className={`absolute inset-0 rounded-full blur-2xl ${
            isUserWinner ? "bg-primary/50" : "bg-destructive/50"
          }`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Crown or trophy above winner */}
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl"
          animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isUserWinner ? "👑" : "🤖"}
        </motion.div>

        <img
          src={winnerSprite}
          alt={isUserWinner ? "You win!" : "AI wins!"}
          className="w-40 h-40 object-contain drop-shadow-2xl relative z-10"
        />

        {/* Winner label */}
        <motion.div
          className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-bold text-sm shadow-lg ${
            isUserWinner 
              ? "bg-primary text-primary-foreground" 
              : "bg-destructive text-destructive-foreground"
          }`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          WINNER!
        </motion.div>
      </motion.div>

      {/* Loser in corner, defeated */}
      <motion.div
        className="absolute bottom-4 right-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 0.6, 
          scale: 0.6,
          y: [0, 2, 0],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <img
          src={loserSprite}
          alt={isUserWinner ? "AI loses" : "You lose"}
          className="w-20 h-20 object-contain grayscale brightness-75"
        />
      </motion.div>

      {/* Victory message */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`px-6 py-3 rounded-2xl backdrop-blur-sm border shadow-2xl ${
          isUserWinner 
            ? "bg-primary/20 border-primary/50 text-primary" 
            : "bg-destructive/20 border-destructive/50 text-destructive"
        }`}>
          <p className="font-display font-bold text-lg text-center">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}
