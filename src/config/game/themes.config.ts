/**
 * Theme Configurations - Extensible theme definitions
 * To add a new theme:
 * 1. Add the theme type to types.ts
 * 2. Add configuration here
 * 3. Add assets to assets folder
 * 4. Register in registry.ts
 */

import { ThemeConfig, ThemeType } from "./types";

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  forest: {
    id: "forest",
    name: "Forest Run",
    description: "Race through the enchanted forest",
    messages: {
      action: "Running through the forest...",
      userWinText: "You're sprinting ahead! 🏃‍♂️",
      aiWinText: "AI is gaining ground! 🤖",
      tieText: "Neck and neck! 🌲",
      victoryText: "You reached the finish line! 🏆",
      defeatText: "AI crossed first... 😔",
      endOfDayText: "Day complete! Final stretch...",
    },
    animations: {
      userAnimation: "animate-run",
      aiAnimation: "animate-run",
      victoryAnimation: "animate-victory-dance",
      defeatAnimation: "animate-defeat",
    },
    effects: {
      effects: ["🍃", "🌿", "💨"],
      victoryEffects: ["🎉", "🏆", "⭐", "✨"],
      defeatEffects: ["😢", "💔", "🌧️"],
    },
    backgroundSpeed: 0.4,
    characterSpeed: 0.4,
  },
  coding: {
    id: "coding",
    name: "Code Battle",
    description: "Hack through the digital realm",
    messages: {
      action: "Hacking the mainframe...",
      userWinText: "Code compiled successfully! 💻",
      aiWinText: "AI found a bug first! 🐛",
      tieText: "Both debugging... ⌨️",
      victoryText: "System hacked! Victory! 🎮",
      defeatText: "AI breached the firewall... 🔥",
      endOfDayText: "Final commit incoming...",
    },
    animations: {
      userAnimation: "animate-type",
      aiAnimation: "animate-type",
      victoryAnimation: "animate-victory-code",
      defeatAnimation: "animate-glitch",
    },
    effects: {
      effects: ["⚡", "💻", "🔥"],
      victoryEffects: ["🎊", "💯", "🚀", "✅"],
      defeatEffects: ["❌", "🐛", "💥"],
    },
    backgroundSpeed: 0.8,
    characterSpeed: 0.8,
  },
  ninja: {
    id: "ninja",
    name: "Ninja Duel",
    description: "Master the art of combat",
    messages: {
      action: "Training in the dojo...",
      userWinText: "Swift strike! ⚔️",
      aiWinText: "AI countered! 🥷",
      tieText: "Blades clash! 🔥",
      victoryText: "Sensei would be proud! 🏯",
      defeatText: "The shadow prevails... 🌑",
      endOfDayText: "The final battle approaches...",
    },
    animations: {
      userAnimation: "animate-fight",
      aiAnimation: "animate-fight",
      victoryAnimation: "animate-victory-bow",
      defeatAnimation: "animate-fall",
    },
    effects: {
      effects: ["⚔️", "💥", "✨"],
      victoryEffects: ["🎌", "🏆", "🔥", "⭐"],
      defeatEffects: ["💀", "🩸", "🌑"],
    },
    backgroundSpeed: 0.3,
    characterSpeed: 0.3,
  },
  agent: {
    id: "agent",
    name: "Agent 007",
    description: "Defuse the bomb before time runs out",
    messages: {
      action: "Defusing the bomb...",
      userWinText: "Mission accomplished! 🎯",
      aiWinText: "AI cracked the code! ⏱️",
      tieText: "Both agents competing! 🕵️",
      victoryText: "World saved! Shaken, not stirred. 🍸",
      defeatText: "Mission failed... 💣",
      endOfDayText: "10 seconds remaining...",
    },
    animations: {
      userAnimation: "animate-aim",
      aiAnimation: "animate-aim",
      victoryAnimation: "animate-victory-salute",
      defeatAnimation: "animate-explosion",
    },
    effects: {
      effects: ["💣", "🔫", "💨"],
      victoryEffects: ["🍸", "🎖️", "🔥", "💎"],
      defeatEffects: ["💥", "💣", "☠️"],
    },
    backgroundSpeed: 0.6,
    characterSpeed: 0.6,
  },
};

export const DEFAULT_THEME: ThemeType = "forest";
