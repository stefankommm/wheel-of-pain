export interface WheelItem {
  id: string;
  question: string;
  color: string;
}

export interface WheelConfig {
  id: string;
  name: string;
  items: WheelItem[];
}

export type SpinSpeed = 'slow' | 'medium' | 'fast';

export interface SpeedConfig {
  initialVelocity: number;
  friction: number;
  minRotations: number;
  maxRotations: number;
}

export interface WheelExportData {
  version: string;
  wheel: WheelConfig;
}
