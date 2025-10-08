// Shared types for hand detection and rendering
export interface HandDetectionResult {
  normalizedX: number;
  normalizedY: number;
  lane: "left" | "center" | "right" | null;
  isClosed: boolean;
  landmarks?: Array<{ x: number; y: number; z?: number }>;
  confidence?: number;
}

export interface CameraSettings {
  width: number;
  height: number;
  isMirrored: boolean;
}

export interface DetectionConfig {
  maxNumHands: number;
  modelComplexity: number;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
  targetFPS: number;
  debounceMs: number;
}

export type OnHandDetected = (result: HandDetectionResult) => void;