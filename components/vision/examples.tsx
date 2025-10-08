// Example usage of the refactored hand detection system
import React from 'react';
import { HandCameraRefactored, HandDetectionResult } from './index';

export function HandDetectionDemo() {
  const handleHandDetected = (result: HandDetectionResult) => {
    console.log('Demo - Hand detected:', {
      position: `(${result.normalizedX.toFixed(3)}, ${result.normalizedY.toFixed(3)})`,
      lane: result.lane,
      isClosed: result.isClosed,
      confidence: result.confidence,
      landmarkCount: result.landmarks?.length || 0
    });
  };

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-bold mb-4">Hand Detection Demo</h2>
      <HandCameraRefactored
        onHandDetected={handleHandDetected}
        width={640}
        height={480}
      />
    </div>
  );
}

// Example of using individual modules for custom implementations
import { 
  HandDetectionEngine, 
  VideoRenderer, 
  CameraController, 
  DetectionConfig 
} from './index';

export class CustomHandDetectionSystem {
  private detectionEngine: HandDetectionEngine;
  private renderer!: VideoRenderer;
  private camera: CameraController;

  constructor(config: DetectionConfig) {
    this.detectionEngine = new HandDetectionEngine(config);
    this.camera = new CameraController();
  }

  async initialize(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    // Step 1: Setup camera
    const cameraResult = await this.camera.initializeCamera(video);
    if (!cameraResult) return false;

    // Step 2: Setup renderer
    this.renderer = new VideoRenderer(canvas, video, {
      width: canvas.width,
      height: canvas.height,
      isMirrored: cameraResult.isMirrored
    });

    // Step 3: Initialize detection
    const success = await this.detectionEngine.initialize(video);
    if (!success) return false;

    // Step 4: Start detection with custom callback
    this.detectionEngine.startDetection(
      video,
      { width: canvas.width, height: canvas.height, isMirrored: cameraResult.isMirrored },
      (result) => {
        // Custom processing logic here
        this.processDetection(result);
        
        // Render frame
        this.renderer.render(result, result.lane);
      }
    );

    return true;
  }

  private processDetection(result: HandDetectionResult) {
    // Add your custom detection processing logic here
    // For example: gesture recognition, hand tracking, etc.
    
    if (result.lane) {
      console.log('Custom system - Hand in lane:', result.lane);
    }
    
    if (result.isClosed) {
      console.log('Custom system - Hand is closed (fist detected)');
    }
  }

  cleanup() {
    this.detectionEngine.cleanup();
    this.camera.stopCamera();
  }
}