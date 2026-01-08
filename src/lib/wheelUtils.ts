import type { WheelItem, SpinSpeed, SpeedConfig } from '@/types/wheel';

export const SEGMENT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B500', // Orange
  '#00CED1', // Dark Cyan
];

export const SPEED_CONFIGS: Record<SpinSpeed, SpeedConfig> = {
  slow: {
    initialVelocity: 0.25,
    friction: 0.96,
    minRotations: 2,
    maxRotations: 3,
  },
  medium: {
    initialVelocity: 0.35,
    friction: 0.97,
    minRotations: 3,
    maxRotations: 5,
  },
  fast: {
    initialVelocity: 0.5,
    friction: 0.975,
    minRotations: 4,
    maxRotations: 6,
  },
};

export const STORAGE_KEY = 'wheel-of-learning';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getSegmentColor(index: number): string {
  return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
}

export function parseQuestions(text: string, existingItems: WheelItem[] = []): WheelItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((question, index) => {
      // Preserve ID if question already exists
      const existing = existingItems.find((item) => item.question === question);
      return {
        id: existing?.id ?? generateId(),
        question,
        color: getSegmentColor(index),
      };
    });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function getSelectedItem(
  rotation: number,
  items: WheelItem[]
): WheelItem | null {
  if (items.length === 0) return null;

  const segmentAngle = (2 * Math.PI) / items.length;

  // Normalize rotation to 0-2PI
  const normalizedRotation =
    ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // The pointer is at the top (12 o'clock = -PI/2 in canvas coordinates)
  // We need to find which segment is under the pointer
  const pointerAngle =
    ((Math.PI * 3) / 2 - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
  const segmentIndex = Math.floor(pointerAngle / segmentAngle);

  return items[segmentIndex % items.length];
}

export function calculateInitialVelocity(speed: SpinSpeed): number {
  const config = SPEED_CONFIGS[speed];
  const rotations =
    config.minRotations +
    Math.random() * (config.maxRotations - config.minRotations);
  return rotations * 0.1 + config.initialVelocity;
}
