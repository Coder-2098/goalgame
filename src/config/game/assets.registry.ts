/**
 * Asset Registry - Central place to register all game assets
 * Contributors add their assets here after placing files in assets folder
 */

// Background imports
import bgForest from "@/assets/bg-forest.jpg";
import bgCoding from "@/assets/bg-coding.jpg";
import bgNinja from "@/assets/bg-ninja.jpg";
import bgAgent from "@/assets/bg-agent.jpg";

// Avatar imports
import avatarBoy from "@/assets/avatar-boy.png";
import avatarGirl from "@/assets/avatar-girl.png";
import avatarFighter from "@/assets/avatar-fighter.png";
import avatarNinja from "@/assets/avatar-ninja.png";
import avatarAgent from "@/assets/avatar-agent.png";

// Action sprite imports
import actionRunning from "@/assets/action-running.png";
import actionCoding from "@/assets/action-coding.png";
import actionNinja from "@/assets/action-ninja.png";
import actionAgent from "@/assets/action-agent.png";

// AI sprite imports
import aiRunning from "@/assets/action-ai-running.png";
import aiCoding from "@/assets/action-ai-coding.png";
import aiNinja from "@/assets/action-ai-ninja.png";
import aiAgent from "@/assets/action-ai-agent.png";

import { ThemeType, AvatarType } from "./types";

/**
 * Background assets by theme
 */
export const BACKGROUNDS: Record<ThemeType, string> = {
  forest: bgForest,
  coding: bgCoding,
  ninja: bgNinja,
  agent: bgAgent,
};

/**
 * Avatar assets by type
 */
export const AVATARS: Record<AvatarType, string> = {
  boy: avatarBoy,
  girl: avatarGirl,
  fighter: avatarFighter,
  ninja: avatarNinja,
  agent: avatarAgent,
};

/**
 * User action sprites by theme
 */
export const ACTION_SPRITES: Record<ThemeType, string> = {
  forest: actionRunning,
  coding: actionCoding,
  ninja: actionNinja,
  agent: actionAgent,
};

/**
 * AI action sprites by theme
 */
export const AI_SPRITES: Record<ThemeType, string> = {
  forest: aiRunning,
  coding: aiCoding,
  ninja: aiNinja,
  agent: aiAgent,
};

/**
 * Helper to check if a theme is valid
 */
export function isValidTheme(theme: string): theme is ThemeType {
  return theme in BACKGROUNDS;
}

/**
 * Helper to check if an avatar is valid
 */
export function isValidAvatar(avatar: string): avatar is AvatarType {
  return avatar in AVATARS;
}
