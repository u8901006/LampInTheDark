// components/sound-bath/sound-bath-context.tsx

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { CHAKRAS, STORAGE_KEY, FADE_IN_DURATION, FADE_OUT_DURATION, MAX_DELAY_SECONDS } from '@/lib/sound-bath/constants';
import type { SoundBathState, Chakra, AudioTrack } from '@/lib/sound-bath/types';
import { DEFAULT_STATE } from '@/lib/sound-bath/types';

interface SoundBathContextValue extends SoundBathState {
  audioContext: AudioContext | null;
  isExpanded: boolean;
  tracks: Map<string, AudioTrack>;
  togglePlay: () => void;
  setDensity: (value: number) => void;
  setRandomness: (value: number) => void;
  setMasterVolume: (value: number) => void;
  toggleChakra: (chakraId: string) => void;
  toggleExpanded: () => void;
  initAudioContext: () => void;
}

const SoundBathContext = createContext<SoundBathContextValue | null>(null);

export function SoundBathProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SoundBathState>(DEFAULT_STATE);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const tracksRef = useRef<Map<string, AudioTrack>>(new Map());
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  const loadBuffers = useCallback(async () => {
    if (!audioContext) return;

    for (const chakra of CHAKRAS) {
      if (!buffersRef.current.has(chakra.id)) {
        try {
          const response = await fetch(chakra.audioFile);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await audioContext.decodeAudioData(arrayBuffer);
          buffersRef.current.set(chakra.id, buffer);
        } catch (err) {
          console.warn(`Failed to load ${chakra.audioFile}:`, err);
        }
      }
    }
  }, [audioContext]);

  const playTrack = useCallback((chakra: Chakra, delay: number) => {
    const ctx = audioContext;
    const buffer = buffersRef.current.get(chakra.id);
    if (!ctx || !buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(
      (state.masterVolume / 100) * 0.3,
      ctx.currentTime + delay + FADE_IN_DURATION
    );

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(ctx.currentTime + delay);

    tracksRef.current.set(chakra.id, {
      chakra,
      source,
      gainNode,
      isPlaying: true,
    });
  }, [audioContext, state.masterVolume]);

  const stopAllTracks = useCallback(() => {
    const ctx = audioContext;
    if (!ctx) return;

    tracksRef.current.forEach((track) => {
      if (track.isPlaying && track.gainNode) {
        const currentTime = ctx.currentTime;
        track.gainNode.gain.linearRampToValueAtTime(0, currentTime + FADE_OUT_DURATION);
        setTimeout(() => {
          if (track.source) {
            track.source.stop();
            track.source.disconnect();
          }
          track.isPlaying = false;
        }, FADE_OUT_DURATION * 1000);
      }
    });

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    tracksRef.current.clear();
  }, [audioContext]);

  const startPlaying = useCallback(async () => {
    initAudioContext();
    
    if (audioContext?.state === 'suspended') {
      await audioContext.resume();
    }

    await loadBuffers();

    const selectedChakras = state.selectedChakras.length > 0
      ? CHAKRAS.filter(c => state.selectedChakras.includes(c.id))
      : CHAKRAS;

    const shuffled = [...selectedChakras].sort(() => Math.random() - 0.5);
    const toPlay = shuffled.slice(0, state.density);

    toPlay.forEach((chakra, index) => {
      const baseDelay = index * 0.5;
      const randomDelay = (state.randomness / 100) * Math.random() * MAX_DELAY_SECONDS;
      const delay = baseDelay + randomDelay;

      const timeout = setTimeout(() => {
        playTrack(chakra, 0);
      }, delay * 1000);

      timeoutsRef.current.push(timeout);
    });

    setState((prev) => ({ ...prev, isPlaying: true }));
  }, [audioContext, state.density, state.randomness, state.selectedChakras, initAudioContext, loadBuffers, playTrack]);

  const stopPlaying = useCallback(() => {
    stopAllTracks();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [stopAllTracks]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }, [state.isPlaying, startPlaying, stopPlaying]);

  const setDensity = useCallback((value: number) => {
    setState((prev) => ({ ...prev, density: value }));
  }, []);

  const setRandomness = useCallback((value: number) => {
    setState((prev) => ({ ...prev, randomness: value }));
  }, []);

  const setMasterVolume = useCallback((value: number) => {
    setState((prev) => ({ ...prev, masterVolume: value }));

    tracksRef.current.forEach((track) => {
      if (track.gainNode && audioContext) {
        track.gainNode.gain.linearRampToValueAtTime(
          (value / 100) * 0.3,
          audioContext.currentTime + 0.1
        );
      }
    });
  }, [audioContext]);

  const toggleChakra = useCallback((chakraId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedChakras.includes(chakraId);
      const newSelected = isSelected
        ? prev.selectedChakras.filter((id) => id !== chakraId)
        : [...prev.selectedChakras, chakraId];
      return { ...prev, selectedChakras: newSelected };
    });
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      stopAllTracks();
      audioContext?.close();
    };
  }, [stopAllTracks, audioContext]);

  return (
    <SoundBathContext.Provider
      value={{
        ...state,
        audioContext,
        isExpanded,
        tracks: tracksRef.current,
        togglePlay,
        setDensity,
        setRandomness,
        setMasterVolume,
        toggleChakra,
        toggleExpanded,
        initAudioContext,
      }}
    >
      {children}
    </SoundBathContext.Provider>
  );
}

export function useSoundBath() {
  const context = useContext(SoundBathContext);
  if (!context) {
    throw new Error('useSoundBath must be used within SoundBathProvider');
  }
  return context;
}
