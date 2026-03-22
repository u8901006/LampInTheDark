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
