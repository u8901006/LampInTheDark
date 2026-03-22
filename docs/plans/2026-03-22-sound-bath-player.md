# Sound Bath Player Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a floating sound bath player to the site with 7 chakra singing bowl sounds, allowing users to control density, randomness, and volume while browsing.

**Architecture:** Pure frontend Web Audio API implementation. Audio files stored in `/public/sounds/`. React Context manages playback state. Floating button in bottom-right corner expands to control panel.

**Tech Stack:** Web Audio API, React Context, TypeScript, localStorage

---

## Pre-requisite: Audio Files

Before implementation, we need 7 real singing bowl recordings (CC0 or commercial license).

**Files needed in `public/sounds/`:**
- `root-396.mp3` - Root chakra (396 Hz)
- `sacral-417.mp3` - Sacral chakra (417 Hz)
- `solar-528.mp3` - Solar Plexus (528 Hz)
- `heart-639.mp3` - Heart chakra (639 Hz)
- `throat-741.mp3` - Throat chakra (741 Hz)
- `third-eye-852.mp3` - Third Eye (852 Hz)
- `crown-963.mp3` - Crown chakra (963 Hz)

**For development, we'll use placeholder empty files initially, then replace with real audio.**

---

## Task 1: Define Types and Constants

**Files:**
- Create: `lib/sound-bath/types.ts`
- Create: `lib/sound-bath/constants.ts`

**Step 1: Create types file**

```typescript
// lib/sound-bath/types.ts

export interface Chakra {
  id: string;
  name: string;
  nameZh: string;
  frequency: number;
  color: string;
  audioFile: string;
}

export interface SoundBathState {
  isPlaying: boolean;
  density: number;
  randomness: number;
  masterVolume: number;
  selectedChakras: string[];
}

export interface AudioTrack {
  chakra: Chakra;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  isPlaying: boolean;
}

export const DEFAULT_STATE: SoundBathState = {
  isPlaying: false,
  density: 3,
  randomness: 50,
  masterVolume: 70,
  selectedChakras: [],
};
```

**Step 2: Create constants file**

```typescript
// lib/sound-bath/constants.ts

import type { Chakra } from './types';

export const CHAKRAS: Chakra[] = [
  { id: 'root', name: 'Root', nameZh: '海底輪', frequency: 396, color: '#e53935', audioFile: '/sounds/root-396.mp3' },
  { id: 'sacral', name: 'Sacral', nameZh: '臍輪', frequency: 417, color: '#fb8c00', audioFile: '/sounds/sacral-417.mp3' },
  { id: 'solar', name: 'Solar Plexus', nameZh: '太陽輪', frequency: 528, color: '#fdd835', audioFile: '/sounds/solar-528.mp3' },
  { id: 'heart', name: 'Heart', nameZh: '心輪', frequency: 639, color: '#43a047', audioFile: '/sounds/heart-639.mp3' },
  { id: 'throat', name: 'Throat', nameZh: '喉輪', frequency: 741, color: '#1e88e5', audioFile: '/sounds/throat-741.mp3' },
  { id: 'third-eye', name: 'Third Eye', nameZh: '眉心輪', frequency: 852, color: '#5e35b1', audioFile: '/sounds/third-eye-852.mp3' },
  { id: 'crown', name: 'Crown', nameZh: '頂輪', frequency: 963, color: '#8e24aa', audioFile: '/sounds/crown-963.mp3' },
];

export const STORAGE_KEY = 'sound-bath-state';
export const FADE_IN_DURATION = 2;
export const FADE_OUT_DURATION = 3;
export const MAX_DELAY_SECONDS = 5;
```

**Step 3: Commit**

```bash
git add lib/sound-bath/types.ts lib/sound-bath/constants.ts
git commit -m "feat(sound-bath): add types and constants"
```

---

## Task 2: Create useAudioBuffer Hook

**Files:**
- Create: `hooks/use-audio-buffer.ts`

**Step 1: Create the hook**

```typescript
// hooks/use-audio-buffer.ts

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAudioBuffer(audioContext: AudioContext | null, src: string) {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBuffer = useCallback(async () => {
    if (!audioContext || !src) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Failed to load ${src}`);

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setBuffer(audioBuffer);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [audioContext, src]);

  useEffect(() => {
    loadBuffer();
  }, [loadBuffer]);

  return { buffer, isLoading, error, reload: loadBuffer };
}
```

**Step 2: Commit**

```bash
git add hooks/use-audio-buffer.ts
git commit -m "feat(sound-bath): add useAudioBuffer hook"
```

---

## Task 3: Create SoundBathContext

**Files:**
- Create: `components/sound-bath/sound-bath-context.tsx`

**Step 1: Create the context**

```typescript
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
```

**Step 2: Commit**

```bash
git add components/sound-bath/sound-bath-context.tsx
git commit -m "feat(sound-bath): add SoundBathContext with playback logic"
```

---

## Task 4: Create FloatingPlayer Component

**Files:**
- Create: `components/sound-bath/floating-player.tsx`

**Step 1: Create the component**

```typescript
// components/sound-bath/floating-player.tsx

'use client';

