/**
 * GameArena Component - Refactored with Strategy Pattern
 * Uses configuration from /config/game and strategies from /strategies/game
 * Features Temple Run-style continuous motion animations
 */

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThemeType,
  AvatarType,
  GameState,
  BACKGROUNDS,
  ACTION_SPRITES,
  AI_SPRITES,
  THEME_CONFIGS,
  isValidTheme,
  DEFAULT_THEME,
} from "@/config/game";
import { getGameStrategy, getEffectsStrategy } from "@/strategies/game";
import { VictoryDance } from "./VictoryDance";

// Theme-specific motion animation classes
const THEME_ANIMATIONS: Record<ThemeType, { user: string; ai: string }> = {
  forest: { user: "animate-running", ai: "animate-running" },
  coding: { user: "animate-coding", ai: "animate-coding" },
  ninja: { user: "animate-ninja", ai: "animate-fighting" },
  agent: { user: "animate-agent", ai: "animate-agent" },
};

interface GameArenaProps {
  theme: ThemeType;
  avatarType: AvatarType;
  userPoints: number;
  aiPoints: number;
  isActive?: boolean;
  isEndOfDay?: boolean;
}

export function GameArena({
  theme,
  avatarType,
  userPoints,
  aiPoints,
  isActive = true,
  isEndOfDay = false,
}: GameArenaProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [effectIndex, setEffectIndex] = useState(0);

  // Get strategies
  const gameStrategy = useMemo(() => getGameStrategy(), []);
  const effectsStrategy = useMemo(() => getEffectsStrategy(), []);

  // Validate theme
  const validTheme: ThemeType = isValidTheme(theme) ? theme : DEFAULT_THEME;

  // Get assets and config
  const background = BACKGROUNDS[validTheme];
  const userSprite = ACTION_SPRITES[validTheme];
  const aiSprite = AI_SPRITES[validTheme];
  const config = THEME_CONFIGS[validTheme];

  // Get motion animation classes for the theme
  const motionClasses = THEME_ANIMATIONS[validTheme];

  // Calculate game state using strategy
  const gameState = gameStrategy.getGameState(userPoints, aiPoints, isEndOfDay);
  const statusMessage = gameStrategy.getStatusMessage(gameState, validTheme);
  const userMovement = gameStrategy.calculateMovement(gameState, true);
  const aiMovement = gameStrategy.calculateMovement(gameState, false);

  // Show effects periodically
  useEffect(() => {
    if (!isActive && !isEndOfDay) return;

    const shouldContinuous = effectsStrategy.shouldShowContinuousEffects(gameState);
    const interval = shouldContinuous ? 400 : 2500;

    const timer = setInterval(() => {
      setShowEffect(true);
      setEffectIndex((prev) => prev + 1);
      setTimeout(() => setShowEffect(false), 800);
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, isEndOfDay, gameState, effectsStrategy]);

  const currentEffect = effectsStrategy.getEffect(validTheme, gameState, effectIndex);

  const isVictoryState = gameState === "victory" || gameState === "defeat";
  const userWinning = gameState === "userWinning" || gameState === "victory";
  const aiWinning = gameState === "aiWinning" || gameState === "defeat";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-border/30">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/* Animated background overlay based on theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/20" />

      {/* Victory/Defeat Overlay */}
      <AnimatePresence>
        {isVictoryState && (
          <VictoryDance
            winner={gameState === "victory" ? "user" : "ai"}
            theme={validTheme}
            userSprite={userSprite}
            aiSprite={aiSprite}
          />
        )}
      </AnimatePresence>

      {/* Game Content */}
      <div className="relative h-72 md:h-80 p-4 flex flex-col justify-between">
        {/* Status Bar */}
        <div className="flex justify-between items-start z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-primary/30 shadow-lg">
            <p className="text-xs font-medium text-primary">{config.messages.action}</p>
          </div>
          <div
            className={`backdrop-blur-sm rounded-lg px-3 py-1.5 border shadow-lg ${
              userWinning
                ? "bg-primary/20 border-primary/50"
                : aiWinning
                ? "bg-destructive/20 border-destructive/50"
                : "bg-background/90 border-border/30"
            }`}
          >
            <p
              className={`text-xs font-medium ${
                userWinning ? "text-primary" : aiWinning ? "text-destructive" : "text-foreground"
              }`}
            >
              {statusMessage}
            </p>
          </div>
        </div>

        {/* Battle Arena - Hide when victory state */}
        {!isVictoryState && (
          <div className="relative flex-1 flex items-center justify-center mt-2">
            {/* Effects Layer */}
            <AnimatePresence>
              {showEffect && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl z-20 pointer-events-none"
                >
                  {currentEffect}
                </motion.div>
              )}
            </AnimatePresence>

            {/* VS Badge */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="bg-gradient-to-r from-primary via-secondary to-destructive p-[2px] rounded-full">
                <div className="bg-background rounded-full px-3 py-1">
                  <span className="font-display font-bold text-sm bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
                    VS
                  </span>
                </div>
              </div>
            </motion.div>

            {/* User Character - Left Side with continuous motion */}
            <motion.div
              className="absolute left-4 md:left-12"
              animate={isActive ? { x: userMovement.x, y: userMovement.y } : {}}
              transition={{
                repeat: Infinity,
                duration: config.characterSpeed,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                {/* Ground shadow that animates with running */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 rounded-full blur-sm animate-ground-shadow" />
                )}
                {userWinning && (
                  <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
                )}
                <img
                  src={userSprite}
                  alt="You"
                  className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl ${
                    isActive ? motionClasses.user : "animate-idle"
                  } ${userWinning ? "brightness-110" : aiWinning ? "brightness-75" : ""}`}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                  YOU
                </div>
              </div>
            </motion.div>

            {/* AI Character - Right Side with continuous motion */}
            <motion.div
              className="absolute right-4 md:right-12"
              animate={isActive ? { x: aiMovement.x, y: aiMovement.y } : {}}
              transition={{
                repeat: Infinity,
                duration: config.characterSpeed,
                ease: "easeInOut",
                delay: 0.1,
              }}
            >
              <div className="relative">
                {/* Ground shadow that animates with running */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/30 rounded-full blur-sm animate-ground-shadow" />
                )}
                {aiWinning && (
                  <div className="absolute inset-0 bg-destructive/30 rounded-2xl blur-xl animate-pulse" />
                )}
                <img
                  src={aiSprite}
                  alt="AI"
                  className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl ${
                    isActive ? motionClasses.ai : "animate-idle"
                  } ${aiWinning ? "brightness-110" : userWinning ? "brightness-75" : ""}`}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                  AI
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Score Bar */}
        <div className="flex justify-between items-center bg-background/80 backdrop-blur-sm rounded-xl p-3 border border-border/30 z-10">
          {/* User Score */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${
                userWinning ? "border-primary shadow-lg shadow-primary/30" : "border-border"
              }`}
            >
              <img src={userSprite} alt="You" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Score</p>
              <p
                className={`font-display font-bold text-lg ${
                  userWinning ? "text-primary" : "text-foreground"
                }`}
              >
                {userPoints}
                <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 mx-4 h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full flex">
              <motion.div
                className="bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: "50%" }}
                animate={{
                  width: `${Math.max(10, (userPoints / (userPoints + aiPoints || 1)) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="bg-gradient-to-r from-destructive/60 to-destructive"
                initial={{ width: "50%" }}
                animate={{
                  width: `${Math.max(10, (aiPoints / (userPoints + aiPoints || 1)) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* AI Score */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">AI Score</p>
              <p
                className={`font-display font-bold text-lg ${
                  aiWinning ? "text-destructive" : "text-foreground"
                }`}
              >
                {aiPoints}
                <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${
                aiWinning ? "border-destructive shadow-lg shadow-destructive/30" : "border-border"
              }`}
            >
              <img src={aiSprite} alt="AI" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export types and assets for backward compatibility
export type { ThemeType, AvatarType };
export { BACKGROUNDS as backgrounds, AVATARS as avatars } from "@/config/game";
