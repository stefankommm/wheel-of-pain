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
    if (now - lastTickRef.current < 25) return;
    lastTickRef.current = now;

    try {
      const ctx = initAudio();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a punchy "click" sound like a wheel hitting a peg
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // High-pitched click
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1800 + Math.random() * 400, ctx.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);

      // Bandpass filter for that wooden "tick" feel
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 2;

      // Sharp attack, quick decay
      clickGain.gain.setValueAtTime(0.25, ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      clickOsc.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(ctx.currentTime);
      clickOsc.stop(ctx.currentTime + 0.06);

      // Add a subtle low "thump" for body
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();

      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(150, ctx.currentTime);
      thumpOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

      thumpGain.gain.setValueAtTime(0.15, ctx.currentTime);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      thumpOsc.start(ctx.currentTime);
      thumpOsc.stop(ctx.currentTime + 0.04);
    } catch (error) {
      console.error('Error playing tick sound:', error);
    }
  }, [initAudio]);

  return { playTick, initAudio };
}
