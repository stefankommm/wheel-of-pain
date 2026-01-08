import { useRef, useCallback } from 'react';

export function useWheelSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTickRef = useRef<number>(0);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTick = useCallback(() => {
    const now = Date.now();
    // Throttle ticks to prevent audio overload
    if (now - lastTickRef.current < 30) return;
    lastTickRef.current = now;

    try {
      const ctx = initAudio();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800 + Math.random() * 200;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.error('Error playing tick sound:', error);
    }
  }, [initAudio]);

  return { playTick, initAudio };
}
