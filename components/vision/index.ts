// Export types
export * from './types';

// Export refactored modules
export { HandDetectionEngine } from './HandDetectionEngine';
export { VideoRenderer } from './VideoRenderer';
export { CameraController } from './CameraController';

// Export refactored component
export { default as HandCameraRefactored } from './HandCameraRefactored';

// Keep original component export for backward compatibility
export { default as HandCameraImpl } from './HandCameraImpl';