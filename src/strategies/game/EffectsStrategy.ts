/**
 * Effects Strategy - Handles visual effects based on game state
 */

import { GameState, ThemeType } from "@/config/game/types";
import { THEME_CONFIGS } from "@/config/game/themes.config";

export interface IEffectsStrategy {
  getEffect(theme: ThemeType, state: GameState, index: number): string;
  getEffectCount(state: GameState): number;
  shouldShowContinuousEffects(state: GameState): boolean;
}

export class DefaultEffectsStrategy implements IEffectsStrategy {
  getEffect(theme: ThemeType, state: GameState, index: number): string {
    const config = THEME_CONFIGS[theme];
    const effects = config.effects;

    if (state === "victory") {
      return effects.victoryEffects[index % effects.victoryEffects.length];
    }
    if (state === "defeat") {
      return effects.defeatEffects[index % effects.defeatEffects.length];
    }
    
    return effects.effects[index % effects.effects.length];
  }

  getEffectCount(state: GameState): number {
    if (state === "victory" || state === "defeat") {
      return 8; // More effects for end states
    }
    return 3;
  }

  shouldShowContinuousEffects(state: GameState): boolean {
    return state === "victory" || state === "defeat" || state === "endOfDay";
  }
}

export function getEffectsStrategy(): IEffectsStrategy {
  return new DefaultEffectsStrategy();
}
