/**
 * Intensity Configuration - Controls how game elements respond to intensity levels
 * This is the central place to tune the game's "feel"
 */

import { IntensityLevel } from "@/hooks/useGameLoop";

export interface IntensityConfig {
  // Animation speeds (multiplier)
  animationSpeed: number;
  
  // Audio parameters
  audioTempo: number; // BPM
  audioVolume: number; // 0-1
  audioFilterFreq: number; // Hz for low-pass filter
  
  // Visual parameters
  backgroundSpeed: number; // Parallax speed multiplier
  particleCount: number; // Number of effects
  glowIntensity: number; // Glow effect strength
  shakeIntensity: number; // Screen shake amount
  
  // Color adjustments
  saturationBoost: number; // 0-1
  contrastBoost: number; // 0-1
}

export const INTENSITY_CONFIGS: Record<IntensityLevel, IntensityConfig> = {
  low: {
    animationSpeed: 1,
    audioTempo: 100,
    audioVolume: 0.3,
    audioFilterFreq: 800,
    backgroundSpeed: 1,
    particleCount: 3,
    glowIntensity: 0.2,
    shakeIntensity: 0,
    saturationBoost: 0,
    contrastBoost: 0,
  },
  medium: {
    animationSpeed: 1.2,
    audioTempo: 120,
    audioVolume: 0.5,
    audioFilterFreq: 1200,
    backgroundSpeed: 1.3,
    particleCount: 5,
    glowIntensity: 0.4,
    shakeIntensity: 0.5,
    saturationBoost: 0.1,
    contrastBoost: 0.1,
  },
  high: {
    animationSpeed: 1.5,
    audioTempo: 140,
    audioVolume: 0.7,
    audioFilterFreq: 2000,
    backgroundSpeed: 1.8,
    particleCount: 8,
    glowIntensity: 0.6,
    shakeIntensity: 1,
    saturationBoost: 0.2,
    contrastBoost: 0.15,
  },
  critical: {
    animationSpeed: 2,
    audioTempo: 160,
    audioVolume: 0.9,
    audioFilterFreq: 3500,
    backgroundSpeed: 2.5,
    particleCount: 12,
    glowIntensity: 0.9,
    shakeIntensity: 2,
    saturationBoost: 0.3,
    contrastBoost: 0.25,
  },
};

// Get interpolated config based on continuous intensity value
export function getInterpolatedConfig(intensityValue: number): IntensityConfig {
  const levels: IntensityLevel[] = ["low", "medium", "high", "critical"];
  const thresholds = [0, 0.3, 0.5, 0.8, 1];
  
  // Find the two levels to interpolate between
  let lowerLevel: IntensityLevel = "low";
  let upperLevel: IntensityLevel = "low";
  let t = 0;
  
  for (let i = 0; i < levels.length; i++) {
    if (intensityValue >= thresholds[i] && intensityValue < thresholds[i + 1]) {
      lowerLevel = levels[i];
      upperLevel = levels[Math.min(i + 1, levels.length - 1)];
      t = (intensityValue - thresholds[i]) / (thresholds[i + 1] - thresholds[i]);
      break;
    }
  }
  
  const lower = INTENSITY_CONFIGS[lowerLevel];
  const upper = INTENSITY_CONFIGS[upperLevel];
  
  // Interpolate all values
  return {
    animationSpeed: lower.animationSpeed + (upper.animationSpeed - lower.animationSpeed) * t,
    audioTempo: lower.audioTempo + (upper.audioTempo - lower.audioTempo) * t,
    audioVolume: lower.audioVolume + (upper.audioVolume - lower.audioVolume) * t,
    audioFilterFreq: lower.audioFilterFreq + (upper.audioFilterFreq - lower.audioFilterFreq) * t,
    backgroundSpeed: lower.backgroundSpeed + (upper.backgroundSpeed - lower.backgroundSpeed) * t,
    particleCount: Math.round(lower.particleCount + (upper.particleCount - lower.particleCount) * t),
    glowIntensity: lower.glowIntensity + (upper.glowIntensity - lower.glowIntensity) * t,
    shakeIntensity: lower.shakeIntensity + (upper.shakeIntensity - lower.shakeIntensity) * t,
    saturationBoost: lower.saturationBoost + (upper.saturationBoost - lower.saturationBoost) * t,
    contrastBoost: lower.contrastBoost + (upper.contrastBoost - lower.contrastBoost) * t,
  };
}
