import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import backgrounds
import bgForest from "@/assets/bg-forest.jpg";
import bgCoding from "@/assets/bg-coding.jpg";
import bgNinja from "@/assets/bg-ninja.jpg";
import bgAgent from "@/assets/bg-agent.jpg";

// Import avatars
import avatarBoy from "@/assets/avatar-boy.png";
import avatarGirl from "@/assets/avatar-girl.png";
import avatarFighter from "@/assets/avatar-fighter.png";
import avatarNinja from "@/assets/avatar-ninja.png";
import avatarAgent from "@/assets/avatar-agent.png";

// Import action sprites
import actionRunning from "@/assets/action-running.png";
import actionCoding from "@/assets/action-coding.png";
import actionNinja from "@/assets/action-ninja.png";
import actionAgentSprite from "@/assets/action-agent.png";

// Import AI action sprites
import aiRunning from "@/assets/action-ai-running.png";
import aiCoding from "@/assets/action-ai-coding.png";
import aiNinja from "@/assets/action-ai-ninja.png";
import aiAgent from "@/assets/action-ai-agent.png";

export type ThemeType = "forest" | "coding" | "ninja" | "agent";
export type AvatarType = "boy" | "girl" | "fighter" | "ninja" | "agent";

const backgrounds: Record<ThemeType, string> = {
  forest: bgForest,
  coding: bgCoding,
  ninja: bgNinja,
  agent: bgAgent,
};

export const avatars: Record<AvatarType, string> = {
  boy: avatarBoy,
  girl: avatarGirl,
  fighter: avatarFighter,
  ninja: avatarNinja,
  agent: avatarAgent,
};

const actionSprites: Record<ThemeType, string> = {
  forest: actionRunning,
  coding: actionCoding,
  ninja: actionNinja,
  agent: actionAgentSprite,
};

const aiSprites: Record<ThemeType, string> = {
  forest: aiRunning,
  coding: aiCoding,
  ninja: aiNinja,
  agent: aiAgent,
};

const themeConfig: Record<ThemeType, { 
  action: string; 
  userWinText: string; 
  aiWinText: string; 
  tieText: string;
  userAnimation: string;
  aiAnimation: string;
}> = {
  forest: {
    action: "Running through the forest...",
    userWinText: "You're sprinting ahead! 🏃‍♂️",
    aiWinText: "AI is gaining ground! 🤖",
    tieText: "Neck and neck! 🌲",
    userAnimation: "animate-run",
    aiAnimation: "animate-run",
  },
  coding: {
    action: "Hacking the mainframe...",
    userWinText: "Code compiled successfully! 💻",
    aiWinText: "AI found a bug first! 🐛",
    tieText: "Both debugging... ⌨️",
    userAnimation: "animate-type",
    aiAnimation: "animate-type",
  },
  ninja: {
    action: "Training in the dojo...",
    userWinText: "Swift strike! ⚔️",
    aiWinText: "AI countered! 🥷",
    tieText: "Blades clash! 🔥",
    userAnimation: "animate-fight",
    aiAnimation: "animate-fight",
  },
  agent: {
    action: "Defusing the bomb...",
    userWinText: "Mission accomplished! 🎯",
    aiWinText: "AI cracked the code! ⏱️",
    tieText: "Both agents competing! 🕵️",
    userAnimation: "animate-aim",
    aiAnimation: "animate-aim",
  },
};

interface GameArenaProps {
  theme: ThemeType;
  avatarType: AvatarType;
  userPoints: number;
  aiPoints: number;
  isActive?: boolean;
}

