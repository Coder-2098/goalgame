/**
 * Avatar Configurations - Extensible avatar definitions
 * To add a new avatar:
 * 1. Add the avatar type to types.ts
 * 2. Add configuration here
 * 3. Add avatar image to assets folder
 * 4. Register in registry.ts
 */

import { AvatarConfig, AvatarType } from "./types";

export const AVATAR_CONFIGS: Record<AvatarType, AvatarConfig> = {
  boy: {
    id: "boy",
    name: "Boy",
    description: "A brave young hero",
  },
  girl: {
    id: "girl",
    name: "Girl",
    description: "A fierce young warrior",
  },
  fighter: {
    id: "fighter",
    name: "Fighter",
    description: "A skilled martial artist",
  },
  ninja: {
    id: "ninja",
    name: "Ninja",
    description: "A stealthy shadow warrior",
  },
  agent: {
    id: "agent",
    name: "Agent",
    description: "A suave secret agent",
  },
};

export const DEFAULT_AVATAR: AvatarType = "boy";
