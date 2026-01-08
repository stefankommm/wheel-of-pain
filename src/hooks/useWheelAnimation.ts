import { useState, useRef, useCallback } from 'react';
import type { WheelItem, SpinSpeed } from '@/types/wheel';
import {
  SPEED_CONFIGS,
  getSelectedItem,
  calculateInitialVelocity,
} from '@/lib/wheelUtils';

const MIN_VELOCITY = 0.001;

interface UseWheelAnimationProps {
  items: WheelItem[];
  speed: SpinSpeed;
  onTick?: () => void;
  onSpinComplete?: (item: WheelItem) => void;
}

export function useWheelAnimation({
  items,
  speed,
  onTick,
  onSpinComplete,
}: UseWheelAnimationProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const lastSegmentRef = useRef(-1);

  const spin = useCallback(() => {
    if (isSpinning || items.length < 1) return;

    setIsSpinning(true);
    velocityRef.current = calculateInitialVelocity(speed);
    const friction = SPEED_CONFIGS[speed].friction;
    const segmentAngle = (2 * Math.PI) / items.length;

    const animate = () => {
      if (velocityRef.current > MIN_VELOCITY) {
        velocityRef.current *= friction;
        rotationRef.current += velocityRef.current;

        // Check if we crossed a segment boundary for tick sound
        const currentSegment = Math.floor(rotationRef.current / segmentAngle);
        if (currentSegment !== lastSegmentRef.current) {
          lastSegmentRef.current = currentSegment;
          onTick?.();
        }

        setRotation(rotationRef.current);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Spin complete
        setIsSpinning(false);
        const selectedItem = getSelectedItem(rotationRef.current, items);
        if (selectedItem && onSpinComplete) {
          onSpinComplete(selectedItem);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, items, speed, onTick, onSpinComplete]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsSpinning(false);
  }, []);

  return {
    rotation,
    isSpinning,
    spin,
    stop,
  };
}
