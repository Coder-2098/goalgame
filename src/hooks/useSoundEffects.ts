/**
 * Sound Effects Hook - Web Audio API based sound system
 * Generates and plays procedural game sounds
 */

import { useCallback, useEffect, useRef, useState } from "react";

type SoundType = 
  | "goalCreate" 
  | "goalComplete" 
  | "goalMissed" 
  | "aiPoints" 
  | "userLead" 
  | "aiLead" 
  | "victory" 
  | "defeat"
  | "streak"
  | "streakLost"
  | "footsteps"
  | "dodge";

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  frequencyEnd?: number;
  modulation?: { frequency: number; depth: number };
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig | SoundConfig[]> = {
  goalCreate: {
    frequency: 523.25, // C5
    duration: 0.15,
    type: "sine",
    volume: 0.3,
    frequencyEnd: 659.25, // E5
  },
  goalComplete: [
    { frequency: 523.25, duration: 0.1, type: "sine", volume: 0.4 },
    { frequency: 659.25, duration: 0.1, type: "sine", volume: 0.4 },
    { frequency: 783.99, duration: 0.2, type: "sine", volume: 0.5 },
  ],
  goalMissed: {
    frequency: 200,
    duration: 0.4,
    type: "sawtooth",
    volume: 0.3,
    frequencyEnd: 100,
  },
  aiPoints: {
    frequency: 150,
    duration: 0.3,
    type: "square",
    volume: 0.2,
    modulation: { frequency: 10, depth: 20 },
  },
  userLead: [
    { frequency: 440, duration: 0.1, type: "sine", volume: 0.3 },
    { frequency: 554.37, duration: 0.1, type: "sine", volume: 0.3 },
    { frequency: 659.25, duration: 0.15, type: "sine", volume: 0.4 },
  ],
  aiLead: {
    frequency: 300,
    duration: 0.25,
    type: "triangle",
    volume: 0.25,
    frequencyEnd: 200,
  },
  victory: [
    { frequency: 523.25, duration: 0.15, type: "sine", volume: 0.4 },
    { frequency: 659.25, duration: 0.15, type: "sine", volume: 0.4 },
    { frequency: 783.99, duration: 0.15, type: "sine", volume: 0.4 },
    { frequency: 1046.5, duration: 0.4, type: "sine", volume: 0.5 },
  ],
  defeat: [
    { frequency: 400, duration: 0.2, type: "sawtooth", volume: 0.3 },
    { frequency: 300, duration: 0.2, type: "sawtooth", volume: 0.3 },
    { frequency: 200, duration: 0.4, type: "sawtooth", volume: 0.25 },
  ],
  streak: [
    { frequency: 600, duration: 0.1, type: "sine", volume: 0.3 },
    { frequency: 800, duration: 0.1, type: "sine", volume: 0.4 },
    { frequency: 1000, duration: 0.2, type: "sine", volume: 0.5 },
  ],
  streakLost: {
    frequency: 400,
    duration: 0.5,
    type: "sawtooth",
    volume: 0.3,
    frequencyEnd: 100,
    modulation: { frequency: 5, depth: 50 },
  },
  footsteps: {
    frequency: 80,
    duration: 0.08,
    type: "triangle",
    volume: 0.15,
  },
  dodge: {
    frequency: 800,
    duration: 0.1,
    type: "sine",
    volume: 0.2,
    frequencyEnd: 1200,
  },
};

export function useSoundEffects(enabled: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio context on user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      setIsReady(true);
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Resume audio context on user interaction
  useEffect(() => {
    const handleInteraction = () => initAudio();
    
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [initAudio]);

  const playNote = useCallback((config: SoundConfig, startTime: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || !enabled) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, startTime);
    
    if (config.frequencyEnd) {
      oscillator.frequency.linearRampToValueAtTime(config.frequencyEnd, startTime + config.duration);
    }

    // Add modulation for certain sounds
    if (config.modulation) {
      const modulator = ctx.createOscillator();
      const modulatorGain = ctx.createGain();
      
      modulator.frequency.setValueAtTime(config.modulation.frequency, startTime);
      modulatorGain.gain.setValueAtTime(config.modulation.depth, startTime);
      
      modulator.connect(modulatorGain);
      modulatorGain.connect(oscillator.frequency);
      modulator.start(startTime);
      modulator.stop(startTime + config.duration);
    }

    // ADSR envelope
    const attack = config.attack || 0.01;
    const decay = config.decay || 0.1;
    const sustain = config.sustain || 0.7;
    const release = config.release || 0.1;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(config.volume * sustain, startTime + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration + release);
  }, [enabled]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled || !audioContextRef.current) {
      initAudio();
      return;
    }

    const ctx = audioContextRef.current;
    const config = SOUND_CONFIGS[type];
    
    if (Array.isArray(config)) {
      // Play sequence of notes
      let time = ctx.currentTime;
      config.forEach((note) => {
        playNote(note, time);
        time += note.duration;
      });
    } else {
      playNote(config, ctx.currentTime);
    }
  }, [enabled, playNote, initAudio]);

  // Continuous ambient sound (footsteps while running)
  const startAmbient = useCallback((type: "footsteps") => {
    if (!enabled || !audioContextRef.current) return null;

    const intervalId = setInterval(() => {
      playSound(type);
    }, 300);

    return intervalId;
  }, [enabled, playSound]);

  const stopAmbient = useCallback((intervalId: ReturnType<typeof setInterval> | null) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }, []);

  return {
    playSound,
    startAmbient,
    stopAmbient,
    isReady,
    initAudio,
  };
}
