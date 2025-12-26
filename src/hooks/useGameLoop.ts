/**
 * useGameLoop - Real-time game state management hook
 * Manages continuous game state, EOD countdown, and intensity levels
 * This is the heartbeat of the game - never stops running
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { GameState } from "@/config/game/types";

export type IntensityLevel = "low" | "medium" | "high" | "critical";

export interface GameLoopState {
  // Time-based state
  timeToEOD: number; // milliseconds until end of day
  eodProgress: number; // 0-1 progress through the day
  formattedTimeToEOD: string; // "2h 30m" format
  
  // Intensity state (drives animations/audio)
  intensity: IntensityLevel;
  intensityValue: number; // 0-1 continuous value
  
  // Game momentum
  momentum: "user" | "ai" | "neutral";
  momentumStrength: number; // 0-1 how strong the momentum is
  
  // Pulse timing for synchronized animations
  pulse: number; // 0-1 value that oscillates
  beatCount: number; // Increments every beat
  
  // Threat level (combination of time + score)
  threatLevel: number; // 0-1 overall threat
}

interface UseGameLoopProps {
  userPoints: number;
  aiPoints: number;
  dayEndTime: string; // "23:00" format
  timezone?: string;
  isActive: boolean;
}

// Calculate milliseconds until EOD
function calculateTimeToEOD(dayEndTime: string, timezone?: string): number {
  const now = new Date();
  const [hours, minutes] = dayEndTime.split(":").map(Number);
  
  const eod = new Date();
  eod.setHours(hours, minutes, 0, 0);
  
  // If EOD has passed, it's for tomorrow
  if (eod.getTime() <= now.getTime()) {
    eod.setDate(eod.getDate() + 1);
  }
  
  return Math.max(0, eod.getTime() - now.getTime());
}

// Format time remaining
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0m";
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Calculate intensity based on time and score
function calculateIntensity(
  timeToEOD: number,
  userPoints: number,
  aiPoints: number
): { level: IntensityLevel; value: number } {
  const hoursLeft = timeToEOD / (1000 * 60 * 60);
  const scoreDiff = userPoints - aiPoints;
  
  // Time-based intensity (0-1)
  let timeIntensity = 0;
  if (hoursLeft < 0.25) timeIntensity = 1; // Last 15 minutes
  else if (hoursLeft < 0.5) timeIntensity = 0.8; // Last 30 minutes
  else if (hoursLeft < 1) timeIntensity = 0.6; // Last hour
  else if (hoursLeft < 2) timeIntensity = 0.4; // Last 2 hours
  else timeIntensity = 0.2;
  
  // Score-based intensity (losing increases intensity)
  let scoreIntensity = 0;
  if (scoreDiff < -20) scoreIntensity = 0.8;
  else if (scoreDiff < -10) scoreIntensity = 0.5;
  else if (scoreDiff < 0) scoreIntensity = 0.3;
  else scoreIntensity = 0.1;
  
  // Combined intensity (weighted)
  const value = Math.min(1, timeIntensity * 0.6 + scoreIntensity * 0.4);
  
  // Map to discrete levels
  let level: IntensityLevel;
  if (value >= 0.8) level = "critical";
  else if (value >= 0.5) level = "high";
  else if (value >= 0.3) level = "medium";
  else level = "low";
  
  return { level, value };
}

export function useGameLoop({
  userPoints,
  aiPoints,
  dayEndTime,
  timezone,
  isActive,
}: UseGameLoopProps): GameLoopState {
  const [timeToEOD, setTimeToEOD] = useState(() => 
    calculateTimeToEOD(dayEndTime, timezone)
  );
  const [pulse, setPulse] = useState(0);
  const [beatCount, setBeatCount] = useState(0);
  
  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setTimeToEOD(calculateTimeToEOD(dayEndTime, timezone));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [dayEndTime, timezone]);
  
  // Pulse animation - continuous oscillation
  useEffect(() => {
    if (!isActive) return;
    
    let animationFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const { value: intensityValue } = calculateIntensity(timeToEOD, userPoints, aiPoints);
      
      // Faster pulse at higher intensity (400ms to 150ms cycle)
      const cycleDuration = 400 - intensityValue * 250;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      
      // Smooth sine wave
      setPulse(Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, timeToEOD, userPoints, aiPoints]);
  
  // Beat counter - for synchronized animations
  useEffect(() => {
    if (!isActive) return;
    
    const { value: intensityValue } = calculateIntensity(timeToEOD, userPoints, aiPoints);
    // Beat interval: 1000ms at low intensity, 300ms at critical
    const beatInterval = 1000 - intensityValue * 700;
    
    const interval = setInterval(() => {
      setBeatCount(prev => prev + 1);
    }, beatInterval);
    
    return () => clearInterval(interval);
  }, [isActive, timeToEOD, userPoints, aiPoints]);
  
  // Calculate derived state
  const gameLoopState = useMemo((): GameLoopState => {
    const { level: intensity, value: intensityValue } = calculateIntensity(
      timeToEOD,
      userPoints,
      aiPoints
    );
    
    // Momentum calculation
    const scoreDiff = userPoints - aiPoints;
    let momentum: "user" | "ai" | "neutral";
    let momentumStrength: number;
    
    if (scoreDiff > 5) {
      momentum = "user";
      momentumStrength = Math.min(1, scoreDiff / 30);
    } else if (scoreDiff < -5) {
      momentum = "ai";
      momentumStrength = Math.min(1, Math.abs(scoreDiff) / 30);
    } else {
      momentum = "neutral";
      momentumStrength = 0;
    }
    
    // EOD progress (0 = start of day, 1 = end of day)
    const totalDayMs = 24 * 60 * 60 * 1000;
    const eodProgress = 1 - (timeToEOD / totalDayMs);
    
    // Threat level combines time + losing score
    const timeTheat = 1 - (timeToEOD / (24 * 60 * 60 * 1000));
    const scoreTheat = scoreDiff < 0 ? Math.min(1, Math.abs(scoreDiff) / 50) : 0;
    const threatLevel = Math.min(1, timeTheat * 0.5 + scoreTheat * 0.5);
    
    return {
      timeToEOD,
      eodProgress,
      formattedTimeToEOD: formatTimeRemaining(timeToEOD),
      intensity,
      intensityValue,
      momentum,
      momentumStrength,
      pulse,
      beatCount,
      threatLevel,
    };
  }, [timeToEOD, userPoints, aiPoints, pulse, beatCount]);
  
  return gameLoopState;
}
