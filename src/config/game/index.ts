/**
 * Game Configuration Index - Public API for game config
 * Import from this file for clean access to all configs
 */

// Types
export * from "./types";

// Configurations
export { THEME_CONFIGS, DEFAULT_THEME } from "./themes.config";
export { AVATAR_CONFIGS, DEFAULT_AVATAR } from "./avatars.config";
export { SCORING_CONFIG } from "./scoring.config";

// Asset Registry
export {
  BACKGROUNDS,
  AVATARS,
  ACTION_SPRITES,
  AI_SPRITES,
  isValidTheme,
  isValidAvatar,
} from "./assets.registry";
