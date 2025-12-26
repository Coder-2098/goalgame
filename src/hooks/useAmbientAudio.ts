/**
 * useAmbientAudio - Continuous background music with intensity-based dynamics
 * Each theme has unique sound character that responds to game state
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { ThemeType } from "@/config/game";
import { IntensityLevel } from "./useGameLoop";
import { INTENSITY_CONFIGS } from "@/config/game/intensity.config";

interface AudioNodes {
  context: AudioContext;
  masterGain: GainNode;
  filter: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
}

interface ThemeAudioConfig {
  baseFreq: number;
  scale: number[];
  waveform: OscillatorType;
  bassFreq: number;
  style: "rhythmic" | "ambient" | "action" | "tension";
  beatPattern: number[];
}

const THEME_AUDIO_CONFIGS: Record<ThemeType, ThemeAudioConfig> = {
  forest: {
    baseFreq: 220,
    scale: [0, 2, 4, 5, 7, 9, 11, 12], // Major scale - uplifting
    waveform: "sawtooth",
    bassFreq: 55,
    style: "rhythmic",
    beatPattern: [1, 0, 1, 0, 1, 1, 0, 1], // Running rhythm
  },
  coding: {
    baseFreq: 330,
    scale: [0, 3, 5, 7, 10, 12], // Minor pentatonic - techy
    waveform: "square",
    bassFreq: 65,
    style: "ambient",
    beatPattern: [1, 0, 0, 1, 0, 0, 1, 0], // Data pulse
  },
  ninja: {
    baseFreq: 196,
    scale: [0, 2, 3, 5, 7, 8, 10, 12], // Minor scale - dramatic
    waveform: "triangle",
    bassFreq: 49,
    style: "action",
    beatPattern: [1, 1, 0, 1, 1, 0, 1, 0], // Combat rhythm
  },
  agent: {
    baseFreq: 262,
    scale: [0, 1, 4, 5, 7, 8, 11, 12], // Harmonic minor - suspense
    waveform: "sine",
    bassFreq: 58,
    style: "tension",
    beatPattern: [1, 0, 0, 0, 1, 0, 0, 0], // Heartbeat
  },
};

export function useAmbientAudio(
  theme: ThemeType,
  enabled: boolean = true,
  isActive: boolean = true,
  intensity: IntensityLevel = "low"
) {
  const audioNodesRef = useRef<AudioNodes | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const beatIndexRef = useRef(0);
  const sequenceIndexRef = useRef(0);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (audioNodesRef.current) return audioNodesRef.current;

    try {
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      filter.Q.value = 1;
      
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      
      filter.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(context.destination);
      
      audioNodesRef.current = { context, masterGain, filter, compressor };
      return audioNodesRef.current;
    } catch (e) {
      console.warn("Web Audio not supported");
      return null;
    }
  }, []);

  // Play a melodic note
  const playNote = useCallback((
    nodes: AudioNodes,
    frequency: number,
    duration: number,
    volume: number,
    waveform: OscillatorType,
    delay: number = 0
  ) => {
    const { context, filter } = nodes;
    const now = context.currentTime + delay;

    const osc = context.createOscillator();
    const noteGain = context.createGain();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(frequency, now);
    
    // ADSR envelope
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.7, now + duration * 0.3);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(noteGain);
    noteGain.connect(filter);
    
    osc.start(now);
    osc.stop(now + duration);
  }, []);

  // Play bass note
  const playBass = useCallback((
    nodes: AudioNodes,
    frequency: number,
    duration: number,
    volume: number
  ) => {
    const { context, filter } = nodes;
    const now = context.currentTime;

    const osc = context.createOscillator();
    const bassGain = context.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(bassGain);
    bassGain.connect(filter);
    
    osc.start(now);
    osc.stop(now + duration);
  }, []);

  // Main beat/sequence player
  const playBeat = useCallback((config: ThemeAudioConfig, nodes: AudioNodes, intensityConfig: typeof INTENSITY_CONFIGS["low"]) => {
    const { baseFreq, scale, waveform, bassFreq, beatPattern, style } = config;
    const beatActive = beatPattern[beatIndexRef.current % beatPattern.length];
    const noteVolume = intensityConfig.audioVolume * 0.3;
    
    // Update filter based on intensity
    nodes.filter.frequency.setTargetAtTime(
      intensityConfig.audioFilterFreq,
      nodes.context.currentTime,
      0.1
    );

    if (beatActive) {
      // Play bass on downbeat
      if (beatIndexRef.current % 4 === 0) {
        playBass(nodes, bassFreq, 0.4, noteVolume * 1.2);
      }

      // Style-specific patterns
      switch (style) {
        case "rhythmic": // Forest - running music
          const runNote = scale[sequenceIndexRef.current % scale.length];
          playNote(nodes, baseFreq * Math.pow(2, runNote / 12), 0.15, noteVolume, waveform);
          if (beatIndexRef.current % 2 === 0) {
            playNote(nodes, baseFreq * 2 * Math.pow(2, runNote / 12), 0.08, noteVolume * 0.5, "sine", 0.08);
          }
          break;

        case "ambient": // Coding - data sounds
          const codeNote = scale[(sequenceIndexRef.current * 3) % scale.length];
          playNote(nodes, baseFreq * Math.pow(2, codeNote / 12), 0.3, noteVolume * 0.7, waveform);
          // Blips
          if (Math.random() > 0.6) {
            playNote(nodes, baseFreq * 4, 0.05, noteVolume * 0.3, "square", Math.random() * 0.2);
          }
          break;

        case "action": // Ninja - combat music
          const ninjaNote = scale[sequenceIndexRef.current % scale.length];
          playNote(nodes, baseFreq * Math.pow(2, ninjaNote / 12), 0.12, noteVolume, waveform);
          // Percussion hits
          if (beatIndexRef.current % 2 === 1) {
            const hitOsc = nodes.context.createOscillator();
            const hitGain = nodes.context.createGain();
            hitOsc.type = "sawtooth";
            hitOsc.frequency.setValueAtTime(100, nodes.context.currentTime);
            hitOsc.frequency.exponentialRampToValueAtTime(50, nodes.context.currentTime + 0.1);
            hitGain.gain.setValueAtTime(noteVolume * 0.5, nodes.context.currentTime);
            hitGain.gain.exponentialRampToValueAtTime(0.001, nodes.context.currentTime + 0.1);
            hitOsc.connect(hitGain);
            hitGain.connect(nodes.filter);
            hitOsc.start();
            hitOsc.stop(nodes.context.currentTime + 0.1);
          }
          break;

        case "tension": // Agent - suspense
          const agentNote = scale[(sequenceIndexRef.current * 2) % scale.length];
          playNote(nodes, baseFreq * Math.pow(2, agentNote / 12), 0.5, noteVolume * 0.6, waveform);
          // Tension pad
          if (beatIndexRef.current % 8 === 0) {
            playNote(nodes, baseFreq * 0.5, 2, noteVolume * 0.3, "sine");
          }
          break;
      }
      
      sequenceIndexRef.current++;
    }

    beatIndexRef.current++;
  }, [playNote, playBass]);

  // Start audio playback
  const startAudio = useCallback(() => {
    const nodes = initAudio();
    if (!nodes) return;

    // Resume context if suspended
    if (nodes.context.state === "suspended") {
      nodes.context.resume();
    }

    const config = THEME_AUDIO_CONFIGS[theme];
    const intensityConfig = INTENSITY_CONFIGS[intensity];
    
    // Fade in
    nodes.masterGain.gain.setTargetAtTime(intensityConfig.audioVolume, nodes.context.currentTime, 0.3);
    
    // Calculate beat interval from tempo
    const beatInterval = 60000 / intensityConfig.audioTempo / 2; // 8th notes
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start beat loop
    intervalRef.current = setInterval(() => {
      if (audioNodesRef.current) {
        playBeat(config, audioNodesRef.current, intensityConfig);
      }
    }, beatInterval);
    
    setIsPlaying(true);
  }, [theme, intensity, initAudio, playBeat]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (audioNodesRef.current) {
      audioNodesRef.current.masterGain.gain.setTargetAtTime(0, audioNodesRef.current.context.currentTime, 0.5);
    }
    
    setIsPlaying(false);
  }, []);

  // Handle enabled/active state changes
  useEffect(() => {
    if (enabled && isActive) {
      startAudio();
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
  }, [enabled, isActive, startAudio, stopAudio]);

  // Update tempo/volume when intensity changes
  useEffect(() => {
    if (!isPlaying || !audioNodesRef.current) return;
    
    const intensityConfig = INTENSITY_CONFIGS[intensity];
    const config = THEME_AUDIO_CONFIGS[theme];
    
    // Update master volume
    audioNodesRef.current.masterGain.gain.setTargetAtTime(
      intensityConfig.audioVolume,
      audioNodesRef.current.context.currentTime,
      0.2
    );
    
    // Restart with new tempo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const beatInterval = 60000 / intensityConfig.audioTempo / 2;
    intervalRef.current = setInterval(() => {
      if (audioNodesRef.current) {
        playBeat(config, audioNodesRef.current, intensityConfig);
      }
    }, beatInterval);
  }, [intensity, theme, isPlaying, playBeat]);

  // Reinitialize on user interaction (for browsers that block autoplay)
  useEffect(() => {
    const handleInteraction = () => {
      if (enabled && isActive && audioNodesRef.current?.context.state === "suspended") {
        audioNodesRef.current.context.resume();
        startAudio();
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [enabled, isActive, startAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioNodesRef.current) {
        audioNodesRef.current.context.close();
        audioNodesRef.current = null;
      }
    };
  }, []);

  return {
    isPlaying,
    startAudio,
    stopAudio,
  };
}
