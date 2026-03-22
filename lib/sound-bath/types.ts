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