import { useSoundBath } from './sound-bath-context';
import { CHAKRAS } from '@/lib/sound-bath/constants';

export function FloatingPlayer() {
  const {
    isPlaying,
    isExpanded,
    density,
    randomness,
    masterVolume,
    selectedChakras,
    togglePlay,
    setDensity,
    setRandomness,
    setMasterVolume,
    toggleChakra,
    toggleExpanded,
  } = useSoundBath();

  return (
    <div style={styles.container}>
      {isExpanded && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.title}>聲浴</span>
            <button onClick={toggleExpanded} style={styles.closeBtn}>×</button>
          </div>

          <button
            onClick={togglePlay}
            style={{
              ...styles.playBtn,
              backgroundColor: isPlaying ? '#e53935' : '#1e88e5',
            }}
          >
            {isPlaying ? '停止' : '開始'}
          </button>

          <div style={styles.control}>
            <label style={styles.label}>層疊密度</label>
            <input
              type="range"
              min={1}
              max={7}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{density}</span>
          </div>

          <div style={styles.control}>
            <label style={styles.label}>隨機度</label>
            <input
              type="range"
              min={0}
              max={100}
              value={randomness}
              onChange={(e) => setRandomness(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{randomness}%</span>
          </div>

          <div style={styles.control}>
            <label style={styles.label}>音量</label>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{masterVolume}%</span>
          </div>

          <div style={styles.chakras}>
            <label style={styles.label}>脈輪選擇</label>
            <div style={styles.chakraGrid}>
              {CHAKRAS.map((chakra) => {
                const isSelected = selectedChakras.includes(chakra.id);
                return (
                  <button
                    key={chakra.id}
                    onClick={() => toggleChakra(chakra.id)}
                    style={{
                      ...styles.chakraBtn,
                      backgroundColor: isSelected ? chakra.color : 'transparent',
                      border: `2px solid ${chakra.color}`,
                      color: isSelected ? '#fff' : chakra.color,
                    }}
                    title={`${chakra.nameZh} - ${chakra.frequency}Hz`}
                  >
                    {chakra.nameZh}
                  </button>
                );
              })}
            </div>
          </div>

          <p style={styles.hint}>
            {selectedChakras.length === 0
              ? '已選全部 7 脈輪'
              : `已選 ${selectedChakras.length} 個脈輪`}
          </p>
        </div>
      )}

      <button
        onClick={toggleExpanded}
        style={{
          ...styles.fab,
          backgroundColor: isPlaying ? '#43a047' : '#616161',
        }}
        title="聲浴"
      >
        🕉
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  fab: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'background-color 0.3s',
  },
  panel: {
    width: '280px',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: 1,
  },
  playBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background-color 0.2s',
  },
  control: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  },
  slider: {
    width: 'calc(100% - 40px)',
    marginRight: '8px',
    accentColor: '#1e88e5',
  },
  value: {
    fontSize: '12px',
    color: '#fff',
    width: '32px',
    display: 'inline-block',
    textAlign: 'right',
  },
  chakras: {
    marginTop: '16px',
  },
  chakraGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  chakraBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hint: {
    fontSize: '11px',
    color: '#666',
    marginTop: '12px',
    textAlign: 'center',
  },
};
```

**Step 2: Commit**

```bash
git add components/sound-bath/floating-player.tsx
git commit -m "feat(sound-bath): add FloatingPlayer UI component"
```

---

## Task 5: Add SoundBathProvider to Layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add provider and component**

Wrap the app with `SoundBathProvider` and include `FloatingPlayer`.

```typescript
// app/layout.tsx
// Add these imports:
import { SoundBathProvider } from '@/components/sound-bath/sound-bath-context';
import { FloatingPlayer } from '@/components/sound-bath/floating-player';

// Wrap children with SoundBathProvider and add FloatingPlayer:
// <SoundBathProvider>
//   {children}
//   <FloatingPlayer />
// </SoundBathProvider>
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(sound-bath): integrate into app layout"
```

---

## Task 6: Add Placeholder Audio Files

**Files:**
- Create: `public/sounds/.gitkeep`

**Step 1: Create directory and placeholder**

```bash
mkdir -p public/sounds
touch public/sounds/.gitkeep
```

**Step 2: Commit**

```bash
git add public/sounds/.gitkeep
git commit -m "chore(sound-bath): add sounds directory placeholder"
```

---

## Task 7: Run Tests and Verify

**Step 1: Run existing tests**

```bash
npm run test
```

Expected: All tests pass

**Step 2: Start dev server and test manually**

```bash
npm run dev
```

Test:
1. Click the floating button (should expand)
2. Click "開始" (should try to load audio - will fail without real files)
3. Verify UI controls work (sliders, chakra buttons)
4. Check localStorage persistence

**Step 3: Commit any fixes**

---

## Post-Implementation: Add Real Audio Files

After the code is complete, replace placeholder with real CC0 singing bowl recordings.

**Sources to check:**
- Freesound.org (CC0 license)
- Pixabay Audio
- Record your own

**File requirements:**
- MP3 format
- 300-500 KB per file
- Loopable (no abrupt end)
- CC0 or commercial license