export function GameArena({ theme, avatarType, userPoints, aiPoints, isActive = true }: GameArenaProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [effectType, setEffectType] = useState(0);

  // Fallback to 'forest' if theme is invalid
  const validTheme: ThemeType = (theme in backgrounds) ? theme : "forest";

  const background = backgrounds[validTheme];
  const userSprite = actionSprites[validTheme];
  const aiSprite = aiSprites[validTheme];
  const config = themeConfig[validTheme];

  // Calculate who's winning
  const userWinning = userPoints > aiPoints;
  const aiWinning = aiPoints > userPoints;
  const tied = userPoints === aiPoints;

  // Show effects periodically
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setShowEffect(true);
      setEffectType(Math.floor(Math.random() * 3));
      setTimeout(() => setShowEffect(false), 800);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isActive]);

  const getStatusMessage = () => {
    if (userWinning) return config.userWinText;
    if (aiWinning) return config.aiWinText;
    return config.tieText;
  };

  const getEffects = () => {
    switch (validTheme) {
      case "forest":
        return ["🍃", "🌿", "💨"][effectType];
      case "coding":
        return ["⚡", "💻", "🔥"][effectType];
      case "ninja":
        return ["⚔️", "💥", "✨"][effectType];
      case "agent":
        return ["💣", "🔫", "💨"][effectType];
      default:
        return "⚡";
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-border/30">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      
      {/* Animated background overlay based on theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/20" />
      
      {/* Game Content */}
      <div className="relative h-72 md:h-80 p-4 flex flex-col justify-between">
        {/* Status Bar */}
        <div className="flex justify-between items-start z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-primary/30 shadow-lg">
            <p className="text-xs font-medium text-primary">{config.action}</p>
          </div>
          <div className={`backdrop-blur-sm rounded-lg px-3 py-1.5 border shadow-lg ${
            userWinning ? "bg-primary/20 border-primary/50" : 
            aiWinning ? "bg-destructive/20 border-destructive/50" : 
            "bg-background/90 border-border/30"
          }`}>
            <p className={`text-xs font-medium ${
              userWinning ? "text-primary" : aiWinning ? "text-destructive" : "text-foreground"
            }`}>{getStatusMessage()}</p>
          </div>
        </div>

        {/* Battle Arena */}
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
                {getEffects()}
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

          {/* User Character - Left Side */}
          <motion.div
            className="absolute left-4 md:left-12"
            animate={isActive ? {
              x: userWinning ? [0, 15, 0] : aiWinning ? [0, -5, 0] : [0, 5, 0],
              y: validTheme === "forest" ? [0, -8, 0] : validTheme === "ninja" ? [0, -12, 0] : [0, -2, 0],
            } : {}}
            transition={{ 
              repeat: Infinity, 
              duration: validTheme === "forest" ? 0.4 : validTheme === "ninja" ? 0.3 : 0.8,
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              {/* Glow effect when winning */}
              {userWinning && (
                <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
              )}
              <img 
                src={userSprite} 
                alt="You" 
                className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl ${
                  userWinning ? "brightness-110" : aiWinning ? "brightness-75" : ""
                }`}
              />
              {/* Player Label */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                YOU
              </div>
            </div>
          </motion.div>

          {/* AI Character - Right Side */}
          <motion.div
            className="absolute right-4 md:right-12"
            animate={isActive ? {
              x: aiWinning ? [-15, 0, -15] : userWinning ? [5, 0, 5] : [-5, 0, -5],
              y: validTheme === "forest" ? [0, -8, 0] : validTheme === "ninja" ? [0, -12, 0] : [0, -2, 0],
            } : {}}
            transition={{ 
              repeat: Infinity, 
              duration: validTheme === "forest" ? 0.4 : validTheme === "ninja" ? 0.3 : 0.8,
              ease: "easeInOut",
              delay: 0.1
            }}
          >
            <div className="relative">
              {/* Glow effect when winning */}
              {aiWinning && (
                <div className="absolute inset-0 bg-destructive/30 rounded-2xl blur-xl animate-pulse" />
              )}
              <img 
                src={aiSprite} 
                alt="AI" 
                className={`w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl ${
                  aiWinning ? "brightness-110" : userWinning ? "brightness-75" : ""
                }`}
              />
              {/* AI Label */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
                AI
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Score Bar */}
        <div className="flex justify-between items-center bg-background/80 backdrop-blur-sm rounded-xl p-3 border border-border/30">
          {/* User Score */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${userWinning ? "border-primary shadow-lg shadow-primary/30" : "border-border"}`}>
              <img src={userSprite} alt="You" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Score</p>
              <p className={`font-display font-bold text-lg ${userWinning ? "text-primary" : "text-foreground"}`}>
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
                  width: `${Math.max(10, (userPoints / (userPoints + aiPoints || 1)) * 100)}%` 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div 
                className="bg-gradient-to-r from-destructive/60 to-destructive"
                initial={{ width: "50%" }}
                animate={{ 
                  width: `${Math.max(10, (aiPoints / (userPoints + aiPoints || 1)) * 100)}%` 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* AI Score */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">AI Score</p>
              <p className={`font-display font-bold text-lg ${aiWinning ? "text-destructive" : "text-foreground"}`}>
                {aiPoints}
                <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl overflow-hidden border-2 ${aiWinning ? "border-destructive shadow-lg shadow-destructive/30" : "border-border"}`}>
              <img src={aiSprite} alt="AI" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { backgrounds };
