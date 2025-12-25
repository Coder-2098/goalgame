/**
 * GameArena Component - Temple Run-style immersive game experience
 * Features continuous action animations, ambient audio, and subtle winner highlighting
 */

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThemeType,
  AvatarType,
  BACKGROUNDS,
  ACTION_SPRITES,
  AI_SPRITES,
  THEME_CONFIGS,
  isValidTheme,
  DEFAULT_THEME,
} from "@/config/game";
import { getGameStrategy, getEffectsStrategy } from "@/strategies/game";
import { VictoryDance } from "./VictoryDance";
import { ParallaxBackground } from "./ParallaxBackground";
import { ObstacleLayer } from "./ObstacleLayer";
import { SpeedLines } from "./SpeedLines";
import { ContinuousActionAvatar } from "./ContinuousActionAvatar";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";

interface GameArenaProps {
  theme: ThemeType;
  avatarType: AvatarType;
  userPoints: number;
  aiPoints: number;
  isActive?: boolean;
  isEndOfDay?: boolean;
  soundEnabled?: boolean;
}

export function GameArena({
  theme,
  avatarType,
  userPoints,
  aiPoints,
  isActive = true,
  isEndOfDay = false,
  soundEnabled = true,
}: GameArenaProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [effectIndex, setEffectIndex] = useState(0);
  const [prevGameState, setPrevGameState] = useState<string | null>(null);

  // Sound effects for events
  const { playSound } = useSoundEffects(soundEnabled);
  
  // Validate theme
  const validTheme: ThemeType = isValidTheme(theme) ? theme : DEFAULT_THEME;
  
  // Ambient background music
  const { isPlaying: isAmbientPlaying } = useAmbientAudio(validTheme, soundEnabled, isActive);

  // Get strategies
  const gameStrategy = useMemo(() => getGameStrategy(), []);
  const effectsStrategy = useMemo(() => getEffectsStrategy(), []);

  // Get assets and config
  const background = BACKGROUNDS[validTheme];
  const userSprite = ACTION_SPRITES[validTheme];
  const aiSprite = AI_SPRITES[validTheme];
  const config = THEME_CONFIGS[validTheme];

  // Calculate game state using strategy
  const gameState = gameStrategy.getGameState(userPoints, aiPoints, isEndOfDay);
  const statusMessage = gameStrategy.getStatusMessage(gameState, validTheme);

  // Score delta for position calculation
  const scoreDelta = userPoints - aiPoints;
  const userWinning = gameState === "userWinning" || gameState === "victory";
  const aiWinning = gameState === "aiWinning" || gameState === "defeat";
  const isVictoryState = gameState === "victory" || gameState === "defeat";

  // Play sound effects on state changes
  useEffect(() => {
    if (prevGameState === null) {
      setPrevGameState(gameState);
      return;
    }

    if (gameState !== prevGameState) {
      if (gameState === "victory") {
        playSound("victory");
      } else if (gameState === "defeat") {
        playSound("defeat");
      } else if (gameState === "userWinning" && prevGameState !== "userWinning") {
        playSound("userLead");
      } else if (gameState === "aiWinning" && prevGameState !== "aiWinning") {
        playSound("aiLead");
      }
      setPrevGameState(gameState);
    }
  }, [gameState, prevGameState, playSound]);

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

  // Determine speed intensity based on game state
  const speedIntensity = userWinning ? "high" : aiWinning ? "low" : "medium";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-border/30">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: `url(${background})` }}
      />

      {/* Parallax Scrolling Layers */}
      <ParallaxBackground
        theme={validTheme}
        speed={config.backgroundSpeed}
        isActive={isActive && !isVictoryState}
        userWinning={userWinning}
        aiWinning={aiWinning}
      />

      {/* Obstacles Layer */}
      <ObstacleLayer
        theme={validTheme}
        isActive={isActive && !isVictoryState}
        speed={config.characterSpeed}
        aiWinning={aiWinning}
      />

      {/* Speed Lines - on both sides for racing feel */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-5">
        <SpeedLines isActive={isActive && !isVictoryState} intensity={speedIntensity} position="left" />
      </div>
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-5">
        <SpeedLines isActive={isActive && !isVictoryState} intensity={speedIntensity} position="right" />
      </div>

      {/* Animated background overlay - subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

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
        {/* Status Bar - Simplified, no blocking popups */}
        <div className="flex justify-between items-start z-10">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30 shadow-lg">
            <p className="text-xs font-medium text-foreground/80">{config.messages.action}</p>
          </div>
          
          {/* Subtle status indicator - no red popups */}
          <motion.div
            className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30 shadow-lg"
            animate={{
              borderColor: userWinning 
                ? "hsl(var(--primary) / 0.5)" 
                : aiWinning 
                ? "hsl(var(--muted) / 0.5)" 
                : "hsl(var(--border) / 0.3)",
            }}
          >
            <p className="text-xs font-medium text-foreground/80">
              {statusMessage}
            </p>
          </motion.div>
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
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="bg-background/90 backdrop-blur-sm p-[2px] rounded-full border border-border/50">
                <div className="bg-background rounded-full px-3 py-1">
                  <span className="font-display font-bold text-sm text-foreground/70">
                    VS
                  </span>
                </div>
              </div>
            </motion.div>

            {/* User Character - Left Side with continuous action */}
            <div className="absolute left-4 md:left-12">
              <ContinuousActionAvatar
                theme={validTheme}
                sprite={userSprite}
                isUser={true}
                isWinning={userWinning}
                isLosing={aiWinning}
                isActive={isActive}
                scoreDelta={scoreDelta}
              />
            </div>

            {/* AI Character - Right Side with continuous action */}
            <div className="absolute right-4 md:right-12">
              <ContinuousActionAvatar
                theme={validTheme}
                sprite={aiSprite}
                isUser={false}
                isWinning={aiWinning}
                isLosing={userWinning}
                isActive={isActive}
                scoreDelta={-scoreDelta}
              />
            </div>
          </div>
        )}

        {/* Score Bar - Clean, minimal */}
        <div className="flex justify-between items-center bg-background/80 backdrop-blur-sm rounded-xl p-3 border border-border/30 z-10">
          {/* User Score */}
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-colors ${
                userWinning ? "border-primary" : "border-border/50"
              }`}
              animate={userWinning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <img src={userSprite} alt="You" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground">Your Score</p>
              <p className={`font-display font-bold text-lg ${
                userWinning ? "text-primary" : "text-foreground"
              }`}>
                {userPoints}
                <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
              </p>
            </div>
          </div>

          {/* Progress Bar - Visual race progress */}
          <div className="flex-1 mx-4 h-3 bg-muted/50 rounded-full overflow-hidden relative">
            {/* Track markers */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-px h-full bg-border/30" />
              ))}
            </div>
            <div className="h-full flex relative z-10">
              <motion.div
                className="bg-primary/80"
                initial={{ width: "50%" }}
                animate={{
                  width: `${Math.max(10, (userPoints / (userPoints + aiPoints || 1)) * 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="bg-muted-foreground/40"
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
              <p className={`font-display font-bold text-lg ${
                aiWinning ? "text-muted-foreground" : "text-foreground"
              }`}>
                {aiPoints}
                <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
              </p>
            </div>
            <motion.div
              className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-colors ${
                aiWinning ? "border-muted-foreground" : "border-border/50"
              }`}
              animate={aiWinning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <img src={aiSprite} alt="AI" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export types and assets for backward compatibility
export type { ThemeType, AvatarType };
export { BACKGROUNDS as backgrounds, AVATARS as avatars } from "@/config/game";
