import { HandDetectionResult, CameraSettings } from './types';

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private cameraSettings: CameraSettings;
  private lastRenderTime = 0;
  private frameCount = 0;

  constructor(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    cameraSettings: CameraSettings
  ) {
    this.canvas = canvas;
    this.video = video;
    this.cameraSettings = cameraSettings;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = ctx;
    
    console.log('[VideoRenderer] Initialized with settings:', cameraSettings);
  }

  updateSettings(settings: CameraSettings): void {
    this.cameraSettings = settings;
    console.log('[VideoRenderer] Settings updated:', settings);
  }

  render(detectionResult: HandDetectionResult, activeLane: "left" | "center" | "right" | null): void {
    const now = performance.now();
    this.frameCount++;
    
    // Log FPS occasionally
    if (this.frameCount % 60 === 0) {
      const fps = this.frameCount / ((now - this.lastRenderTime) / 1000);
      console.log('[VideoRenderer] FPS:', Math.round(fps));
      this.frameCount = 0;
      this.lastRenderTime = now;
    }

    // Clear and draw video frame
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    // Draw overlay grid and lane indicators
    this.drawOverlayGrid(activeLane);
    
    // Draw hand landmarks if available
    if (detectionResult.landmarks && detectionResult.landmarks.length > 0) {
      this.drawHandLandmarks(detectionResult.landmarks);
      console.log('[VideoRenderer] Drew', detectionResult.landmarks.length, 'landmarks');
    }
  }

  private drawOverlayGrid(activeLane: "left" | "center" | "right" | null): void {
    const { width: w, height: h } = this.canvas;
    
    this.ctx.save();
    
    // Semi-transparent overlay
    this.ctx.globalAlpha = 0.08;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.globalAlpha = 1;
    
    // Lane dividers
    this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 3, 0);
    this.ctx.lineTo(w / 3, h);
    this.ctx.moveTo((2 * w) / 3, 0);
    this.ctx.lineTo((2 * w) / 3, h);
    this.ctx.stroke();
    
    // Highlight active lane
    if (activeLane) {
      this.ctx.globalAlpha = 0.3;
      let laneColor = "#00FF00"; // default green
      let laneX = 0;
      let laneWidth = w / 3;
      
      switch (activeLane) {
        case "left":
          laneColor = "#00FF00"; // green
          laneX = 0;
          break;
        case "center":
          laneColor = "#FFFF00"; // yellow
          laneX = w / 3;
          break;
        case "right":
          laneColor = "#FF0000"; // red
          laneX = (2 * w) / 3;
          break;
      }
      
      this.ctx.fillStyle = laneColor;
      this.ctx.fillRect(laneX, 0, laneWidth, h);
      this.ctx.globalAlpha = 1;
    }
    
    this.ctx.restore();
  }

  private drawHandLandmarks(landmarks: Array<{ x: number; y: number; z?: number }>): void {
    const { width: w, height: h } = this.canvas;
    
    this.ctx.save();
    this.ctx.strokeStyle = "#00FF00";
    this.ctx.fillStyle = "#00FF00";
    this.ctx.lineWidth = 2;

    // Hand skeleton connections (MediaPipe standard)
    const connections: Array<[number, number]> = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
    ];

    // Draw connections
    this.ctx.beginPath();
    connections.forEach(([startIdx, endIdx]) => {
      if (startIdx < landmarks.length && endIdx < landmarks.length) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        this.ctx.moveTo(start.x * w, start.y * h);
        this.ctx.lineTo(end.x * w, end.y * h);
      }
    });
    this.ctx.stroke();

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      this.ctx.beginPath();
      this.ctx.arc(landmark.x * w, landmark.y * h, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Optionally draw landmark numbers for debugging
      if (index === 0 || index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(index.toString(), landmark.x * w + 6, landmark.y * h - 6);
        this.ctx.fillStyle = "#00FF00";
      }
    });
    
    this.ctx.restore();
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    console.log('[VideoRenderer] Canvas resized to:', width, 'x', height);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}