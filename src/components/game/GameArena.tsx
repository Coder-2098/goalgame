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

const themeMessages: Record<ThemeType, { action: string; userWinText: string; aiWinText: string; tieText: string }> = {
  forest: {
    action: "Running through the forest...",
    userWinText: "You're sprinting ahead! 🏃‍♂️",
    aiWinText: "AI is gaining ground! 🤖",
    tieText: "Neck and neck! 🌲",
  },
  coding: {
    action: "Hacking the mainframe...",
    userWinText: "Code compiled successfully! 💻",
    aiWinText: "AI found a bug first! 🐛",
    tieText: "Both debugging... ⌨️",
  },
  ninja: {
    action: "Training in the dojo...",
    userWinText: "Swift strike! ⚔️",
    aiWinText: "AI countered! 🥷",
    tieText: "Blades clash! 🔥",
  },
  agent: {
    action: "Defusing the bomb...",
    userWinText: "Mission accomplished! 🎯",
    aiWinText: "AI cracked the code! ⏱️",
    tieText: "Both agents competing! 🕵️",
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
  const [userPosition, setUserPosition] = useState(30);
  const [aiPosition, setAiPosition] = useState(30);
  const [showObstacle, setShowObstacle] = useState(false);
  const [obstacleType, setObstacleType] = useState(0);

  const background = backgrounds[theme];
  const avatar = avatars[avatarType];
  const messages = themeMessages[theme];

  // Calculate positions based on points difference
  useEffect(() => {
    const total = userPoints + aiPoints || 1;
    const userRatio = userPoints / total;
    const aiRatio = aiPoints / total;
    
    // User position: more points = further right (ahead)
    setUserPosition(Math.min(85, Math.max(15, 30 + (userRatio - aiRatio) * 40)));
    setAiPosition(Math.min(85, Math.max(15, 30 + (aiRatio - userRatio) * 40)));
  }, [userPoints, aiPoints]);

  // Animate obstacles
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setShowObstacle(true);
      setObstacleType(Math.floor(Math.random() * 3));
      setTimeout(() => setShowObstacle(false), 1500);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  const getStatusMessage = () => {
    if (userPoints > aiPoints) return messages.userWinText;
    if (aiPoints > userPoints) return messages.aiWinText;
    return messages.tieText;
  };

  const getObstacle = () => {
    switch (theme) {
      case "forest":
        return ["🪨", "🌳", "🦎"][obstacleType];
      case "coding":
        return ["🐛", "💥", "⚠️"][obstacleType];
      case "ninja":
        return ["🔥", "💨", "⭐"][obstacleType];
      case "agent":
        return ["💣", "🔒", "📡"][obstacleType];
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
      
      {/* Overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      
      {/* Game Content */}
      <div className="relative h-48 md:h-64 p-4 flex flex-col justify-between">
        {/* Status Bar */}
        <div className="flex justify-between items-start">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30">
            <p className="text-xs font-medium text-primary">{messages.action}</p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30">
            <p className="text-xs font-medium text-foreground">{getStatusMessage()}</p>
          </div>
        </div>

        {/* Track/Arena */}
        <div className="relative h-24 mt-4">
          {/* Track Line */}
          <div className="absolute bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-destructive/50 rounded-full" />
          
          {/* Finish Line */}
          <div className="absolute bottom-4 right-4 text-2xl">🏁</div>
          
          {/* Obstacles */}
          <AnimatePresence>
            {showObstacle && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: "30%", opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute bottom-6 text-3xl"
              >
                {getObstacle()}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* User Character */}
          <motion.div
            className="absolute bottom-4 transform -translate-x-1/2"
            style={{ left: `${userPosition}%` }}
            animate={{ 
              y: isActive ? [0, -4, 0] : 0,
              left: `${userPosition}%`
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 0.5 },
              left: { duration: 0.5, ease: "easeOut" }
            }}
          >
            <div className="relative">
              <img 
                src={avatar} 
                alt="You" 
                className="w-14 h-14 rounded-full border-2 border-primary shadow-lg shadow-primary/30"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                YOU
              </div>
            </div>
          </motion.div>
          
          {/* AI Character */}
          <motion.div
            className="absolute bottom-4 transform -translate-x-1/2"
            style={{ left: `${aiPosition}%` }}
            animate={{ 
              y: isActive ? [0, -3, 0] : 0,
              left: `${aiPosition}%`
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 0.6, delay: 0.1 },
              left: { duration: 0.5, ease: "easeOut" }
            }}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-destructive to-destructive/60 flex items-center justify-center border-2 border-destructive shadow-lg shadow-destructive/30">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                AI
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Points Display */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src={avatar} alt="You" className="w-full h-full object-cover" />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground text-xs">Your Score</p>
              <p className="font-bold text-primary">{userPoints} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-right">
              <p className="text-muted-foreground text-xs">AI Score</p>
              <p className="font-bold text-destructive">{aiPoints} pts</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { backgrounds };
