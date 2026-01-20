export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: any;
  tags: string[];
  accentColor: string;
}

export enum GameState {
  CONFIG = 'CONFIG',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  PENDING = 'PENDING', // Waiting for input
  FINISHED = 'FINISHED',
}

export interface SoundCounterSettings {
  threshold: number;
  cooldown: number;
}

export interface ColorsSettings {
  intervalMs: number;
  limitSteps: number;
  playSound: boolean;
  soundControlMode: boolean;
  totalDurationSec: number;
  useSoundCounter: boolean;
  soundThreshold: number;
  soundCooldown: number;
  selectedDeviceId: string;
  isInfinite?: boolean;
}

export interface ChainCalcSettings {
  speed: number;
  steps: number;
  fontSize: number;
  playBeep: boolean;
}

export interface TimerSequence {
  id: string;
  name: string;
  segments: { duration: number; label: string }[];
}

export interface IntervalSettings {
  interval: number;
  limit: number | null;
  volumeBoost: boolean;
}

export interface CapitalsSettings {
  speed: number;
  steps: number;
}
