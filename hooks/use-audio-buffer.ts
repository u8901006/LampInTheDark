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
