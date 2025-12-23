/**
 * Game Strategy Pattern - Base interface and implementations
 * Contributors can create new strategies by implementing IGameStrategy
 */

import { GameState, ThemeType, GameResult } from "@/config/game/types";
import { THEME_CONFIGS } from "@/config/game/themes.config";

/**
 * Strategy interface - implement this to create new game behaviors
 */
export interface IGameStrategy {
  getGameState(userPoints: number, aiPoints: number, isEndOfDay: boolean): GameState;
  getStatusMessage(state: GameState, theme: ThemeType): string;
  getAnimationClass(state: GameState, theme: ThemeType, isUser: boolean): string;
  calculateMovement(state: GameState, isUser: boolean): { x: number[]; y: number[] };
}

/**
 * Default game strategy implementation
 */
export class DefaultGameStrategy implements IGameStrategy {
  getGameState(userPoints: number, aiPoints: number, isEndOfDay: boolean): GameState {
    if (isEndOfDay) {
      if (userPoints > aiPoints) return "victory";
      if (aiPoints > userPoints) return "defeat";
      return "endOfDay";
    }
    
    if (userPoints > aiPoints) return "userWinning";
    if (aiPoints > userPoints) return "aiWinning";
    return "tied";
  }

  getStatusMessage(state: GameState, theme: ThemeType): string {
    const config = THEME_CONFIGS[theme];
    const messages = config.messages;

    switch (state) {
      case "victory":
        return messages.victoryText;
      case "defeat":
        return messages.defeatText;
      case "endOfDay":
        return messages.endOfDayText;
      case "userWinning":
        return messages.userWinText;
      case "aiWinning":
        return messages.aiWinText;
      case "tied":
      default:
        return messages.tieText;
    }
  }

  getAnimationClass(state: GameState, theme: ThemeType, isUser: boolean): string {
    const config = THEME_CONFIGS[theme];
    const animations = config.animations;

    if (state === "victory" && isUser) {
      return animations.victoryAnimation;
    }
    if (state === "defeat" && !isUser) {
      return animations.victoryAnimation;
    }
    if (state === "defeat" && isUser) {
      return animations.defeatAnimation;
    }
    if (state === "victory" && !isUser) {
      return animations.defeatAnimation;
    }

    return isUser ? animations.userAnimation : animations.aiAnimation;
  }

  calculateMovement(state: GameState, isUser: boolean): { x: number[]; y: number[] } {
    const baseMovement = { x: [0, 5, 0], y: [0, -5, 0] };
    
    if (state === "victory") {
      return isUser 
        ? { x: [0, 0, 0], y: [0, -20, 0, -15, 0, -10, 0] } // Victory jump
        : { x: [0, -10, 0], y: [0, 5, 0] }; // Defeat slump
    }
    
    if (state === "defeat") {
      return isUser 
        ? { x: [0, -10, 0], y: [0, 5, 0] } // Defeat slump
        : { x: [0, 0, 0], y: [0, -20, 0, -15, 0, -10, 0] }; // Victory jump
    }

    if (state === "userWinning") {
      return isUser 
        ? { x: [0, 15, 0], y: [0, -8, 0] }
        : { x: [5, 0, 5], y: [0, -4, 0] };
    }

    if (state === "aiWinning") {
      return isUser 
        ? { x: [0, -5, 0], y: [0, -4, 0] }
        : { x: [-15, 0, -15], y: [0, -8, 0] };
    }

    return baseMovement;
  }
}

/**
 * Factory to get strategy instance
 */
export function getGameStrategy(): IGameStrategy {
  return new DefaultGameStrategy();
}
