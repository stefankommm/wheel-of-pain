import { useRef, useEffect, useCallback } from 'react';
import type { WheelItem, SpinSpeed } from '@/types/wheel';
import { truncateText } from '@/lib/wheelUtils';
import { useWheelAnimation } from '@/hooks/useWheelAnimation';
import { useWheelSound } from '@/hooks/useWheelSound';

interface WheelCanvasProps {
  items: WheelItem[];
  speed: SpinSpeed;
  onSpinComplete: (item: WheelItem) => void;
  completedCount?: number;
  lastCompletedTask?: string;
  onRestart?: () => void;
}

const WHEEL_COLORS = [
  '#e74c3c',
  '#9b59b6',
  '#3498db',
  '#1abc9c',
  '#2ecc71',
  '#f1c40f',
  '#e67e22',
  '#34495e',
  '#16a085',
  '#c0392b',
];

export function WheelCanvas({ items, speed, onSpinComplete, completedCount = 0, lastCompletedTask, onRestart }: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playTick, initAudio } = useWheelSound();

  const { rotation, isSpinning, spin } = useWheelAnimation({
    items,
    speed,
    onTick: playTick,
    onSpinComplete,
  });

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      const centerX = size / 2;
      const centerY = size / 2;
      const outerRadius = size / 2 - 40;
      const innerRadius = 40;

      ctx.clearRect(0, 0, size, size);

      if (items.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (completedCount > 0 && lastCompletedTask) {
          // Draw text above center button area
          ctx.fillStyle = '#2ecc71';
          ctx.font = '600 16px Outfit, sans-serif';
          ctx.fillText('Nice. NOW', centerX, centerY - 85);
          ctx.fillStyle = '#fff';
          ctx.font = '700 18px Outfit, sans-serif';
          ctx.fillText(`${lastCompletedTask} 🚿`, centerX, centerY - 60);
        } else if (completedCount > 0) {
          ctx.fillStyle = '#2ecc71';
          ctx.font = '700 20px Outfit, sans-serif';
          ctx.fillText('Nice. NOW TAKE A SHOWER 🚿', centerX, centerY - 70);
        } else {
          ctx.fillStyle = '#666';
          ctx.font = '500 15px Outfit, sans-serif';
          ctx.fillText('Add questions to spin', centerX, centerY - 70);
        }

        drawCenter(ctx, centerX, centerY, innerRadius, false);
        drawPointer(ctx, centerX, 35);
        return;
      }

      const segmentAngle = (2 * Math.PI) / items.length;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Draw segments
      items.forEach((item, index) => {
        const startAngle = index * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;
        const color = WHEEL_COLORS[index % WHEEL_COLORS.length];

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // White divider line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(startAngle) * outerRadius,
          Math.sin(startAngle) * outerRadius
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);

        const fontSize = items.length > 12 ? 10 : items.length > 8 ? 11 : 13;
        ctx.font = `600 ${fontSize}px Outfit, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const maxChars = items.length > 10 ? 10 : items.length > 6 ? 14 : 18;
        const text = truncateText(item.question, maxChars);

        // Black outline for readability
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, outerRadius - 15, 0);

        ctx.fillStyle = '#fff';
        ctx.fillText(text, outerRadius - 15, 0);
        ctx.restore();
      });

      ctx.restore();

      // Pegs
      const pegCount = Math.max(items.length, 8);
      for (let i = 0; i < pegCount; i++) {
        const angle = (i * (2 * Math.PI)) / pegCount + rotation - Math.PI / 2;
        const px = centerX + Math.cos(angle) * (outerRadius + 2);
        const py = centerY + Math.sin(angle) * (outerRadius + 2);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#c9a227';
        ctx.fill();
        ctx.strokeStyle = '#8b7117';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      drawCenter(ctx, centerX, centerY, innerRadius, true);
      drawPointer(ctx, centerX, 35);
    },
    [items, rotation, completedCount, lastCompletedTask]
  );

  const drawCenter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    active: boolean
  ) => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#444';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();

    // Button
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = active ? '#e74c3c' : '#333';
    ctx.fill();

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', x, y);
  };

  const drawPointer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#a93226';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height, 600);
      const scale = window.devicePixelRatio || 1;

      canvas.width = size * scale;
      canvas.height = size * scale;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        drawWheel(ctx, size);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawWheel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(canvas.width, canvas.height) / (window.devicePixelRatio || 1);
    ctx.save();
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    drawWheel(ctx, size);
    ctx.restore();
  }, [rotation, items, drawWheel]);

  const handleClick = () => {
    if (isSpinning || items.length < 1) return;
    initAudio();
    spin();
  };

  const showRestartButton = items.length === 0 && completedCount > 0 && onRestart;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`${items.length >= 1 && !isSpinning ? 'cursor-pointer' : ''} ${isSpinning ? 'cursor-wait' : ''}`}
      />
      {showRestartButton && (
        <button
          onClick={onRestart}
          className="absolute top-[60%] left-1/2 -translate-x-1/2 px-6 py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold rounded-lg transition-colors"
        >
          Restart
        </button>
      )}
    </div>
  );
}
