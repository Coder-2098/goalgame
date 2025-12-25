/**
 * Ambient Audio Hook - Continuous background music per theme
 * Uses Web Audio API for procedural audio generation
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeType } from "@/config/game";

interface AudioNodes {
  oscillators: OscillatorNode[];
  gainNodes: GainNode[];
  filters: BiquadFilterNode[];
}

// Theme-specific audio configurations
const THEME_AUDIO_CONFIGS: Record<ThemeType, {
  baseFrequency: number;
  tempo: number;
  waveform: OscillatorType;
  style: "rhythmic" | "ambient" | "tension" | "action";
  notes: number[];
  bassNotes: number[];
}> = {
  forest: {
    baseFrequency: 220, // A3
    tempo: 140, // Fast runner tempo
    waveform: "sine",
    style: "rhythmic",
    notes: [220, 261.63, 293.66, 329.63, 349.23, 392, 440], // A minor scale
    bassNotes: [110, 130.81, 146.83, 164.81],
  },
  coding: {
    baseFrequency: 330, // E4
    tempo: 120,
    waveform: "sawtooth",
    style: "ambient",
    notes: [329.63, 369.99, 415.30, 466.16, 523.25, 587.33], // Electronic/synth
    bassNotes: [82.41, 98, 110, 123.47],
  },
  ninja: {
    baseFrequency: 196, // G3
    tempo: 100,
    waveform: "triangle",
    style: "action",
    notes: [196, 220, 246.94, 293.66, 329.63, 392], // Japanese pentatonic
    bassNotes: [98, 110, 130.81, 146.83],
  },
  agent: {
    baseFrequency: 185, // F#3
    tempo: 110,
    waveform: "square",
    style: "tension",
    notes: [185, 220, 246.94, 277.18, 329.63, 369.99], // Spy/tension scale
    bassNotes: [92.5, 110, 123.47, 138.59],
  },
};

export function useAmbientAudio(theme: ThemeType, enabled: boolean, isActive: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<AudioNodes | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const noteIndexRef = useRef(0);
  const beatCountRef = useRef(0);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Play a note with envelope
  const playNote = useCallback((frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = "sine") => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);

    // ADSR envelope
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, now + duration * 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, []);

  // Play bass note
  const playBass = useCallback((frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, []);

  // Generate rhythm pattern based on theme style
  const playBeat = useCallback(() => {
    const config = THEME_AUDIO_CONFIGS[theme];
    beatCountRef.current++;
    
    const beatInMeasure = beatCountRef.current % 8;
    const noteIndex = noteIndexRef.current % config.notes.length;

    switch (config.style) {
      case "rhythmic": // Forest - Temple Run style
        // Driving rhythm
        if (beatInMeasure === 0 || beatInMeasure === 4) {
          playBass(config.bassNotes[beatCountRef.current % config.bassNotes.length], 0.3);
        }
        if (beatInMeasure % 2 === 0) {
          playNote(config.notes[noteIndex], 0.15, 0.08, "sine");
        }
        // Melodic accent on certain beats
        if (beatInMeasure === 2 || beatInMeasure === 6) {
          playNote(config.notes[(noteIndex + 2) % config.notes.length] * 2, 0.1, 0.05, "sine");
        }
        break;

      case "ambient": // Coding - Synth/futuristic
        if (beatInMeasure % 4 === 0) {
          playBass(config.bassNotes[beatCountRef.current % config.bassNotes.length], 0.5);
          playNote(config.notes[noteIndex], 0.4, 0.06, "sawtooth");
        }
        // Arpeggiated synth
        if (beatInMeasure % 2 === 1) {
          playNote(config.notes[(noteIndex + 1) % config.notes.length] * 1.5, 0.2, 0.04, "square");
        }
        break;

      case "action": // Ninja - Martial arts/dojo
        // Taiko-style rhythm
        if (beatInMeasure === 0) {
          playBass(config.bassNotes[0], 0.4);
          playNote(config.notes[0], 0.3, 0.1, "triangle");
        }
        if (beatInMeasure === 3 || beatInMeasure === 5) {
          playNote(config.notes[noteIndex], 0.15, 0.07, "triangle");
        }
        // Shamisen-style accent
        if (beatInMeasure === 7) {
          playNote(config.notes[(noteIndex + 3) % config.notes.length] * 2, 0.1, 0.05, "sawtooth");
        }
        break;

      case "tension": // Agent - Spy theme
        // James Bond-style tension
        if (beatInMeasure === 0 || beatInMeasure === 4) {
          playBass(config.bassNotes[beatCountRef.current % config.bassNotes.length], 0.4);
        }
        // Staccato spy notes
        if (beatInMeasure % 2 === 0) {
          playNote(config.notes[noteIndex], 0.1, 0.06, "square");
        }
        // Tension build
        if (beatInMeasure === 3) {
          playNote(config.notes[(noteIndex + 4) % config.notes.length], 0.2, 0.04, "sawtooth");
        }
        break;
    }

    // Advance note index for variety
    if (beatInMeasure === 7) {
      noteIndexRef.current = (noteIndexRef.current + 1) % config.notes.length;
    }
  }, [theme, playNote, playBass]);

  // Start ambient audio loop
  const startAudio = useCallback(() => {
    if (isPlaying || !enabled) return;

    const ctx = initAudio();
    if (!ctx) return;

    const config = THEME_AUDIO_CONFIGS[theme];
    const beatInterval = (60 / config.tempo) * 1000 / 2; // Eighth notes

    intervalRef.current = setInterval(playBeat, beatInterval);
    setIsPlaying(true);
  }, [enabled, initAudio, isPlaying, playBeat, theme]);

  // Stop ambient audio
  const stopAudio = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    noteIndexRef.current = 0;
    beatCountRef.current = 0;
  }, []);

  // Handle theme changes - restart audio with new theme
  useEffect(() => {
    if (isPlaying) {
      stopAudio();
      if (enabled && isActive) {
        // Small delay before restarting with new theme
        const timeout = setTimeout(startAudio, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [theme]);

  // Handle enabled/active state changes
  useEffect(() => {
    if (enabled && isActive && !isPlaying) {
      startAudio();
    } else if ((!enabled || !isActive) && isPlaying) {
      stopAudio();
    }
  }, [enabled, isActive, isPlaying, startAudio, stopAudio]);

  // Initialize on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      if (enabled && isActive) {
        startAudio();
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      stopAudio();
    };
  }, [enabled, isActive, initAudio, startAudio, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    startAudio,
    stopAudio,
  };
}
