/**
 * Core Game Types - Extensible type definitions for the game system
 * Contributors can extend these types to add new themes, avatars, and behaviors
 */

export type ThemeType = "forest" | "coding" | "ninja" | "agent";
export type AvatarType = "boy" | "girl" | "fighter" | "ninja" | "agent";
export type GameState = "active" | "userWinning" | "aiWinning" | "tied" | "endOfDay" | "victory" | "defeat";

export interface ThemeMessages {
  action: string;
  userWinText: string;
  aiWinText: string;
  tieText: string;
  victoryText: string;
  defeatText: string;
  endOfDayText: string;
}

export interface ThemeAnimations {
  userAnimation: string;
  aiAnimation: string;
  victoryAnimation: string;
  defeatAnimation: string;
}

export interface ThemeEffects {
  effects: string[];
  victoryEffects: string[];
  defeatEffects: string[];
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  messages: ThemeMessages;
  animations: ThemeAnimations;
  effects: ThemeEffects;
  backgroundSpeed: number;
  characterSpeed: number;
}

export interface AvatarConfig {
  id: AvatarType;
  name: string;
  description: string;
}

export interface GameResult {
  winner: "user" | "ai" | "tie";
  userPoints: number;
  aiPoints: number;
  message: string;
}
